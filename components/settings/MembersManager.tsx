"use client";

import { Loader2, Mail, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { inviteMember, removeMember, revokeInvite } from "@/actions/org";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type MemberRole = "OWNER" | "MEMBER";

export interface SettingsMember {
  userId: string;
  name: string | null;
  email: string;
  role: MemberRole;
}

export interface SettingsInvite {
  id: string;
  email: string;
  expiresAt: string;
}

interface MembersManagerProps {
  members: SettingsMember[];
  pendingInvites: SettingsInvite[];
  isOwner: boolean;
  currentUserId: string;
}

function getDisplayName(member: SettingsMember) {
  return member.name || member.email;
}

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function MembersManager({
  members,
  pendingInvites,
  isOwner,
  currentUserId,
}: MembersManagerProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      void inviteMember({ email })
        .then(() => {
          setEmail("");
          toast.success("Invite sent");
          router.refresh();
        })
        .catch((inviteError: unknown) => {
          toast.error(getErrorMessage(inviteError));
        });
    });
  }

  function handleRemoveMember(member: SettingsMember) {
    if (!window.confirm(`Remove ${getDisplayName(member)} from this workspace?`)) {
      return;
    }

    setPendingId(member.userId);
    startTransition(() => {
      void removeMember({ userId: member.userId })
        .then(() => {
          toast.success("Member removed");
          router.refresh();
        })
        .catch((removeError: unknown) => {
          toast.error(getErrorMessage(removeError));
        })
        .finally(() => setPendingId(null));
    });
  }

  function handleRevokeInvite(invite: SettingsInvite) {
    if (!window.confirm(`Revoke invite for ${invite.email}?`)) {
      return;
    }

    setPendingId(invite.id);
    startTransition(() => {
      void revokeInvite({ inviteId: invite.id })
        .then(() => {
          toast.success("Invite revoked");
          router.refresh();
        })
        .catch((revokeError: unknown) => {
          toast.error(getErrorMessage(revokeError));
        })
        .finally(() => setPendingId(null));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Users
              aria-hidden="true"
              className="h-6 w-6 text-slate-500 dark:text-gray-400"
            />
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
              Members
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            Manage who can access this workspace.
          </p>
        </div>
      </div>

      {isOwner ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
            Invite member
          </h2>
          <form
            onSubmit={handleInvite}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <label className="sr-only" htmlFor="invite-email">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
              placeholder="teammate@example.com"
            />
            <Button type="submit" disabled={isPending}>
              {isPending && pendingId === null ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail aria-hidden="true" className="h-4 w-4" />
                  Send invite
                </>
              )}
            </Button>
          </form>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
            Current members
          </h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-gray-800">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-950 dark:text-gray-100">
                  {getDisplayName(member)}
                  {member.userId === currentUserId ? (
                    <span className="ml-2 text-xs font-normal text-slate-500 dark:text-gray-400">
                      You
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 truncate text-sm text-slate-500 dark:text-gray-400">
                  {member.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                    member.role === "OWNER"
                      ? "bg-slate-950 text-white dark:bg-gray-100 dark:text-gray-950"
                      : "bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300",
                  )}
                >
                  {member.role}
                </span>
                {isOwner ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending && pendingId === member.userId}
                    onClick={() => handleRemoveMember(member)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    {isPending && pendingId === member.userId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Remove
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {isOwner ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
              Pending invites
            </h2>
          </div>
          {pendingInvites.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-gray-800">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-950 dark:text-gray-100">
                      {invite.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                      Expires {formatExpiry(invite.expiresAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending && pendingId === invite.id}
                    onClick={() => handleRevokeInvite(invite)}
                    className="self-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 sm:self-auto"
                  >
                    {isPending && pendingId === invite.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Revoke
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-slate-600 dark:text-gray-300">
              No pending invites.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
