"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export function ChangeSiteSettings({
  serverTitleData,
  serverDescriptionData,
}: {
  serverTitleData: string;
  serverDescriptionData: string;
}) {
  const [siteSettings, setSiteSettings] = useState({
    title: serverTitleData || "",
    description: serverDescriptionData || "",
  });

  const sendData = useMutation({
    mutationFn: async (sendData2: any) => {
      return await fetch("/api/data/settings?tab=settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData2),
      });
    },
  });

  return (
    <>
      <section id="site"></section>
      <div className="ml-8">
        <h1 className="text-2xl text-bold ml-1 mb-1">Change Site Settings</h1>
        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
          <div className="flex flex-col md:flex-row justify-between w-full gap-3">
            <div className="flex flex-col gap-1">
              <span>
                Site Title:{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </span>
              <input
                type="text"
                className="border border-gray-300 dark:border-gray-700 rounded bg-gray-200 dark:bg-gray-950"
                value={siteSettings.title}
                onChange={(e) => {
                  setSiteSettings({
                    title: e.target.value,
                    description: siteSettings.description,
                  });
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span>
                Site Description:{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </span>
              <input
                type="text"
                className="border border-gray-300 dark:border-gray-700 rounded bg-gray-200 dark:bg-gray-950"
                value={siteSettings.description}
                onChange={(e) => {
                  setSiteSettings({
                    title: siteSettings.title,
                    description: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div className="flex flex-row justify-between mt-3">
            <div></div>
            <Button
              variant="outline"
              className="transition-all duration-300 cursor-pointer"
              onClick={() =>
                sendData.mutate({
                  action: "site_title_description",
                  title: siteSettings.title,
                  description: siteSettings.description,
                })
              }
            >
              <SaveIcon /> Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
