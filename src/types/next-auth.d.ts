import { DefaultSession } from "next-auth";

// Extend the session and token interfaces
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isVerified: boolean;
      provider: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    role: string;
    isVerified: boolean;
    provider: string;
  }

  interface User {
    id: string;
    role: string;
    isVerified: boolean;
    image: string;
  }
}
