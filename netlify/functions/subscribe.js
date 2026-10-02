// Función de servidor: aquí vive la API key, nunca en el navegador.
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  let name, email;
  try {
    ({ name, email } = await req.json());
  } catch {
    return Response.json({ message: 'Datos inválidos' }, { status: 400 });
  }

  if (!name || !email || !email.includes('@')) {
    return Response.json({ message: 'Nombre o email inválidos' }, { status: 400 });
  }

  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      email: email.trim(),
      attributes: { FIRSTNAME: name.trim() },
      listIds: [Number(process.env.BREVO_LIST_ID || 2)],
      updateEnabled: true
    })
  });

  const text = await r.text();
  if (!r.ok) console.error('Brevo error', r.status, text); // visible en los logs de Netlify

  return new Response(text || '{}', {
    status: r.status,
    headers: { 'Content-Type': 'application/json' }
  });
};
