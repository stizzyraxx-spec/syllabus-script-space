import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const AWS_S3_REGION = Deno.env.get('AWS_S3_REGION');
const AWS_S3_BUCKET_NAME = Deno.env.get('AWS_S3_BUCKET_NAME');

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoData, fileName } = await req.json();

    if (!videoData || !fileName) {
      return Response.json({ error: 'Missing videoData or fileName' }, { status: 400 });
    }

    const base64Data = videoData.split(',')[1] || videoData;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const videoBuffer = bytes.buffer;

    const s3Key = `live-videos/${user.email}/${Date.now()}_${fileName}`;
    const url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${s3Key}`;
    const signedRequest = await signS3Request('PUT', AWS_S3_BUCKET_NAME, s3Key, 'video/mp4', videoBuffer);

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Authorization': signedRequest.authorization,
        'x-amz-date': signedRequest.date,
      },
      body: videoBuffer,
    });

    if (!uploadResponse.ok) {
      console.error('S3 upload failed:', uploadResponse.status, uploadResponse.statusText);
      return Response.json({ error: 'S3 upload failed' }, { status: 500 });
    }

    const file_url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${s3Key}`;
    return Response.json({ file_url });
  } catch (error) {
    console.error('Error saving video:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function signS3Request(method, bucket, key, contentType, body) {
  const region = Deno.env.get('AWS_S3_REGION');
  const accessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
  const secretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');

  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
  const dateStamp = date.toISOString().split('T')[0].replace(/-/g, '');

  const bodyHash = await hashSHA256(body);
  const canonicalRequest = `${method}\n/${key}\n\nhost:${bucket}.s3.${region}.amazonaws.com\nx-amz-date:${amzDate}\n\nhost;x-amz-date\n${bodyHash}`;

  const canonicalRequestHash = await hashSHA256(new TextEncoder().encode(canonicalRequest));
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${dateStamp}/${region}/s3/aws4_request\n${canonicalRequestHash}`;

  const kDate = await hmacSHA256(`AWS4${secretKey}`, dateStamp);
  const kRegion = await hmacSHA256(kDate, region);
  const kService = await hmacSHA256(kRegion, 's3');
  const kSigning = await hmacSHA256(kService, 'aws4_request');
  const signatureBytes = await hmacSHA256(kSigning, stringToSign);
  const signature = Array.from(signatureBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=host;x-amz-date, Signature=${signature}`;

  return { authorization, date: amzDate };
}

async function hashSHA256(data) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSHA256(key, message) {
  const keyData = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const messageData = typeof message === 'string' ? new TextEncoder().encode(message) : message;
  const keyObj = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', keyObj, messageData);
  return new Uint8Array(signature);
}
