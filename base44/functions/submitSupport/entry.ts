import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { email, subject, message, user_email } = await req.json();

    if (!email || !subject || !message) {
      return Response.json({ error: "Email, subject, and message are required" }, { status: 400 });
    }

    await supabase.from('site_content').insert({
      type: "support_request",
      title: `Support: ${subject}`,
      content: message,
      author_email: email,
      user_email: user_email || null,
      status: "open",
    });

    console.log(`Support request submitted from ${email}: ${subject}`);
    return Response.json({ success: true, message: "Support request submitted successfully" });
  } catch (error) {
    console.error("Support submission error:", error);
    return Response.json({ error: error.message || "Failed to submit support request" }, { status: 500 });
  }
});
