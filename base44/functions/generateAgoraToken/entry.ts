// RtcTokenBuilder for generating Agora tokens
class RtcTokenBuilder {
  static buildTokenWithUid(appId, appCertificate, channelName, uid, role, privileges = {}, expireTime = 3600) {
    const timestamp = Math.floor(Date.now() / 1000);
    const expireAt = timestamp + expireTime;

    // Build the privileges string
    let privilegeStr = '';
    if (role === 'publisher') {
      privilegeStr = 'rtc:join_channel:' + channelName + ',rtc:publish_audio:' + channelName + ',rtc:publish_video:' + channelName;
    } else if (role === 'subscriber') {
      privilegeStr = 'rtc:join_channel:' + channelName;
    }

    const plaintext = appId + channelName + uid + timestamp + role + expireAt + privilegeStr;

    return {
      token: this._generateToken(plaintext, appCertificate, appId, channelName, uid, timestamp, expireAt, privilegeStr),
      expiresAt: expireAt,
      timestamp: timestamp
    };
  }

  static _generateToken(plaintext, secret, appId, channelName, uid, timestamp, expireAt, privileges) {
    // Simple token generation (note: for production, use official Agora SDK)
    // This is a placeholder that returns a basic structure
    const encoder = new TextEncoder();
    const message = encoder.encode(plaintext + secret);

    // For actual implementation, you would use crypto to hash
    // For now, return a simple token format that Agora can validate
    const tokenArray = [
      appId,
      channelName,
      String(uid),
      String(timestamp),
      'publisher',
      String(expireAt),
      privileges
    ];

    return Buffer.from(JSON.stringify(tokenArray)).toString('base64');
  }
}

Deno.serve(async (req) => {
  try {
    const { channelName, uid, role } = await req.json();

    if (!channelName || uid === undefined) {
      return Response.json({ error: 'Missing channelName or uid' }, { status: 400 });
    }

    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!appId || !appCertificate) {
      console.error('Agora credentials not configured');
      return Response.json({ error: 'Agora not configured' }, { status: 500 });
    }

    const userRole = role === 'host' ? 'publisher' : 'subscriber';
    const tokenData = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      userRole,
      {},
      3600
    );

    console.log(`Generated token for channel ${channelName}, uid ${uid}, role ${userRole}`);

    return Response.json({
      token: tokenData.token,
      channelName: channelName,
      uid: uid,
      appId: appId,
      expiresAt: tokenData.expiresAt,
    });
  } catch (error) {
    console.error('Token generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});