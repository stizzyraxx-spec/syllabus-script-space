import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id } = await req.json();

    if (!message_id) {
      return Response.json({ error: 'message_id is required' }, { status: 400 });
    }

    // Fetch the message to verify ownership
    const messages = await base44.entities.GroupChatMessage.filter({ id: message_id });
    const message = messages[0];

    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only allow author or admin to delete
    const userProfile = await base44.entities.User.filter({ email: user.email });
    const isAdmin = userProfile[0]?.role === 'admin';
    const isAuthor = message.author_email === user.email;

    if (!isAuthor && !isAdmin) {
      return Response.json({ error: 'Forbidden: Only the author or admin can delete' }, { status: 403 });
    }

    // Delete the message
    await base44.entities.GroupChatMessage.delete(message_id);
    console.log(`Deleted group chat message ${message_id} by ${user.email}`);

    return Response.json({ 
      success: true, 
      deleted_id: message_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Delete message error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});