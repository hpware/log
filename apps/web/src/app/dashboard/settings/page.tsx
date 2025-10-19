import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import { authClient } from "@/lib/auth-client";

const changeSiteSettingsDivs = [
  {
    title: "Title",
    required: true,
    info: "This adds the site title to the info & user page. The home page will not be supported.",
    inputType: "text",
    saveAsType: "title",
    gaporcol: "col",
  },
  {
    title: "Description",
    required: true,
    info: "This adds the site description to the info & user page. The home page will not be supported.",
    inputType: "text",
    saveAsType: "description",
    gaporcol: "col",
  },
];

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="ml-4">
      <section id="site" className="ml-8">
        <h1 className="text-2xl text-bold ml-1 mb-1">Change Site Settings</h1>
        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-col gap-1">
              <span>
                Site Title:{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </span>
              <input
                type="text"
                className="border border-gray-300 dark:border-gray-700 rounded bg-gray-200 dark:bg-gray-950"
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
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
