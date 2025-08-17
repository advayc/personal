import type { NextApiRequest, NextApiResponse } from 'next';

// Base can be provided with or without trailing /hit or slash
const RAW_BASE = process.env.NEXT_PUBLIC_HIT_COUNTER_URL || 'https://nums-ten.vercel.app';
function normalizeHitEndpoint(base: string) {
  // strip trailing slash
  const stripped = base.replace(/\/$/, '');
  return stripped.endsWith('/hit') ? stripped : `${stripped}/hit`;
}
let HIT_ENDPOINT = normalizeHitEndpoint(RAW_BASE); // cached

const SECRET_TOKEN = process.env.HIT_COUNTER_SECRET_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SECRET_TOKEN) {
    return res.status(500).json({ error: 'Server misconfiguration (missing secret)' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "id" parameter' });
  }

  // helper to fetch & parse with graceful JSON handling
  const hitFetch = async (endpoint: string) => {
    const url = `${endpoint}?id=${encodeURIComponent(id)}`;
    const resp = await fetch(url, {
      method: req.method,
      headers: { 'X-Auth-Token': SECRET_TOKEN },
      cache: 'no-store'
    });
    let json: any = null;
    const ctype = resp.headers.get('content-type') || '';
    if (ctype.includes('application/json')) {
      try { json = await resp.json(); } catch { json = null; }
    } else if (resp.ok) {
      // If upstream changes to non-JSON but ok, fabricate minimal shape.
      json = { hits: null };
    }
    return { resp, json };
  };

  try {
    let { resp, json } = await hitFetch(HIT_ENDPOINT);

    // Retry once by forcing canonical /hit if first attempt failed (e.g., misconfigured env without /hit)
    if (!resp.ok && resp.status === 404) {
      const forced = normalizeHitEndpoint(RAW_BASE);
      if (forced !== HIT_ENDPOINT) {
        HIT_ENDPOINT = forced; // update cached
        ({ resp, json } = await hitFetch(HIT_ENDPOINT));
      }
    }

    if (!resp.ok) {
      return res.status(resp.status).json(json || { error: 'Upstream error' });
    }

    // Ensure consistent shape
    if (!json || typeof json.hits !== 'number') {
      return res.status(200).json({ hits: typeof json?.hits === 'number' ? json.hits : 0 });
    }

    return res.status(200).json({ hits: json.hits });
  } catch (e) {
    console.error('Hit counter proxy failure:', e);
    return res.status(502).json({ error: 'Hit service unavailable' });
  }
}