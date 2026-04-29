import { createClient } from 'npm:@supabase/supabase-js@2';
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

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
    const { channel } = await req.json();

    let query = supabase
      .from('group_chat_messages')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(1000);

    if (channel) {
      query = query.eq('channel', channel);
    }

    const { data: messages } = await query;

    if (!messages || messages.length === 0) {
      return Response.json({ success: true, archived_count: 0, message: 'No messages to archive' });
    }

    const conversationData = {
      archived_at: new Date().toISOString(),
      message_count: messages.length,
      date_range: {
        earliest: messages[messages.length - 1]?.created_date,
        latest: messages[0]?.created_date,
      },
      messages: messages.map(msg => ({
        id: msg.id,
        author_email: msg.author_email,
        author_name: msg.author_name,
        content: msg.content,
        likes: msg.likes,
        created_date: msg.created_date,
      })),
    };

    const jsonData = JSON.stringify(conversationData, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `conversations-archive/archive-${timestamp}.json`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: new TextEncoder().encode(jsonData),
      ContentType: 'application/json',
    }));

    const archive_url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
    console.log(`Archived ${messages.length} group chat messages to S3: ${key}`);

    return Response.json({
      success: true,
      archived_count: messages.length,
      archive_url,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Archive error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
