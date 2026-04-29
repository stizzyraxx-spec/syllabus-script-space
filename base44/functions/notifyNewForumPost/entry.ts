import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const post = payload.data;

    if (!post) {
      return Response.json({ error: 'No post data' }, { status: 400 });
    }

    const { data: allUsers } = await supabase.from('users').select('email');

    const authorEmail = post.created_by || post.author_email;
    const authorName = post.author_name || "Someone";
    const postTitle = post.title || "a new discussion";

    const notifications = (allUsers || [])
      .filter((u) => u.email !== authorEmail)
      .map((u) => ({
        recipient_email: u.email,
        actor_name: authorName,
        actor_email: authorEmail,
        type: "comment",
        message: `${authorName} started a new discussion: "${postTitle}"`,
        link_path: "/forums",
        read: false,
      }));

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }

    console.log(`Notified ${notifications.length} users about new forum post: ${postTitle}`);
    return Response.json({ notified: notifications.length });
  } catch (error) {
    console.error('Error notifying users:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
