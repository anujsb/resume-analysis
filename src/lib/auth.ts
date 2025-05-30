import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UsersRepository } from "@/lib/repository/users-repository";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const dbUser = await UsersRepository.findUserByEmail(credentials.email);
        if (!dbUser) {
          return null;
        }

        const isPasswordValid = await UsersRepository.verifyPassword(
          dbUser,
          credentials.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: String(dbUser.id),
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle sign-out
      if (url.includes('signout')) {
        return `${baseUrl}/auth/login`;
      }
      
      // Handle role-based redirects after login
      if (url === baseUrl || url === `${baseUrl}/`) {
        return baseUrl;
      }
      
      // If the url is relative, prefix it with the base url
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return url;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
