"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { z } from "zod";
import { auth, unstable_update } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateOrgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters.")
    .max(50, "Workspace name must be 50 characters or fewer."),
});

const InviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((email) => email.toLowerCase()),
});

const RemoveMemberSchema = z.object({
  userId: z.string().min(1, "User id is required."),
});

const RevokeInviteSchema = z.object({
  inviteId: z.string().min(1, "Invite id is required."),
});

const SwitchOrgSchema = z.object({
  orgId: z.string().min(1, "Workspace id is required."),
});

type CreateOrgInput = z.infer<typeof CreateOrgSchema>;

export interface CreateOrgState {
  error: string | null;
}

function slugifyOrgName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug || "workspace";
}

function randomSuffix() {
  return randomBytes(2).toString("hex");
}

async function generateUniqueOrgSlug(name: string) {
  const baseSlug = slugifyOrgName(name);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const slug = `${baseSlug}-${randomSuffix()}`;
    const existingOrg = await prisma.org.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingOrg) {
      return slug;
    }
  }

  throw new Error("Could not generate a unique workspace slug.");
}

function getInputFromFormData(formData: FormData) {
  const name = formData.get("name");

  return {
    name: typeof name === "string" ? name : "",
  };
}

function getValidationError(error: z.ZodError<CreateOrgInput>) {
  return error.issues[0]?.message ?? "Enter a valid workspace name.";
}

function getInviteUrl(token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return new URL(`/invite/${token}`, baseUrl).toString();
}

function getInviteExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return expiresAt;
}

async function getOwnerOrg(orgId: string, userId: string) {
  const membership = await prisma.orgMember.findFirst({
    where: {
      orgId,
      userId,
      role: "OWNER",
    },
    select: {
      org: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error("Only workspace owners can do this.");
  }

  return membership.org;
}

async function sendInviteEmail(email: string, orgName: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Email is not configured.");
  }

  const inviteUrl = getInviteUrl(token);
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: "Formly <formly@resend.dev>",
    to: email,
    subject: `You've been invited to join ${orgName} on Formly`,
    text: [
      `You've been invited to join to work with ${orgName} on Formly Workspace.`,
      "",
      `Accept your invite: ${inviteUrl}`,
    ].join("\n"),
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function createOrg(input: CreateOrgInput): Promise<CreateOrgState>;
export async function createOrg(
  previousState: CreateOrgState,
  formData: FormData,
): Promise<CreateOrgState>;
export async function createOrg(
  inputOrState: CreateOrgInput | CreateOrgState,
  formData?: FormData,
): Promise<CreateOrgState> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const isFormAction = formData !== undefined;
  const input = isFormAction ? getInputFromFormData(formData) : inputOrState;
  const parsedInput = CreateOrgSchema.safeParse(input);

  if (!parsedInput.success) {
    if (isFormAction) {
      return { error: getValidationError(parsedInput.error) };
    }

    throw parsedInput.error;
  }

  const userId = session.user.id;
  if (!userId) throw new Error("Unauthorized");

  const existingOrg = await prisma.org.findFirst({
    where: { name: parsedInput.data.name },
    select: { id: true },
  });

  if (existingOrg) {
    if (isFormAction) {
      return { error: "Workspace name is already taken." };
    }

    throw new Error("Workspace name is already taken.");
  }

  const slug = await generateUniqueOrgSlug(parsedInput.data.name);

  const org = await prisma.$transaction(async (tx) => {
    const createdOrg = await tx.org.create({
      data: {
        name: parsedInput.data.name,
        slug,
      },
    });

    await tx.orgMember.create({
      data: {
        orgId: createdOrg.id,
        userId,
        role: "OWNER",
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { activeOrgId: createdOrg.id },
    });

    return createdOrg;
  });

  await unstable_update({
    user: {
      id: userId,
      orgId: org.id,
    },
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function inviteMember(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = InviteMemberSchema.parse(input);
  const orgId = session.user.orgId;
  const userId = session.user.id;
  if (!orgId || !userId) throw new Error("Unauthorized");

  const org = await getOwnerOrg(orgId, userId);
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    select: {
      id: true,
      orgs: {
        where: {
          orgId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (existingUser?.orgs.length) {
    throw new Error("This user is already a member.");
  }

  const pendingInvite = await prisma.invite.findFirst({
    where: {
      orgId,
      email: data.email,
      accepted: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
    },
  });

  if (pendingInvite) {
    throw new Error("A pending invite already exists for this email.");
  }

  const invite = await prisma.invite.create({
    data: {
      orgId,
      email: data.email,
      expiresAt: getInviteExpiresAt(),
    },
    select: {
      id: true,
      token: true,
    },
  });

  try {
    await sendInviteEmail(data.email, org.name, invite.token);
  } catch (error) {
    await prisma.invite.deleteMany({
      where: {
        id: invite.id,
        orgId,
        accepted: false,
      },
    });

    throw error;
  }

  revalidatePath("/dashboard/settings/members");
  return { success: true };
}

export async function removeMember(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = RemoveMemberSchema.parse(input);
  const orgId = session.user.orgId;
  const currentUserId = session.user.id;
  if (!orgId || !currentUserId) throw new Error("Unauthorized");

  await getOwnerOrg(orgId, currentUserId);

  const memberToRemove = await prisma.orgMember.findUnique({
    where: {
      orgId_userId: {
        orgId,
        userId: data.userId,
      },
    },
    select: {
      role: true,
      user: {
        select: {
          activeOrgId: true,
        },
      },
    },
  });

  if (!memberToRemove) {
    throw new Error("Member not found.");
  }

  if (data.userId === currentUserId && memberToRemove.role === "OWNER") {
    const ownerCount = await prisma.orgMember.count({
      where: {
        orgId,
        role: "OWNER",
      },
    });

    if (ownerCount <= 1) {
      throw new Error("You cannot remove yourself as the only owner.");
    }
  }

  const nextActiveOrgId = await prisma.$transaction(async (tx) => {
    await tx.orgMember.delete({
      where: {
        orgId_userId: {
          orgId,
          userId: data.userId,
        },
      },
    });

    if (memberToRemove.user.activeOrgId !== orgId) {
      return memberToRemove.user.activeOrgId;
    }

    const nextMembership = await tx.orgMember.findFirst({
      where: {
        userId: data.userId,
      },
      select: {
        orgId: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const nextOrgId = nextMembership?.orgId ?? null;

    await tx.user.update({
      where: { id: data.userId },
      data: { activeOrgId: nextOrgId },
    });

    return nextOrgId;
  });

  if (data.userId === currentUserId) {
    await unstable_update({
      user: {
        id: currentUserId,
        orgId: nextActiveOrgId,
      },
    });
  }

  revalidatePath("/dashboard/settings/members");
  return { success: true };
}

export async function switchOrg(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = SwitchOrgSchema.parse(input);
  const userId = session.user.id;
  if (!userId) throw new Error("Unauthorized");

  const membership = await prisma.orgMember.findUnique({
    where: {
      orgId_userId: {
        orgId: data.orgId,
        userId,
      },
    },
    select: {
      orgId: true,
    },
  });

  if (!membership) {
    throw new Error("Workspace not found.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { activeOrgId: membership.orgId },
  });

  await unstable_update({
    user: {
      id: userId,
      orgId: membership.orgId,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function revokeInvite(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = RevokeInviteSchema.parse(input);
  const orgId = session.user.orgId;
  const userId = session.user.id;
  if (!orgId || !userId) throw new Error("Unauthorized");

  await getOwnerOrg(orgId, userId);

  await prisma.invite.deleteMany({
    where: {
      id: data.inviteId,
      orgId,
      accepted: false,
    },
  });

  revalidatePath("/dashboard/settings/members");
  return { success: true };
}
