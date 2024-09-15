import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { client, db } = await connectToDatabase();
    const { fullName, email, password } = await req.json();

    console.log('Attempting to register user:', email);
    console.log('Received password length:', password.length);

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return new Response(JSON.stringify({ message: 'User already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    console.log('Hashed password length:', hashedPassword.length);

    // Create new user
    const result = await db.collection('users').insertOne({
      fullName,
      email,
      password: hashedPassword,  // Store the hashed password
    });

    console.log('User registered successfully:', email);

    return new Response(JSON.stringify({ message: 'User registered successfully', userId: result.insertedId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ message: `Error registering user: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
