"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import types
import type { User as AuthUserType } from "better-auth";
// import stuff
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
/*import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";*/

export default function Client({ session }: { session: AuthUserType }) {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
    session.image || null,
  );
  const [name, setName] = useState(session.name);
  const email = session.email;
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const fileUploadBox = useRef<HTMLInputElement | null>(null);
  const fileUploadingDivBox = useRef<HTMLInputElement | null>(null);

  const uploadImageToServer = async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);

      const req = await fetch("/api/data/publish/file", {
        method: "POST",
        body: fd,
      });

      if (!req.ok) {
        const errorRes = await req.json().catch(() => ({}));
        throw new Error(
          errorRes.msg || `Upload failed with status ${req.status}`,
        );
      }

      const res = await req.json();
      setUploadedImageUrl(res.uploadUrl);

      // Update profile picture in database
      const updateReq = await fetch("/api/data/settings?tab=non_admin_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "profile_pic_update",
          imageUrl: res.uploadUrl,
        }),
      });

      if (!updateReq.ok) {
        throw new Error("Failed to update profile picture");
      }

      toast.success("Profile picture updated successfully!");
      return res.uploadUrl;
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message}`);
      throw e;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    const file = files?.[0];

    if (file === undefined) {
      toast.error("No File Included");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("File type not allowed. Only images are supported.");
      return;
    }

    // Check file size (5MB limit for profile pictures)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File size too large. Maximum allowed size is 5MB.");
      return;
    }

    await uploadImageToServer(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await authClient.updateUser({
        name,
      });
      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setResettingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (error) {
        throw new Error(error.message || "Failed to reset password");
      }
      toast.success("Password reset successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div>
      <span className="text-lg italic">Your Account</span>
      <hr />
      <div className="flex xs:flex-col flex-row space-x-2 mb-2 mt-2">
        <div>
          <div
            className="border-2 border-dashed rounded-full border-gray-300 p-2 text-center hover:border-blue-300 transition-colors cursor-pointer"
            ref={fileUploadingDivBox}
            onClick={() => fileUploadBox.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
              if (e.dataTransfer.files.length > 0) {
                handleFileSelect(e.dataTransfer.files);
              }
            }}
          >
            <input
              type="file"
              ref={fileUploadBox}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
            ></input>
            <img
              src={
                uploadedImageUrl !== null
                  ? uploadedImageUrl
                  : "/user/default_pfp.png"
              }
              className="rounded-full w-[100px] border"
            />
          </div>
        </div>
        <div>
          <div>
            <span>Your Name:</span>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <span>Your Email:</span>
            <Input type="text" value={email} disabled />
          </div>
        </div>
      </div>
      <div className="flex flex-row space-x-1 mt-3">
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">Reset Password</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Reset Your Password</DialogTitle>
            <div className="flex flex-col space-y-2">
              <div>
                <span className="ml-3">Current Password</span>
                <Input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <span className="ml-3">New Password</span>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <span className="ml-3">Confirm Password</span>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <Button className="cursor-pointer" onClick={handleResetPassword} disabled={resettingPassword}>
              {resettingPassword ? "Resetting..." : "Reset"}
            </Button>
          </DialogContent>
        </Dialog>
        <Button className="cursor-pointer" onClick={handleSaveProfile} disabled={saving}>
          {saving ? "Saving..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
