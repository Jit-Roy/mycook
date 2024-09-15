import bcrypt from 'bcryptjs';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
  try {
    const { fullName, email, password } = await req.json();

    console.log('Attempting to register user:', email);
    console.log('Received password length:', password.length);

    // Check if user already exists
    const existingUser = await convex.query(api.users.getUserByEmail, { email });
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
    const result = await convex.mutation(api.users.createUser, {
      fullName,
      email,
      password: hashedPassword,  // Store the hashed password
    });

    console.log('User registered successfully:', email);

    return new Response(JSON.stringify({ message: 'User registered successfully', userId: result }), {
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
