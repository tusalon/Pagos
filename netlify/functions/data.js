// netlify/functions/data.js
const SUPABASE_URL = 'https://zorhclhvykikaachfrmp.supabase.co';

exports.handler = async (event, context) => {
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SERVICE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Service key no configurado' }) };
  }
  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Content-Type': 'application/json'
  };
  try {
    const [suscRes, activasRes, totalRes, reservasRes, negociosRes] = await Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/suscripciones?select=negocio_id,fecha_inicio,estado&estado=eq.trial', { headers }),
      fetch(SUPABASE_URL + '/rest/v1/suscripciones?select=negocio_id&estado=eq.activa', { headers }),
      fetch(SUPABASE_URL + '/rest/v1/negocios?select=id', { headers }),
      fetch(SUPABASE_URL + '/rest/v1/reservas?select=negocio_id,created_at', { headers }),
      fetch(SUPABASE_URL + '/rest/v1/negocios?select=id,nombre,telefono,email,especialidad', { headers })
    ]);
    const [suscripciones, activas, negocios, reservas, negociosDetalle] = await Promise.all([
      suscRes.json(), activasRes.json(), totalRes.json(), reservasRes.json(), negociosRes.json()
    ]);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ suscripciones, activas, negocios, reservas, negociosDetalle })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};