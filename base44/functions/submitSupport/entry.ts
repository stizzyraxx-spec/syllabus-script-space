import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { email, subject, message, user_email } = await req.json();

    if (!email || !subject || !message) {
      return Response.json(
        { error: "Email, subject, and message are required" },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    // Send email to support team
    await base44.integrations.Core.SendEmail({
      to: "support@theconditionofman.com",
      subject: `New Support Request: ${subject}`,
      body: `
From: ${email}
User Email: ${user_email || "Not logged in"}

Subject: ${subject}

Message:
${message}
      `.trim(),
      from_name: "Support Form",
    });

    // Send confirmation email to user
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: "We received your support request",
      body: `
Hello,

Thank you for contacting The Condition of Man support team.

We've received your support request and will get back to you as soon as possible.

Subject: ${subject}

Our support team will review your message and respond within 24 hours.

Best regards,
The Condition of Man Team
      `.trim(),
      from_name: "The Condition of Man",
    });

    console.log(`Support request submitted from ${email}: ${subject}`);

    return Response.json({
      success: true,
      message: "Support request submitted successfully",
    });
  } catch (error) {
    console.error("Support submission error:", error);
    return Response.json(
      { error: error.message || "Failed to submit support request" },
      { status: 500 }
    );
  }
});