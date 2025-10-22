"use client";
import { Button } from "@/components/ui/button";
import type { RefObject } from "react";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const fileUploadBox = useRef<HTMLInputElement | null>(null);
  const fileUploadingDivBox = useRef<HTMLInputElement | null>(null);
  const sendDataToServer = useMutation({
    mutationFn: async (data: {
      type: "text" | "photo" | "video";
      text?: string;
      file?: File | null;
    }) => {
      let uploadUrl = "";
      if (data.type !== "text") {
        const fd = new FormData();
        if (data.file) fd.append("file", data.file);
        const req = await fetch("/api/data/publish/file", {
          method: "POST",
          body: fd,
        });
        if (!req.ok) throw new Error("Failed to upload file");
        const res = await req.json();
        if (res.success) {
          uploadUrl = res.uploadUrl;
        }
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
        }),
      });
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
      toast.error(handleStatus.msg);
      return;
    }
    if (currentOption === "text" && !textBoxData) {
      setHandleStatus({
        failed: true,
        msg: "No text provided.",
      });
      toast.error(handleStatus.msg);
      return;
    }
    const file = fileUploadBox.current?.files?.[0];
    sendDataToServer.mutate({
      type: currentOption,
      text: textBoxData || "",
      file,
    });
  };
  return (
    <div className="flex flex-col">
      <Tabs
        defaultValue="text"
        className="pl-2"
        onValueChange={(vl) => {
          setCurrentOption(vl as "text" | "photo" | "video");
        }}
      >
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="photo">Photo</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>
        <span>
          tags:
          <input
            type="text"
            value={tagData.inputBox}
            onChange={(e) => {
              setTagData({ tags: tagData.tags, inputBox: e.target.value });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (tagData.inputBox.length === 0) {
                  toast.error("This cannot be empty");
                  return;
                }
                if (tagData.tags.includes(tagData.inputBox)) {
                  toast.error("This tag is already used in this post.");
                  return;
                }
                setTagData({
                  tags: [...tagData.tags, tagData.inputBox],
                  inputBox: "",
                });
              }
            }}
          />
        </span>
        <div className="flex flex-row gap-1 flex-wrap">
          {tagData.tags.map((it: string) => (
            <Badge variant="default" key={it}>
              {it}
            </Badge>
          ))}
        </div>
        <textarea
          value={textBoxData}
          onChange={(v) => setTextBoxData(v.target.value)}
          className="border w-1/2 h-12"
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
      <button onClick={handleSend} disabled={sendDataToServer.isPending}>
        {sendDataToServer.isPending ? "Sending..." : "Send it!"}
      </button>
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
