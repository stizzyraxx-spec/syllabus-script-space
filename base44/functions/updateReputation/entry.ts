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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: callerProfiles } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_email', user.email);

    if (!callerProfiles?.[0]?.is_moderator) {
      return Response.json({ error: 'Forbidden: Only moderators can update reputation' }, { status: 403 });
    }

    const { targetUserEmail, action, reportId } = await req.json();

    if (!targetUserEmail || !action || !reportId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: targetProfiles } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_email', targetUserEmail);

    if (!targetProfiles || targetProfiles.length === 0) {
      return Response.json({ error: 'Target user profile not found' }, { status: 404 });
    }

    const targetProfile = targetProfiles[0];
    const trustScoreDeltas = {
      warned: -5,
      content_removed: -10,
      user_suspended: -25,
      dismissed: 2,
    };
    const trustScoreDelta = trustScoreDeltas[action] ?? 0;
    const newTrustScore = Math.max(0, (targetProfile.trust_score || 0) + trustScoreDelta);

    await supabase.from('user_profiles').update({
      trust_score: newTrustScore,
      reported_abuse_count: (targetProfile.reported_abuse_count || 0) + (action !== 'dismissed' ? 1 : 0),
      updated_date: new Date().toISOString(),
    }).eq('id', targetProfile.id);

    console.log(`Reputation updated for ${targetUserEmail}: ${action} (delta: ${trustScoreDelta}, new score: ${newTrustScore})`);
    return Response.json({ success: true, targetUserEmail, action, trustScoreDelta, newTrustScore });
  } catch (error) {
    console.error('Error updating reputation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
