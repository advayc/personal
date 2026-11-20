import { createClient } from "@redis/client";
import type { Visit } from "./shared";

const NAMESPACE = "portfolio:visits:v1";
const VISITS_KEY = `${NAMESPACE}:events`;
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_VISITS = 2_000;

function redisUrl() {
  return process.env.VISITS_REDIS_URL ||
    (process.env.VERCEL_ENV === "production" ? process.env.REDIS_URL : undefined);
}

export function hasVisitStore() {
  return Boolean(redisUrl());
}

function openClient(url: string) {
  const connection = createClient({
    url,
    RESP: 2,
    disableOfflineQueue: true,
    commandsQueueMaxLength: 128,
    socket: { connectTimeout: 1_500, reconnectStrategy: false },
  });
  connection.on("error", () => { /* Command failures are handled by the request. */ });
  return connection;
}

type VisitClient = ReturnType<typeof openClient>;
let client: VisitClient | undefined;
let connecting: Promise<VisitClient> | undefined;

async function redis() {
  if (client?.isReady) return client;
  if (connecting) return connecting;

  const url = redisUrl();
  if (!url) throw new Error("Visit storage is not configured");
  const next = openClient(url);
  connecting = next.connect().then(() => {
    client = next;
    return next;
  }).finally(() => { connecting = undefined; });
  return connecting;
}

// Upstash locks only the declared keys when a script opts in; stock Redis rejects the flag.
const KEY_LOCKING = "#!lua flags=allow-key-locking\n";
const RECORD_VISIT = `
local count = redis.call('INCR', KEYS[2])
if count == 1 then redis.call('EXPIRE', KEYS[2], 600) end
if count > 90 then return 0 end

redis.call('ZADD', KEYS[1], ARGV[5], ARGV[1])
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[2])
redis.call('ZREMRANGEBYRANK', KEYS[1], 0, -tonumber(ARGV[3]) - 1)
redis.call('EXPIRE', KEYS[1], ARGV[4])
return 1
`;

export async function recordVisit(visit: Visit, bucket: string) {
  const db = await redis();
  await db.sendCommand([
    "EVAL", (/\.upstash\.io(:|\/|$)/.test(redisUrl() ?? "") ? KEY_LOCKING : "") + RECORD_VISIT.trimStart(), "2", VISITS_KEY, `${NAMESPACE}:rate:${bucket}`,
    JSON.stringify(visit), String(visit.at - WINDOW_MS), String(MAX_VISITS), String(WINDOW_MS / 1000), String(visit.at),
  ], { abortSignal: AbortSignal.timeout(2_000) });
}

/** Visits from the last 30 days, newest first. */
export async function readVisits() {
  const db = await redis();
  const raw = await db.sendCommand<string[]>(
    ["ZREVRANGEBYSCORE", VISITS_KEY, "+inf", String(Date.now() - WINDOW_MS)],
    { abortSignal: AbortSignal.timeout(2_000) },
  );
  return raw.map((value) => JSON.parse(value) as Visit);
}
