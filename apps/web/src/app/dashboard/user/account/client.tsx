"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "better-auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Client({ session }: { session: User }) {
  const router = useRouter();
  const [name, setName] = useState(session.name);
  const [image, setImage] = useState(session.image);
  const [pending, setPending] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type,
      ) ||
      file.size > 5 * 1024 * 1024
    ) {
      toast.error("Choose a JPEG, PNG, GIF, or WebP image under 5 MiB.");
      return;
    }
    setPending(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/data/publish/file", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || "Upload failed");
      const update = await fetch("/api/data/settings?tab=non_admin_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "profile_pic_update",
          imageUrl: result.uploadUrl,
        }),
      });
      const saved = await update.json();
      if (!update.ok || !saved.success)
        throw new Error(saved.msg || "Could not save profile picture");
      setImage(result.uploadUrl);
      await authClient.getSession({ query: { disableCookieCache: true } });
      router.refresh();
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setPending(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl">Your account</h1>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!pending) void upload(event.dataTransfer.files[0]);
        }}
      >
        <button
          type="button"
          disabled={pending}
          onClick={() => fileInput.current?.click()}
          className="rounded-full border-2 border-dashed p-2"
          aria-label="Change profile picture"
        >
          <img
            src={image || "/user/default_pfp.png"}
            alt="Your profile picture"
            className="rounded-full w-24 h-24 object-cover"
          />
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(event) => void upload(event.target.files?.[0])}
        />
        <p className="text-sm text-muted-foreground">
          Click or drop an image to change your picture.
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          try {
            const result = await authClient.updateUser({ name: name.trim() });
            if (result.error)
              throw new Error(result.error.message || "Could not update name");
            router.refresh();
            toast.success("Account updated");
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Could not update account",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <label className="block">
          Your name
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={200}
            autoComplete="name"
          />
        </label>
        <label className="block">
          Sign-in email
          <Input type="email" value={session.email} readOnly />
        </label>
        <Button disabled={pending || !name.trim()} type="submit">
          Save account
        </Button>
      </form>
      <Dialog
        open={passwordOpen}
        onOpenChange={(open) => {
          setPasswordOpen(open);
          if (!open) setPassword({ current: "", next: "", confirm: "" });
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" disabled={pending}>
            Change password
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Change your password</DialogTitle>
          <DialogDescription>
            Enter your current password. Other sessions will be signed out.
          </DialogDescription>
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (password.next !== password.confirm) {
                toast.error("Passwords do not match");
                return;
              }
              setPending(true);
              try {
                const result = await authClient.changePassword({
                  currentPassword: password.current,
                  newPassword: password.next,
                  revokeOtherSessions: true,
                });
                if (result.error)
                  throw new Error(
                    result.error.message || "Could not change password",
                  );
                setPassword({ current: "", next: "", confirm: "" });
                setPasswordOpen(false);
                toast.success("Password changed");
                router.refresh();
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Could not change password",
                );
              } finally {
                setPending(false);
              }
            }}
          >
            <label className="block">
              Current password
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password.current}
                onChange={(event) =>
                  setPassword({ ...password, current: event.target.value })
                }
              />
            </label>
            <label className="block">
              New password
              <Input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password.next}
                onChange={(event) =>
                  setPassword({ ...password, next: event.target.value })
                }
              />
            </label>
            <label className="block">
              Confirm new password
              <Input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password.confirm}
                onChange={(event) =>
                  setPassword({ ...password, confirm: event.target.value })
                }
              />
            </label>
            <Button disabled={pending} type="submit">
              Save password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
