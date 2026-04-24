import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const post = payload.data;
    if (!post) {
      return Response.json({ error: 'No post data' }, { status: 400 });
    }

    // Get all users to notify
    const allUsers = await base44.asServiceRole.entities.User.list();

    const authorEmail = post.created_by || post.author_email;
    const authorName = post.author_name || "Someone";
    const postTitle = post.title || "a new discussion";

    const notifications = allUsers
      .filter((u) => u.email !== authorEmail)
      .map((u) =>
        base44.asServiceRole.entities.Notification.create({
          recipient_email: u.email,
          actor_name: authorName,
          actor_email: authorEmail,
          type: "comment",
          message: `${authorName} started a new discussion: "${postTitle}"`,
          link_path: "/forums",
          read: false,
        })
      );

    await Promise.all(notifications);

    console.log(`Notified ${notifications.length} users about new forum post: ${postTitle}`);
    return Response.json({ notified: notifications.length });
  } catch (error) {
    console.error('Error notifying users:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});