import NextAuth, {
  NextAuthOptions,
  Session,
  User as NextAuthUser,
} from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import MongooseAdapter from "@/lib/auth/mongoose-adapter";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// Custom User interface extending NextAuth's User
interface CustomUser extends NextAuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Define the type for session callback params
interface SessionParams {
  session: Session;
  token: JWT;
}

// Define the type for JWT callback params
interface JWTParams {
  token: JWT;
  user?: CustomUser;
}

export const authOptions: NextAuthOptions = {
  adapter: MongooseAdapter(),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Connect to the database
        await dbConnect();

        const user = await User.findOne({
          email: credentials.email,
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: SessionParams): Promise<Session> {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        console.log("Setting session user ID:", token.sub);
      }
      return session;
    },
    async jwt({ token, user }: JWTParams): Promise<JWT> {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
