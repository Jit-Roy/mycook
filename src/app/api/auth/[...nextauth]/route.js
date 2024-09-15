import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Attempting to authorize with email:', credentials.email);
          console.log('Received password length:', credentials.password.length);

          const client = await MongoClient.connect(process.env.MONGODB_URI);
          const db = client.db();
          const user = await db.collection('users').findOne({ email: credentials.email });

          if (!user) {
            console.log('User not found in database');
            await client.close();
            return null;
          }

          console.log('User found, comparing passwords');
          console.log('Stored hashed password length:', user.password.length);

          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          console.log('Password comparison result:', isValid);

          if (isValid) {
            console.log('Password is valid, authentication successful');
            await client.close();
            return { id: user._id.toString(), name: user.fullName, email: user.email };
          } else {
            console.log('Password is invalid');
            await client.close();
            return null;
          }
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
