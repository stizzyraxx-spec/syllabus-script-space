import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a moderator
    const [userProfile] = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: user.email,
    });

    if (!userProfile?.is_moderator) {
      return Response.json({ error: 'Forbidden: Only moderators can update reputation' }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserEmail, action, reportId } = body;

    if (!targetUserEmail || !action || !reportId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch target user profile
    const [targetProfile] = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: targetUserEmail,
    });

    if (!targetProfile) {
      return Response.json({ error: 'Target user profile not found' }, { status: 404 });
    }

    let trustScoreDelta = 0;

    // Adjust trust score based on moderator action
    if (action === 'warned') {
      trustScoreDelta = -5; // Warning: -5 points
    } else if (action === 'content_removed') {
      trustScoreDelta = -10; // Content removal: -10 points
    } else if (action === 'user_suspended') {
      trustScoreDelta = -25; // Suspension: -25 points
    } else if (action === 'dismissed') {
      trustScoreDelta = 2; // Unfounded report: +2 points to offender (cleared reputation)
    }

    const newTrustScore = Math.max(0, (targetProfile.trust_score || 0) + trustScoreDelta);

    // Update user profile with new trust score
    await base44.asServiceRole.entities.UserProfile.update(targetProfile.id, {
      trust_score: newTrustScore,
      reported_abuse_count: (targetProfile.reported_abuse_count || 0) + (action !== 'dismissed' ? 1 : 0),
    });

    // Log the action for audit trail
    console.log(`Reputation updated for ${targetUserEmail}: ${action} (delta: ${trustScoreDelta}, new score: ${newTrustScore})`);

    return Response.json({
      success: true,
      targetUserEmail,
      action,
      trustScoreDelta,
      newTrustScore,
    });
  } catch (error) {
    console.error('Error updating reputation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});