export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { prompt, system_prompt, response_json_schema, model } = await req.json();

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), { status: 500 });
  }

  const systemContent = system_prompt || 'You are a helpful biblical study assistant.';
  const messages = [{ role: 'user', content: prompt }];

  const body = {
    model: model || 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: systemContent,
    messages,
  };

  if (response_json_schema) {
    body.tools = [{
      name: 'respond',
      description: 'Respond with structured JSON',
      input_schema: response_json_schema,
    }];
    body.tool_choice = { type: 'tool', name: 'respond' };
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }

  const data = await res.json();

  // If tool use was requested, return the tool input directly
  if (response_json_schema && data.content?.[0]?.type === 'tool_use') {
    return new Response(JSON.stringify(data.content[0].input), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Otherwise return plain text
  const text = data.content?.[0]?.text || '';
  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
