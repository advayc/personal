import { useEffect, useState } from "react";
import { FiArrowRight, FiArrowUpRight, FiCopy, FiExternalLink, FiPlay } from "react-icons/fi";

const examples = [
  { id: "portfolio-home", label: "page views", initial: 1840 },
  { id: "demo-download", label: "downloads", initial: 237 },
  { id: "docs-guide", label: "docs badge", initial: 84 },
];

const notes = [
  "Your site chooses an ID for each page or file, then asks for a hit.",
  "The Go service checks the request and reads or updates the counter in Redis.",
  "The API can return a number as JSON or text, or render it as a badge.",
];

const API_BASE = "/api/nums";
const requestOptions = [
  { value: "count", label: "GET /count", format: "json" },
  { value: "count.txt", label: "GET /count.txt", format: "text" },
  { value: "badge", label: "GET /badge", format: "svg" },
  { value: "badge.json", label: "GET /badge.json", format: "json" },
] as const;

type RequestPath = (typeof requestOptions)[number]["value"];

function LiveRequestConsole() {
  const [requestPath, setRequestPath] = useState<RequestPath>("count");
  const [requestId, setRequestId] = useState("portfolio-demo");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const upstreamRequestUrl = `https://nums.advay.ca/${requestPath}?id=${encodeURIComponent(requestId || "portfolio-demo")}`;
  const requestUrl = `${API_BASE}?endpoint=${encodeURIComponent(requestPath)}&id=${encodeURIComponent(requestId || "portfolio-demo")}`;
  const curlCommand = `curl "${upstreamRequestUrl}"`;

  const sendRequest = async () => {
    setLoading(true);
    setStatus(null);
    setResponse("");
    const startedAt = performance.now();
    try {
      const result = await fetch(requestUrl);
      const body = await result.text();
      setStatus(result.status);
      setLatency(Math.round(performance.now() - startedAt));
      setResponse(body);
    } catch (error) {
      setLatency(Math.round(performance.now() - startedAt));
      setResponse(error instanceof Error ? error.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = async () => {
    await navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <section className="nums-live-console" aria-labelledby="nums-live-title">
      <div className="nums-live-heading">
        <div>
          <span className="nums-eyebrow">live request lab</span>
          <h3 id="nums-live-title">send a real request</h3>
        </div>
        <span className="nums-live-host">
          <i aria-hidden="true" /> nums.advay.ca
        </span>
      </div>
      <p>
        These read requests reach the hosted Go API through a secure same-origin
        proxy. Try a counter ID and inspect the response without leaving the page.
      </p>
      <div className="nums-api-toolbar">
        <label className="nums-operation">
          <select
            aria-label="API operation"
            value={requestPath}
            onChange={(event) => {
              setRequestPath(event.target.value as RequestPath);
              setResponse("");
              setStatus(null);
            }}
          >
            {requestOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <code><strong>GET</strong> /{requestPath}</code>
        <button className="nums-send-button" type="button" onClick={() => void sendRequest()} disabled={loading}>
          {loading ? "Sending…" : "Send"} <FiPlay aria-hidden="true" />
        </button>
      </div>
      <div className="nums-api-body">
        <div className="nums-query-panel">
          <h4>Query</h4>
          <label>
            counter id
            <input
              value={requestId}
              maxLength={48}
              onChange={(event) => setRequestId(event.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
              onKeyDown={(event) => {
                if (event.key === "Enter") void sendRequest();
              }}
            />
          </label>
          <p>Change the ID to read a different public counter.</p>
        </div>
        <div className="nums-api-results">
          <div className="nums-code-card">
            <div className="nums-code-card-title">
              <span>cURL</span>
              <button type="button" onClick={() => void copyCurl()} aria-label="Copy curl command">
                <FiCopy aria-hidden="true" /> {copied ? "copied" : "copy"}
              </button>
            </div>
            <pre>{curlCommand}</pre>
          </div>
          <div className="nums-code-card" aria-live="polite">
            <div className="nums-code-card-title">
              <span className={status !== null && status >= 200 && status < 300 ? "nums-status ok" : "nums-status"}>
                {status === null ? "response" : `${status}${latency === null ? "" : ` · ${latency}ms`}`}
              </span>
              <code>JSON</code>
            </div>
            <pre>{loading ? "waiting for nums.advay.ca…" : response || '{\n  "id": "<your counter id>",\n  "hits": 0,\n  "source": "redis"\n}'}</pre>
          </div>
        </div>
      </div>
      <p className="nums-live-note">
        <strong>Writes stay server-side.</strong> The <code>/hit</code> endpoint
        needs <code>X-Auth-Token</code>; use the{" "}
        <a href="https://docs.advay.ca/api-reference/introduction" target="_blank" rel="noreferrer">
          API docs <FiExternalLink aria-hidden="true" />
        </a>{" "}
        to configure it safely.
      </p>
    </section>
  );
}

function IsoBox({
  x,
  label,
  sub,
  active,
}: {
  x: number;
  label: string;
  sub: string;
  active: boolean;
}) {
  const y = 79;
  const w = 116;
  const h = 78;
  const d = 20;
  const top = x + "," + y + " " + (x + d) + "," + (y - d) + " " + (x + w + d) + "," + (y - d) + " " + (x + w) + "," + y;
  const side = (x + w) + "," + y + " " + (x + w + d) + "," + (y - d) + " " + (x + w + d) + "," + (y + h - d) + " " + (x + w) + "," + (y + h);
  return (
    <g className={active ? "nums-node active" : "nums-node"}>
      <polygon points={side} />
      <polygon points={top} className="nums-node-top" />
      <rect x={x} y={y} width={w} height={h} rx={3} />
      <text x={x + 13} y={y + 30} className="nums-node-label">{label}</text>
      <text x={x + 13} y={y + 51} className="nums-node-sub">{sub}</text>
      <circle cx={x + w - 13} cy={y + h - 13} r={3.5} className="nums-node-led" />
    </g>
  );
}

export default function NumsShowcase() {
  const [example, setExample] = useState(0);
  const [counts, setCounts] = useState(examples.map((item) => item.initial));
  const [step, setStep] = useState(-1);
  const [id, setId] = useState(examples[0].id);
  const selected = examples[example];
  const count = counts[example];

  useEffect(() => {
    setId(selected.id);
  }, [selected.id]);

  const choose = (index: number) => {
    setExample(index);
    setStep(-1);
  };

  const send = () => {
    setCounts((current) =>
      current.map((value, i) => i === example ? value + 1 : value),
    );
    setStep(0);
    window.setTimeout(() => setStep(1), 420);
    window.setTimeout(() => setStep(2), 940);
    window.setTimeout(() => setStep(-1), 1800);
  };

  const isBadge = example === 2;
  const request = isBadge
    ? "GET /badge?id=" + encodeURIComponent(id) + "&label=views"
    : "POST /hit?id=" + encodeURIComponent(id) + "\nX-Auth-Token: [server-side secret]\n\nGET /count?id=" + encodeURIComponent(id);
  const response = isBadge
    ? '<svg>  <text>' + count.toLocaleString() + '</text> </svg>'
    : '{\n  "id": "' + id + '",\n  "hits": ' + count.toLocaleString() + ',\n  "source": "redis"\n}';

  return (
    <section className="project-story nums-showcase" aria-labelledby="nums-demo-title">
      <div className="story-heading">
        <h2 id="nums-demo-title">try the counting flow</h2>
        <a href="https://docs.advay.ca/api-reference/introduction">
          API reference <FiArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <p className="nums-demo-intro">
        Choose a common use, then send a sample hit. This preview updates locally;
        it doesn’t change a live counter.
      </p>
      <div className="nums-use-cases" role="group" aria-label="Example use">
        {examples.map((item, i) => (
          <button
            key={item.id}
            aria-pressed={example === i}
            onClick={() => choose(i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="nums-diagram" data-step={step} role="img" aria-label="Browser sends a request to the Go API, which reads or writes a Redis counter and returns a result">
        <svg viewBox="0 0 740 180" aria-hidden="true">
          <path className="nums-pipe" d="M140 119H185M323 119H367M505 119H549" />
          <circle className={step === 0 ? "nums-packet visible" : "nums-packet"} cx="177" cy="119" r="5" />
          <circle className={step === 1 ? "nums-packet visible" : "nums-packet"} cx="348" cy="119" r="5" />
          <circle className={step === 2 ? "nums-packet visible" : "nums-packet"} cx="520" cy="119" r="5" />
          <IsoBox x={3} label="your site" sub="counter ID" active={step === 0} />
          <IsoBox x={185} label="Go API" sub="/hit · /count" active={step === 1} />
          <IsoBox x={367} label="Redis" sub="stored counts" active={step === 1} />
          <IsoBox x={549} label="response" sub={isBadge ? "SVG badge" : "JSON"} active={step === 2} />
        </svg>
        <div className="nums-diagram-notes">
          <span>{notes[0]}</span>
          <span>{notes[1]}</span>
          <span>{notes[2]}</span>
        </div>
      </div>
      <div className="nums-playground">
        <div className="nums-counter-panel">
          <label htmlFor="nums-counter-id">counter ID</label>
          <input
            id="nums-counter-id"
            value={id}
            maxLength={48}
            onChange={(event) => setId(event.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
          />
          <output aria-live="polite">
            <strong>{count.toLocaleString()}</strong>
            <span>{selected.label}</span>
          </output>
          <button className="nums-action" onClick={send}>
            send a sample hit <FiArrowRight aria-hidden="true" />
          </button>
        </div>
        <div className="nums-code-panel">
          <div>
            <h3>request</h3>
            <pre>{request}</pre>
          </div>
          <div>
            <h3>{isBadge ? "badge preview" : "JSON response"}</h3>
            {isBadge ? (
              <div className="nums-badge-preview"><span>views</span><strong>{count.toLocaleString()}</strong></div>
            ) : <pre>{response}</pre>}
          </div>
        </div>
      </div>
      <p className="nums-security-note">
        Keep the token on your backend; never ship it in browser code. Redis holds
        the count, while the small Go service handles the API request.
      </p>
      <LiveRequestConsole />
    </section>
  );
}
