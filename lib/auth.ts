import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { PrismaClient, User as PrismaUser } from "@prisma/client";
import { NextResponse } from "next/server";

type FormlyUserCreateData = {
  email: string;
  name?: string | null;
  image?: string | null;
};

type FormlyUserUpdateData = {
  email?: string;
  name?: string | null;
  image?: string | null;
};

function getUpdatedOrgId(session: unknown): string | null | undefined {
  if (!session || typeof session !== "object" || !("user" in session)) {
    return undefined;
  }

  const { user } = session;

  if (!user || typeof user !== "object" || !("orgId" in user)) {
    return undefined;
  }

  const { orgId } = user;

  if (typeof orgId === "string" || orgId === null) {
    return orgId;
  }

  return undefined;
}

const githubProvider = GitHub({
  clientId: process.env.AUTH_GITHUB_ID!,
  clientSecret: process.env.AUTH_GITHUB_SECRET!,
});

const googleProvider = Google({
  clientId: process.env.AUTH_GOOGLE_ID!,
  clientSecret: process.env.AUTH_GOOGLE_SECRET!,
});

const providers = [
  githubProvider,
  googleProvider,
] satisfies NextAuthConfig["providers"];

const middlewareAuthConfig = {
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.orgId =
          typeof token.orgId === "string" ? token.orgId : null;
      }

      return session;
    },
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const isPublicApiRoute =
        pathname.startsWith("/api/auth") || pathname.startsWith("/api/submit");
      const isOnboardingRoute = pathname === "/onboarding";

      if (isPublicApiRoute || isOnboardingRoute) {
        return true;
      }

      if (!auth?.user) {
        const loginUrl = new URL("/login", request.nextUrl);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);

        return NextResponse.redirect(loginUrl);
      }

      if (!auth.user.orgId && !isOnboardingRoute) {
        return NextResponse.redirect(new URL("/onboarding", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

export const { auth: middlewareAuth } = NextAuth(middlewareAuthConfig);

function toAdapterUser(user: PrismaUser): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    emailVerified: null,
  };
}

function toCreateUserData(user: AdapterUser): FormlyUserCreateData {
  return {
    email: user.email,
    name: user.name,
    image: user.image,
  };
}

function toUpdateUserData(user: Partial<AdapterUser>): FormlyUserUpdateData {
  return {
    email: user.email,
    name: user.name,
    image: user.image,
  };
}

async function createFormlyPrismaAdapter(
  prisma: PrismaClient,
): Promise<Adapter> {
  const { PrismaAdapter } = await import("@auth/prisma-adapter");
  const adapter = PrismaAdapter(prisma);

  return {
    ...adapter,
    async createUser(user) {
      const createdUser = await prisma.user.create({
        data: toCreateUserData(user),
      });

      return toAdapterUser(createdUser);
    },
    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      return user ? toAdapterUser(user) : null;
    },
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      return user ? toAdapterUser(user) : null;
    },
    async getUserByAccount(providerAccountId) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: providerAccountId },
        include: { user: true },
      });

      return account?.user ? toAdapterUser(account.user) : null;
    },
    async updateUser(user) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: toUpdateUserData(user),
      });

      return toAdapterUser(updatedUser);
    },
  };
}

async function createNodeAuthConfig(): Promise<NextAuthConfig> {
  const { prisma } = await import("./prisma");

  return {
    ...middlewareAuthConfig,
    providers,
    adapter: await createFormlyPrismaAdapter(prisma),
    callbacks: {
      ...middlewareAuthConfig.callbacks,
      async jwt({ token, user, trigger, session }) {
        if (user?.id) {
          token.sub = user.id;
        }

        const updatedOrgId = getUpdatedOrgId(session);

        if (trigger === "update" && updatedOrgId !== undefined) {
          token.orgId = updatedOrgId;
        }

        if (token.sub && token.orgId === undefined) {
          const orgMember = await prisma.orgMember.findFirst({
            where: { userId: token.sub },
            select: { orgId: true },
            orderBy: { id: "asc" },
          });

          token.orgId = orgMember?.orgId ?? null;
        }

        return token;
      },
      async session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub;
          const member = await prisma.orgMember.findFirst({
            where: { userId: token.sub },
            select: { orgId: true },
          });
          session.user.orgId = member?.orgId ?? null;
        }
        return session;
      },
    },
  };
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth(
  (request) => {
    if (request && !request.nextUrl.pathname.startsWith("/api/auth")) {
      return middlewareAuthConfig;
    }

    return createNodeAuthConfig();
  },
);
