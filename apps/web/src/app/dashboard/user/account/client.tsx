"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import types
import type { User as AuthUserType } from "better-auth";
// import stuff
import { useRef, useState } from "react";
import { toast } from "sonner";
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
            <Input type="text" defaultValue={session.name} />
          </div>
          <div>
            <span>Your Email:</span>
            <Input type="text" defaultValue={session.email} />
          </div>
        </div>
      </div>
      <Button>Submit</Button>
    </div>
  );
}
