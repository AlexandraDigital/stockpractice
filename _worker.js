export default {
  async fetch(request, env) {
    // Handle API routes
    if (request.url.includes('/api/')) {
      // Enable CORS
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }

      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      try {
        const { prompt } = await request.json();
        const groqKey = env.GROQ_API_KEY;

        if (!groqKey) {
          return new Response(JSON.stringify({ error: 'GROQ_API_KEY not set' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        const data = await res.json();

        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static files from Pages
    return env.ASSETS.fetch(request);
  }
};