import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret") || req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("METRICOOL_WEBHOOK_SECRET");

    if (!secret || secret !== expectedSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const brand = body.brand || body.brand_name || body.account || body.profile || "";
    if (brand && brand.toLowerCase() !== "stizzop") {
      return Response.json({ error: "Brand not allowed" }, { status: 403 });
    }

    const title = body.title || body.post_title || body.name || "New Post";
    const content = body.content || body.text || body.caption || body.message || body.body || "";
    const media_url = body.media_url || body.image_url || body.image || body.video_url || null;
    const media_type = body.media_type || (body.video_url ? "video" : media_url ? "photo" : null);
    const category = body.category || "general";
    const author_name = body.author_name || body.author || "The Condition of Man";

    if (!content && !title) {
      return Response.json({ error: "No content provided" }, { status: 400 });
    }

    const { data: post } = await supabase
      .from('forum_posts')
      .insert({
        title,
        content,
        category: ["general", "bible_study", "justice_ethics", "testimonies"].includes(category) ? category : "general",
        author_name,
        reply_count: 0,
        ...(media_url && { media_url }),
        ...(media_type && { media_type }),
      })
      .select()
      .single();

    return Response.json({ success: true, post_id: post?.id, title: post?.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
