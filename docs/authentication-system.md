# Authentication System Documentation

## Overview

The Neurowitch application uses Auth.js v5 (Next-Auth.js v5) for authentication and authorization. This document provides detailed information about the implementation, configuration, and usage of the authentication system.

## Implementation

The authentication system is implemented with the following components:

### Core Files

- **auth.ts**: Root-level configuration file for Auth.js v5
- **app/api/auth/[...nextauth]/route.ts**: API route handler for authentication requests
- **components/AuthProvider.tsx**: Client component that provides session context
- **lib/auth-utils.ts**: Utility functions for authentication and authorization

### Configuration

The authentication system is configured in the `auth.ts` file at the root of the project:

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Role } from "@prisma/client";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdminPanel = request.nextUrl.pathname.startsWith("/admin");

      if (isOnAdminPanel) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
```

### API Route with Rate Limiting

The API route handler in `app/api/auth/[...nextauth]/route.ts` implements rate limiting for credential sign-in attempts:

```typescript
import { handlers } from "@/auth";
import { NextResponse } from "next/server";
import { applyRateLimit, getMaxAttempts, getWindowMs } from "@/lib/rate-limit";

/**
 * Next-Auth API route handler with rate limiting
 *
 * This handler applies rate limiting to credential sign-in attempts to prevent brute force attacks.
 * The rate limit is configurable through environment variables:
 * - RATE_LIMIT_MAX_ATTEMPTS: Maximum number of login attempts allowed in the time window (default: 5)
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 60000 - 1 minute)
 */

// Export the GET handler directly from auth.ts
export const GET = handlers.GET;

/**
 * Custom POST handler with rate limiting
 *
 * This handler wraps the original POST handler from auth.ts with rate limiting
 * for credential sign-in attempts.
 */
export async function POST(req: Request, context: { params: { nextauth: string[] } }) {
  // Only apply rate limiting to credential sign-in attempts
  if (
    req.url.includes("callback/credentials") &&
    context.params.nextauth.includes("callback") &&
    context.params.nextauth.includes("credentials")
  ) {
    // Apply rate limiting with values from environment variables
    const { limited, remaining } = applyRateLimit(req);

    if (limited) {
      return NextResponse.json(
        {
          error: "Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo después de " +
                 Math.ceil(getWindowMs() / 60000) + " minutos.",
          status: 429
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(getWindowMs() / 1000).toString(),
            "X-RateLimit-Limit": getMaxAttempts().toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(Date.now() / 1000 + getWindowMs() / 1000).toString()
          }
        }
      );
    }

    // Add rate limit headers
    const response = await handlers.POST(req, context);
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  // For all other auth routes, proceed normally
  return handlers.POST(req, context);
}
```

### AuthProvider Component

The `AuthProvider` component in `components/AuthProvider.tsx` wraps the application with the SessionProvider from next-auth/react:

```typescript
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### Auth Utilities

The `lib/auth-utils.ts` file provides utility functions for authentication and authorization:

```typescript
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function getServerSession() {
  return await auth();
}

export function useRole() {
  const { data: session } = useSession();
  return session?.user?.role;
}

export async function requireRole(requiredRole: Role, redirectTo = "/unauthorized") {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user?.role;

  if (!userRole) {
    redirect("/login");
  }

  const roleHierarchy: Record<Role, number> = {
    MASTER: 4,
    ADMIN: 3,
    EDITOR: 2,
    COLLABORATOR: 1,
  };

  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    redirect(redirectTo);
  }
}

export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }
}
```

## Environment Variables

The authentication system requires the following environment variables:

```
# Authentication
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# Rate Limiting
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=60000
```

## User Roles

The application supports the following user roles in hierarchical order (highest to lowest):

1. **MASTER**: Full access to all features and administrative functions
2. **ADMIN**: Access to administrative features and content management
3. **EDITOR**: Ability to create and edit content
4. **COLLABORATOR**: Limited access to contribute content

## Usage

### Server Components

In server components, use the `getServerSession` function to get the current session:

```typescript
import { getServerSession } from "@/lib/auth-utils";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session) {
    // Handle unauthenticated user
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  );
}
```

### Client Components

In client components, use the `useSession` hook from next-auth/react:

```typescript
"use client";

import { useSession } from "next-auth/react";

export default function ProfileButton() {
  const { data: session } = useSession();

  if (!session) {
    return <button>Sign In</button>;
  }

  return <button>Profile: {session.user.name}</button>;
}
```

### Protecting Routes

To protect routes based on user roles, use the `requireRole` function:

```typescript
import { requireRole } from "@/lib/auth-utils";
import { Role } from "@prisma/client";

export default async function AdminPage() {
  await requireRole(Role.ADMIN);

  // This code will only execute if the user has ADMIN role or higher
  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  );
}
```

### Sign In and Sign Out

To sign in and sign out, use the `signIn` and `signOut` functions from next-auth/react:

```typescript
"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return <button onClick={() => signIn()}>Sign In</button>;
}

export function SignOutButton() {
  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

## Security Considerations

The authentication system implements several security measures:

1. **Password Hashing**: Passwords are hashed using bcrypt
2. **Rate Limiting**: Login API endpoint implements rate limiting to prevent brute force attacks
   - Configurable via environment variables (RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MS)
   - Default: 5 attempts per minute
   - Returns 429 Too Many Requests with appropriate headers when limit is exceeded
3. **CSRF Protection**: Auth.js v5 includes CSRF protection
4. **Secure Cookies**: Session cookies are secure and HTTP-only
5. **Role-Based Authorization**: Access to features is restricted based on user roles
6. **Input Validation**: All user inputs are validated before processing

## Conclusion

The authentication system provides a secure and flexible way to authenticate users and control access to features based on user roles. It follows the requirements specified in Chapter 0, section 0.5 "Security Requirements" from the initial project specifications.
