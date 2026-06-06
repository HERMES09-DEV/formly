"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, unstable_update } from "@/lib/auth";
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
  if (!userId) throw new Error("Unauthorized");

  const invite = await prisma.invite.findUnique({
    where: {
      token: data.token,
    },
    select: {
      id: true,
      orgId: true,
      accepted: true,
      expiresAt: true,
    },
  });

  if (!invite || invite.accepted || invite.expiresAt <= new Date()) {
    throw new Error("This invite has expired.");
  }

  await prisma.$transaction(async (tx) => {
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

    await tx.invite.update({
      where: {
        id: invite.id,
      },
      data: {
        accepted: true,
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
