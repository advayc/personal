import type { NextApiRequest, NextApiResponse } from 'next';

// Base URL for the counter service
const RAW_BASE = process.env.NEXT_PUBLIC_HIT_COUNTER_URL || 'https://nums.advay.ca/';
function normalizeCountEndpoint(base: string) {
  const stripped = base.replace(/\/$/, '');
  return stripped.endsWith('/count') ? stripped : `${stripped}/count`;
}
let COUNT_ENDPOINT = normalizeCountEndpoint(RAW_BASE);

// Get secret token from server environment
const SECRET_TOKEN = process.env.HIT_COUNTER_SECRET_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SECRET_TOKEN) {
    console.error('Missing HIT_COUNTER_SECRET_TOKEN environment variable');
    return res.status(500).json({ error: 'Server misconfiguration (missing secret)' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "id" parameter' });
  }

  try {
    const url = `${COUNT_ENDPOINT}?id=${encodeURIComponent(id)}`;
    console.log(`Fetching count from: ${url}`);
    
    const resp = await fetch(url, {
      headers: { 'X-Auth-Token': SECRET_TOKEN },
      cache: 'no-store'
    });
    
    let json: any = null;
    try {
      json = await resp.json();
      console.log('Count response:', json);
    } catch (e) {
      console.error('Failed to parse count JSON:', e);
    }

    if (!resp.ok) {
      return res.status(resp.status).json(json || { error: 'Upstream error' });
    }

    // Return a consistent shape
    return res.status(200).json({ 
      hits: typeof json?.hits === 'number' ? json.hits : 0,
      id: id
    });
  } catch (e) {
    console.error('Count service unavailable:', e);
    return res.status(502).json({ error: 'Count service unavailable' });
  }
}