"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, unstable_update } from "@/lib/auth";
import { inviteEmailMatches } from "@/lib/invite-email";
import { prisma } from "@/lib/prisma";

const AcceptInviteSchema = z.object({
  token: z.string().min(1, "Invite token is required."),
});

function getInput(input: unknown) {
  if (input instanceof FormData) {
    const token = input.get("token");

    return {
      token: typeof token === "string" ? token : "",
    };
  }

  return input;
}

function getLoginUrl(token: string) {
  const callbackUrl = `/invite/${token}`;

  return `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export async function acceptInvite(input: unknown) {
  const session = await auth();
  const data = AcceptInviteSchema.parse(getInput(input));

  if (!session?.user) {
    redirect(getLoginUrl(data.token));
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  if (!userId || !userEmail) throw new Error("Unauthorized");

  const invite = await prisma.invite.findUnique({
    where: {
      token: data.token,
    },
    select: {
      id: true,
      orgId: true,
      email: true,
      accepted: true,
      expiresAt: true,
    },
  });

  if (!invite || invite.accepted || invite.expiresAt <= new Date()) {
    throw new Error("This invite has expired.");
  }

  if (!inviteEmailMatches(invite.email, userEmail)) {
    throw new Error(
      `Sign in with ${invite.email} to accept this workspace invite.`,
    );
  }

  await prisma.$transaction(async (tx) => {
    const acceptedInvite = await tx.invite.updateMany({
      where: {
        id: invite.id,
        accepted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        accepted: true,
      },
    });

    if (acceptedInvite.count !== 1) {
      throw new Error("This invite has expired.");
    }

    const existingMembership = await tx.orgMember.findUnique({
      where: {
        orgId_userId: {
          orgId: invite.orgId,
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!existingMembership) {
      await tx.orgMember.create({
        data: {
          orgId: invite.orgId,
          userId,
          role: "MEMBER",
        },
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        activeOrgId: invite.orgId,
      },
    });
  });

  await unstable_update({
    user: {
      id: userId,
      orgId: invite.orgId,
    },
  });

  redirect("/dashboard");
}
