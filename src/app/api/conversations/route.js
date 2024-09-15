import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
  }

  const { db } = await connectToDatabase();
  const conversations = await db.collection('conversations').findOne({ email: email });

  return new Response(JSON.stringify({ conversations: conversations?.data || [] }), { status: 200 });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { email, conversations } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
  }

  const { db } = await connectToDatabase();

  await db.collection('conversations').updateOne(
    { email: email },
    { $set: { data: conversations } },
    { upsert: true }
  );

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
