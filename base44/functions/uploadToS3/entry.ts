import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3';

const s3 = new S3Client({
  region: Deno.env.get('AWS_S3_REGION'),
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
  },
});

const BUCKET = Deno.env.get('AWS_S3_BUCKET_NAME');
const REGION = Deno.env.get('AWS_S3_REGION');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, fileType, fileData } = await req.json();

    if (!fileData || !fileName || !fileType) {
      return Response.json({ error: 'fileName, fileType and fileData are required' }, { status: 400 });
    }

    // Decode base64 to bytes
    const binaryStr = atob(fileData);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const ext = fileName.split('.').pop() || 'bin';
    const key = `uploads/${user.email}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: bytes,
      ContentType: fileType,
    }));

    const file_url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
    console.log(`Uploaded ${fileName} to S3: ${key}`);

    return Response.json({ file_url });
  } catch (error) {
    console.error('S3 upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});