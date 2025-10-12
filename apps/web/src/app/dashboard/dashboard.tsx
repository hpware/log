"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { useRef, useState } from "react";

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
  const fileUploadBox = useRef<HTMLInputElement | null>(null);
  const fileUploadingDivBox = useRef<HTMLInputElement | null>(null);
  const sendDataToServer = useMutation({
    mutationFn: async (data: {
      type: "text" | "photo" | "video";
      text?: string;
      file?: File | null;
    }) => {
      if (data.type !== "text") {
        const fd = new FormData();
        if (data.file) fd.append("file", data.file);
        const res = await fetch("/api/publish/file", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error("Failed to upload file");
        return res.json();
      }
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
      return;
    }
    if (currentOption === "text" && !textBoxData) {
      setHandleStatus({
        failed: true,
        msg: "No text provided.",
      });
      return;
    }
    const file = fileUploadBox.current?.files?.[0];
    sendDataToServer.mutate({
      type: currentOption,
      text: "textValue",
      file,
    });
  };
  return (
    <div className="flex flex-col">
      <select
        value={currentOption}
        onChange={(e) =>
          setCurrentOption(e.target.value as "text" | "photo" | "video")
        }
      >
        <option value="text">text</option>
        <option value="photo">photo</option>
        <option value="video">video</option>
      </select>
      <span>
        tags:
        <input type="text" />
      </span>
      <textarea
        value={textBoxData}
        onChange={(v) => setTextBoxData(v.target.value)}
        className="border w-1/2 h-12"
      />
      {currentOption !== "text" && (
        <div className="border-2 border-gray-400" ref={fileUploadingDivBox}>
          <input type="file" ref={fileUploadBox}></input>
          <FileUp />
          <span>Upload your file here</span>
        </div>
      )}
      {handleStatus.failed && (
        <span className="text-red-500 dark:text-red-300">
          {handleStatus.msg}
        </span>
      )}
      <button onClick={handleSend} disabled={sendDataToServer.isPending}>
        {sendDataToServer.isPending ? "Sending..." : "Send it!"}
      </button>{" "}
    </div>
  );
}
