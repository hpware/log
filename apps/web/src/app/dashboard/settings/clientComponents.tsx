"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { main_schema } from "../../../../../../packages/db/src";
import Link from "next/link";
import robotsTxtParseToJson from "@/components/robotsTxtParser";

// types
type KeyValue = typeof main_schema.kvData.$inferSelect;
type RobotsParsedJson = Record<string, { allow: string[]; disallow: string[] }>;

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

  const [statusSystemPull, setStatusSystemPull] = useState<{
    homePage: boolean;
    registration: boolean;
    robotsTxt: boolean;
    sysFailed: boolean;
  }>({
    homePage: false,
    registration: false,
    robotsTxt: false,
    sysFailed: true,
  });

  const getToggleData = useMutation({
    mutationFn: async () => {
      try {
        const req = await fetch("/api/data/settings?tab=settings", {
          method: "POST",
          headers: {
            "Content-Type": "appilcation/json",
          },
          body: JSON.stringify({
            action: "obtain_toggle_data_for_robotsTxt_and_others",
          }),
        });
        const res = await req.json();
        if (res.success != true) {
          throw new Error(res.msg);
        }
        setStatusSystemPull({
          homePage: res.data.homePage,
          registration: res.data.registration,
          robotsTxt: res.data.robotsTxt,
          sysFailed: false,
        });
        return;
      } catch (e: any) {
        setStatusSystemPull({
          homePage: statusSystemPull.homePage,
          registration: statusSystemPull.registration,
          robotsTxt: statusSystemPull.robotsTxt,
          sysFailed: true,
        });
        console.error(e);
        toast.error(`Fetch Failed: ${e.message}`);
      }
    },
  });

  useEffect(() => getToggleData.mutate(), []);

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
            checked={statusSystemPull.homePage}
            onCheckedChange={(checked) => {
              console.log(`Home Page: ${checked}`);
              setStatusSystemPull({
                homePage: checked,
                registration: statusSystemPull.registration,
                robotsTxt: statusSystemPull.robotsTxt,
                sysFailed: statusSystemPull.sysFailed,
              });
              sendData.mutate({
                action: "change_home_page_register_robotstxt_toggles",
                data: {
                  homePage: checked,
                  registration: statusSystemPull.registration,
                  robotsTxt: statusSystemPull.robotsTxt,
                },
              });
              getToggleData.mutate();
            }}
            disabled={statusSystemPull.sysFailed}
          />
          <Label htmlFor="home-page-enable">Enable home page</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="registration-enable"
            checked={statusSystemPull.registration}
            onCheckedChange={(checked) => {
              console.log(`Reg: ${checked}`);
              setStatusSystemPull({
                homePage: statusSystemPull.homePage,
                registration: checked,
                robotsTxt: statusSystemPull.robotsTxt,
                sysFailed: statusSystemPull.sysFailed,
              });
              sendData.mutate({
                action: "change_home_page_register_robotstxt_toggles",
                data: {
                  homePage: statusSystemPull.homePage,
                  registration: checked,
                  robotsTxt: statusSystemPull.robotsTxt,
                },
              });
              getToggleData.mutate();
            }}
            disabled={statusSystemPull.sysFailed}
          />
          <Label htmlFor="registration-enable">Enable registration</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="robots-enable"
            checked={statusSystemPull.robotsTxt}
            onCheckedChange={(checked) => {
              console.log(`Robots: ${checked}`);
              setStatusSystemPull({
                homePage: statusSystemPull.homePage,
                registration: statusSystemPull.registration,
                robotsTxt: checked,
                sysFailed: statusSystemPull.sysFailed,
              });
              sendData.mutate({
                action: "change_home_page_register_robotstxt_toggles",
                data: {
                  homePage: statusSystemPull.homePage,
                  registration: statusSystemPull.registration,
                  robotsTxt: checked,
                },
              });
              getToggleData.mutate();
            }}
            disabled={statusSystemPull.sysFailed}
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
  const [saveListUrl, setSaveListUrl] = useState<RobotsParsedJson>({});
  const [importCopyList, setImportCopyList] = useState("");
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
      setSaveListUrl({ ...saveListUrl, ...parsedResult });
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
            <Button onClick={getRobotsTxtAndConvert}>Get</Button>
          </div>
          <div className="flex flex-col md:flex-row justify-center w-full gap-2 mt-2">
            <span className="my-auto">Import list (copy): </span>
            <textarea
              className="p-1 border border-gray-300 dark:border-gray-700 rounded bg-gray-200 dark:bg-gray-950"
              value={importCopyList}
              onChange={(e) => setImportCopyList(e.target.value)}
            />
            <Button
              onClick={() => {
                const parsedResult = robotsTxtParseToJson(importCopyList);
                setSaveListUrl({ ...saveListUrl, ...parsedResult });
                setImportCopyList("");
              }}
              className="my-auto"
            >
              Get
            </Button>
          </div>
          <div className="flex flex-row justify-between">
            <span className="mx-auto mt-1 justify-center align-middle w-full text-center text-blue-600 hover:text-blue-600/80 dark:text-blue-400 dark:hover:text-blue-400/80 transition-all duration-300">
              <Link href="https://github.com/hpware/log">
                How can I add a remote list?
              </Link>
            </span>
          </div>
          {(
            Object.entries(saveListUrl) as [
              string,
              { allow: string[]; disallow: string[] },
            ][]
          ).map(([agent, rules]) => (
            <div key={agent}>
              <hr />
              <h3>{agent === "*" ? "[WILDCARD]" : agent}</h3>
              <p>
                <strong>Allow:</strong>{" "}
                {rules.allow.length ? rules.allow.join(", ") : "(none)"}
              </p>
              <p>
                <strong>Disallow:</strong>{" "}
                {rules.disallow.length ? rules.disallow.join(", ") : "(none)"}
              </p>
            </div>
          ))}
          <div className="flex flex-col md:flex-row justify-between">
            <span></span>
            <Button
              onClick={() =>
                sendData.mutate({
                  action: "site_robots_txt_json",
                  data: saveListUrl,
                })
              }
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
