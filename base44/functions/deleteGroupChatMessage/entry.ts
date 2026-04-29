import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id } = await req.json();
    if (!message_id) {
      return Response.json({ error: 'message_id is required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: messages } = await supabase
      .from('group_chat_messages')
      .select('*')
      .eq('id', message_id);

    const message = messages?.[0];
    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }

    const { data: userRows } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email);

    const isAdmin = userRows?.[0]?.role === 'admin';
    const isAuthor = message.author_email === user.email;

    if (!isAuthor && !isAdmin) {
      return Response.json({ error: 'Forbidden: Only the author or admin can delete' }, { status: 403 });
    }

    await supabase.from('group_chat_messages').delete().eq('id', message_id);

    console.log(`Deleted group chat message ${message_id} by ${user.email}`);
    return Response.json({ success: true, deleted_id: message_id, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Delete message error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
