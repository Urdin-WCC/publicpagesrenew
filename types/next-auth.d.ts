import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { Role } from "@prisma/client"; // Import Role enum from Prisma

// Extend the default JWT type
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: Role;
    id?: string;
  }
}

// Extend the default Session type
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: Role;
    } & DefaultSession["user"]; // Keep existing fields like name, email, image
  }

  // Extend the default User type (used in callbacks)
  interface User extends DefaultUser {
    role?: Role;
  }
}