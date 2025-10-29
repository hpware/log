"use client";
import { Button } from "@/components/ui/button";
import type { RefObject } from "react";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { FileUp, XCircleIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { main_schema } from "../../../../../../../packages/db/src";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { PublicPostsAndVideos } from "@/components/publicPostsAndVideos";

type Post = typeof main_schema.userPosts.$inferSelect;

export default function Dashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const [currentOption, setCurrentOption] = useState<
    "text" | "photo" | "video"
  >("text");
  const [handleStatus, setHandleStatus] = useState({
    failed: false,
    msg: "",
  });
  const [textBoxData, setTextBoxData] = useState("");
  const [tagData, setTagData] = useState<{
    tags: string[];
    inputBox: string;
  }>({
    tags: [],
    inputBox: "",
  });
  const [isPending, setIsPending] = useState(false);
  const [previewData, setPreviewData] = useState<Post[]>([]);
  const fileUploadBox = useRef<HTMLInputElement | null>(null);
  const fileUploadingDivBox = useRef<HTMLInputElement | null>(null);
  const sendDataToServer = useMutation({
    mutationFn: async (data: {
      type: "text" | "photo" | "video";
      text?: string;
      file?: File | null;
    }) => {
      toast.promise(
        async () => {
          setIsPending(true);
          let uploadUrl = "";
          if (data.type !== "text") {
            const fd = new FormData();
            if (data.file) fd.append("file", data.file);

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
            if (!res.success) {
              throw new Error(res.msg || "Upload failed");
            }

            uploadUrl = res.uploadUrl;
          }
          const req = await fetch("/api/data/publish", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: data.type,
              text: data.text || "",
              imageUrl: uploadUrl,
              status: "public",
              ...(tagData.tags?.length > 0 && { tags: tagData.tags }),
            }),
          });
          const res = await req.json();
          if (!res.success) {
            setIsPending(false);
            console.error(`ERR_SERVER_RESPOSE: ${res.msg}`);
            throw new Error(`${res.msg}`);
          }
          setCurrentOption("text");
          setTagData({
            tags: [],
            inputBox: "",
          });
          setTextBoxData("");
          setIsPending(false);
        },
        {
          loading: "Sending...",
          success: "Saved!",
          error: (error) => `Error saving your post. ERR: ${error}`,
        },
      );
    },
  });

  const handleSend = () => {
    setHandleStatus({
      failed: false,
      msg: "",
    });

    if (currentOption !== "text" && !fileUploadBox.current?.files?.[0]) {
      setHandleStatus({
        failed: true,
        msg: "No files uploaded.",
      });
      toast.error("No files uploaded.");
      return;
    }

    // Validate file type and size on client side
    if (currentOption !== "text" && fileUploadBox.current?.files?.[0]) {
      const file = fileUploadBox.current.files[0];
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ];

      if (!allowedTypes.includes(file.type)) {
        setHandleStatus({
          failed: true,
          msg: "File type not allowed. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, MOV).",
        });
        toast.error("File type not allowed.");
        return;
      }

      // Check file size (50MB default)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        setHandleStatus({
          failed: true,
          msg: "File size too large. Maximum allowed size is 50MB.",
        });
        toast.error("File size too large.");
        return;
      }
    }
    if (currentOption === "text" && !textBoxData) {
      setHandleStatus({
        failed: true,
        msg: "No text provided.",
      });
      toast.error("No text provided.");
      return;
    }
    const file = fileUploadBox.current?.files?.[0];
    sendDataToServer.mutate({
      type: currentOption,
      text: textBoxData || "",
      file,
    });
  };
  const deleteTag = (tag: string) => {
    setTagData({
      inputBox: tagData.inputBox,
      tags: tagData.tags.filter((i) => i !== tag),
    });
  };
  const setPreviewDataFunction = () => {
    setPreviewData([
      {
        postId: "never-gonna-give-you-up-never-gonna-let-you-down",
        type: currentOption,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        byUser: session.user.id,
        textData: textBoxData,
        imageUrl: "",
        videoUrl: "",
        status: "draft",
        tags: tagData.tags,
      },
    ]);
  };
  return (
    <div className="flex flex-col w-full">
      <Tabs
        defaultValue="text"
        className="pl-2 w-full"
        onValueChange={(vl) => {
          setCurrentOption(vl as "text" | "photo" | "video");
        }}
      >
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="photo">Photo</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>
        <Tabs defaultValue="draft" className="">
          <TabsList>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
            <TabsTrigger value="unlisted">Link-only</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
          </TabsList>
        </Tabs>
        <span>
          tags:
          <input
            type="text"
            value={tagData.inputBox}
            maxLength={20}
            onChange={(e) => {
              setTagData({ tags: tagData.tags, inputBox: e.target.value });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Space") {
                e.preventDefault();
                if (tagData.inputBox.replaceAll(" ", "").length === 0) {
                  toast.error("This cannot be empty");
                  return;
                }
                if (tagData.tags.includes(tagData.inputBox)) {
                  toast.error("This tag is already used in this post.");
                  return;
                }
                setTagData({
                  tags: [...tagData.tags, tagData.inputBox.replaceAll(" ", "")],
                  inputBox: "",
                });
              }
            }}
          />
        </span>
        <div className="flex flex-row gap-1 flex-wrap">
          {tagData.tags.map((it: string) => (
            <button key={it} onClick={() => deleteTag(it)}>
              <Badge
                variant="default"
                className="hover:bg-red-500 hover:text-white hover:line-through justify-center text-center transition-all duration-300"
              >
                {it}
              </Badge>
            </button>
          ))}
        </div>
        <textarea
          value={textBoxData}
          onChange={(v) => setTextBoxData(v.target.value)}
          className="border w-full h-12 resize-none rounded"
        />
        <TabsContent value="photo">
          <UploadComponent
            fileUploadingDivBox={fileUploadingDivBox}
            fileUploadBox={fileUploadBox}
          />
        </TabsContent>
        <TabsContent value="video">
          <UploadComponent
            fileUploadingDivBox={fileUploadingDivBox}
            fileUploadBox={fileUploadBox}
          />
        </TabsContent>
      </Tabs>
      <div className="gap-1 flex flex-row ml-1">
        <Button onClick={handleSend} disabled={isPending}>
          Send it!
        </Button>
        <Button onClick={setPreviewDataFunction}>View Preview</Button>
      </div>
      <div>
        <span className="ml-5 mt-3 text-xl font-bold">Preview</span>
        <PublicPostsAndVideos
          mode="search"
          passedData={previewData}
          key={`${previewData.length}-${crypto.randomUUID()}`}
          noDisplay={["link", "profileLink"]}
        />
      </div>
    </div>
  );
}

function UploadComponent({
  fileUploadingDivBox,
  fileUploadBox,
}: {
  fileUploadingDivBox: RefObject<HTMLInputElement | null>;
  fileUploadBox: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div
      className="border-2 border-gray-400"
      ref={fileUploadingDivBox}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add("border-blue-500", "bg-gray-50");
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-blue-500", "bg-gray-50");
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("border-blue-500", "bg-gray-50");
        if (e.dataTransfer.files.length > 0 && fileUploadBox.current) {
          const file = e.dataTransfer.files[0];
          fileUploadBox.current.files = e.dataTransfer.files;
          console.log("Dropped file:", file.name);
        }
      }}
    >
      <input type="file" ref={fileUploadBox}></input>
      <FileUp />
      <span>Upload your file here</span>
    </div>
  );
}
