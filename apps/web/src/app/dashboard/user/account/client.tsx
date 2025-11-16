"use client";
import { Input } from "@/components/ui/input";
// import types
import type { User as AuthUserType } from "better-auth";
// import stuff
import { useRef } from "react";

export default function Client({ session }: { session: AuthUserType }) {
  const fileUploadBox = useRef<HTMLInputElement | null>(null);
  const fileUploadingDivBox = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <span className="text-lg italic">Your Account</span>
      <hr />
      <div className="flex xs:flex-col flex-row space-x-2 mb-2 mt-2">
        <div>
          <div
            className="border-2 border-dashed rounded-full border-gray-300 p-2 text-center transition-colors cursor-pointer"
            ref={fileUploadingDivBox}
            onClick={() => fileUploadBox.current?.click()}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
              if (e.dataTransfer.files.length > 0 && fileUploadBox.current) {
                const file = e.dataTransfer.files[0];
                fileUploadBox.current.files = e.dataTransfer.files;
                console.log("Dropped file:", file.name);
              }
            }}
          >
            <input
              type="file"
              ref={fileUploadBox}
              className="hidden"
              accept="image/*,video/*"
            ></input>
            <img
              src={
                session.image !== null ? session.image : "/user/default_pfp.png"
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
      <span>{JSON.stringify(session)}</span>
    </div>
  );
}
