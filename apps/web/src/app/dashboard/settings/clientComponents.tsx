"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { main_schema } from "../../../../../../packages/db/src";
import Link from "next/link";
import robotsTxtParseToJson from "@/components/robotsTxtParser";

type KeyValue = typeof main_schema.kvData.$inferSelect;

export function ChangeSiteSettings({
  serverTitleData,
  serverDescriptionData,
  checkEnabledStatus,
}: {
  serverTitleData: string;
  serverDescriptionData: string;
  checkEnabledStatus: {
    homePage: boolean;
    registration: boolean;
    robotsTxt: boolean;
  };
}) {
  const [siteSettings, setSiteSettings] = useState({
    title: serverTitleData || "",
    description: serverDescriptionData || "",
  });

  const [statusSystemPull, setStatusSystemPull] = useState(checkEnabledStatus);

  const sendData = useMutation({
    mutationFn: async (sendData2: any) => {
      const query = await fetch("/api/data/settings?tab=settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData2),
      });
      const res = await query.json();
      if (res.success) {
        toast.success("Settings Updated!");
      } else {
        toast.error(`Save failed: ${res.msg}`);
      }
      return;
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
                className="p-1 border border-gray-300 dark:border-gray-700 rounded bg-gray-200 dark:bg-gray-950"
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
                className="p-1 border border-gray-300 dark:border-gray-700 rounded bg-gray-200 dark:bg-gray-950"
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
              disabled={
                siteSettings.title.length === 0 ||
                siteSettings.description.length === 0
              }
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
      <div className="ml-8 mt-3 flex flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="home-page-enable"
            defaultChecked={statusSystemPull.homePage}
            onCheckedChange={(checked) => {
              setStatusSystemPull({
                homePage: checked,
                registration: statusSystemPull.registration,
                robotsTxt: statusSystemPull.robotsTxt,
              });
              sendData.mutate({
                action: "change_home_page_register_robotstxt_toggles",
                data: statusSystemPull,
              });
            }}
          />
          <Label htmlFor="home-page-enable">Enable home page</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="registration-enable"
            defaultChecked={statusSystemPull.registration}
            onCheckedChange={(checked) => {
              setStatusSystemPull({
                homePage: statusSystemPull.homePage,
                registration: checked,
                robotsTxt: statusSystemPull.robotsTxt,
              });
              sendData.mutate({
                action: "change_home_page_register_robotstxt_toggles",
                data: statusSystemPull,
              });
            }}
          />
          <Label htmlFor="registration-enable">Enable registration</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="robots-enable"
            defaultChecked={statusSystemPull.robotsTxt}
            onCheckedChange={(checked) => {
              setStatusSystemPull({
                homePage: statusSystemPull.homePage,
                registration: statusSystemPull.registration,
                robotsTxt: checked,
              });
              sendData.mutate({
                action: "site_title_description",
                title: siteSettings.title,
                description: siteSettings.description,
              });
            }}
          />
          <Label htmlFor="robots-enable">Enable robots.txt</Label>
        </div>
      </div>
    </>
  );
}

export function ChangeRobotsTxt({
  currentRobotsTxt,
}: {
  currentRobotsTxt: KeyValue;
}) {
  const [remoteListURL, setRemoteListURL] = useState("");
  const sendData = useMutation({
    mutationFn: async (sendData2: any) => {
      const query = await fetch("/api/data/settings?tab=settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData2),
      });
      const res = await query.json();
      if (res.success) {
        toast.success("Settings Updated!");
      } else {
        toast.error(`Save failed: ${res.msg}`);
      }
      return;
    },
  });
  const getRobotsTxtAndConvert = async () => {
    try {
      if (
        !(
          remoteListURL.startsWith("https://") ||
          remoteListURL.startsWith("http://")
        )
      ) {
        throw new Error("Not an valid URL!");
      }
      const req = await fetch(remoteListURL);
      const res = await req.text();
      const parsedResult = robotsTxtParseToJson(res);

      setRemoteListURL("");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message);
      return;
    }
  };
  return (
    <>
      <section id="robots"></section>
      <div className="ml-8">
        <h1 className="text-2xl text-bold ml-1 mb-1">Change Robots.txt</h1>
        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
          <div className="flex flex-col md:flex-row justify-center w-full gap-2">
            <span className="my-auto">Import remote list (.txt): </span>
            <input
              type="text"
              className="p-1 border border-gray-300 dark:border-gray-700 rounded bg-gray-200 dark:bg-gray-950"
              value={remoteListURL}
              onChange={(e) => setRemoteListURL(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  getRobotsTxtAndConvert();
                }
              }}
            />
            <Button onClick={getRobotsTxtAndConvert}>Submit</Button>
          </div>
          <div className="flex flex-row justify-between">
            <span className="mx-auto mt-1 justify-center align-middle w-full text-center text-blue-600 hover:text-blue-600/80 dark:text-blue-400 dark:hover:text-blue-400/80 transition-all duration-300">
              <Link href="https://github.com/hpware/log">
                How can I add a remote list?
              </Link>
            </span>
          </div>
          <div className="flex flex-row justify-between">
            {`            sendData.mutate({
  action: "site_robots_txt_json",
  data: parsedResult,
});`}
          </div>
        </div>
      </div>
    </>
  );
}
