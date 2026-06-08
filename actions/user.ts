"use server";

import { signOut } from "@/lib/auth";
import { deleteStoredBlobs } from "@/lib/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const userEmail = session.user.email;
  const ownedOrgs = await prisma.orgMember.findMany({
    where: {
      userId,
      role: "OWNER",
    },
    select: {
      orgId: true,
    },
  });
  const orgIdsToDelete: string[] = [];

  for (const { orgId } of ownedOrgs) {
    const otherOwners = await prisma.orgMember.count({
      where: {
        orgId,
        role: "OWNER",
        userId: {
          not: userId,
        },
      },
    });

    if (otherOwners === 0) {
      orgIdsToDelete.push(orgId);
    }
  }

  const fileAnswers =
    orgIdsToDelete.length > 0
      ? await prisma.fieldAnswer.findMany({
          where: {
            field: {
              type: "FILE",
              form: {
                orgId: {
                  in: orgIdsToDelete,
                },
              },
            },
          },
          select: {
            value: true,
          },
        })
      : [];

  await prisma.$transaction(async (tx) => {
    for (const orgId of orgIdsToDelete) {
      await tx.org.delete({
        where: {
          id: orgId,
        },
      });
    }

    await tx.orgMember.deleteMany({
      where: {
        userId,
      },
    });

    if (userEmail) {
      await tx.invite.deleteMany({
        where: {
          email: userEmail,
        },
      });

      await tx.verificationToken.deleteMany({
        where: {
          identifier: userEmail,
        },
      });
    }

    await tx.account.deleteMany({
      where: {
        userId,
      },
    });

    await tx.session.deleteMany({
      where: {
        userId,
      },
    });

    await tx.user.delete({
      where: {
        id: userId,
      },
    });
  });

  await deleteStoredBlobs(fileAnswers.map((answer) => answer.value));
  await signOut({ redirectTo: "/" });
}
