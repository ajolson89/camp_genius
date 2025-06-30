import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'serverless-individual',
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasRecreationGov: !!process.env.RECREATION_GOV_API_KEY,
    method: req.method,
    url: req.url
  });
}