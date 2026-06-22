// api/data.js — Vercel Serverless Function
// El SUPABASE_SERVICE_KEY vive SOLO en las variables de entorno de Vercel

const SUPABASE_URL = 'https://zorhclhvykikaachfrmp.supabase.co';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SERVICE_KEY) return res.status(500).json({ error: 'Service key no configurado en Vercel' });

  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    const [suscRes, activasRes, totalRes, reservasRes, negociosRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/suscripciones?select=negocio_id,fecha_inicio,estado&estado=eq.trial`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/suscripciones?select=negocio_id&estado=eq.activa`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/negocios?select=id`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/reservas?select=negocio_id,created_at`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/negocios?select=id,nombre,telefono,email,especialidad`, { headers })
    ]);

    const [suscripciones, activas, negocios, reservas, negociosDetalle] = await Promise.all([
      suscRes.json(), activasRes.json(), totalRes.json(), reservasRes.json(), negociosRes.json()
    ]);

    res.status(200).json({ suscripciones, activas, negocios, reservas, negociosDetalle });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
