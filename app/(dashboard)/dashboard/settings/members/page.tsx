import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MembersManager } from "@/components/settings/MembersManager";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Members | Formly",
};

export default async function MembersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const orgId = session.user.orgId;
  const userId = session.user.id;

  if (!orgId || !userId) {
    redirect("/onboarding");
  }

  const currentMembership = await prisma.orgMember.findUnique({
    where: {
      orgId_userId: {
        orgId,
        userId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!currentMembership) {
    redirect("/onboarding");
  }

  const [members, pendingInvites] = await Promise.all([
    prisma.orgMember.findMany({
      where: {
        orgId,
      },
      orderBy: [
        {
          role: "asc",
        },
        {
          id: "asc",
        },
      ],
      select: {
        userId: true,
        role: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.invite.findMany({
      where: {
        orgId,
        accepted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        expiresAt: "asc",
      },
      select: {
        id: true,
        email: true,
        expiresAt: true,
      },
    }),
  ]);

  return (
    <MembersManager
      members={members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
      }))}
      pendingInvites={pendingInvites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        expiresAt: invite.expiresAt.toISOString(),
      }))}
      isOwner={currentMembership.role === "OWNER"}
      currentUserId={userId}
    />
  );
}
