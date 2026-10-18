"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@devlogs_hosting/auth";
import PromoBlock from "./promoBlock";
import projectData from "@/../projectData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }
  if (session.user?.role !== "admin") {
    redirect("/dashboard");
  }
  const cpuUsage = process.cpuUsage();
  const totalMicros = cpuUsage.user + cpuUsage.system;
  const totalMillis = totalMicros / 1000;
  const formatBytes = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let value = bytes;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    return `${value.toFixed(2)} ${units[i]}`;
  };
  return (
    <div className="ml-4 space-y-4">
      <span className="text-lg italic">About this instance</span>
      <hr />
      <Table>
        <TableHead>
          <TableHeader></TableHeader>
          <TableHeader></TableHeader>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>CPU Architecture</TableCell>
            <TableCell>{process.arch.toUpperCase()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>CPU Usage</TableCell>
            <TableCell>
              {`user: ${(cpuUsage.user / 1000).toFixed(2)} ms, system: ${(cpuUsage.system / 1000).toFixed(2)} ms, total: ${totalMillis.toFixed(2)} ms`}
            </TableCell>{" "}
          </TableRow>
          <TableRow>
            <TableCell>Available Memory</TableCell>
            <TableCell>≈ {formatBytes(process.availableMemory())}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Timezone</TableCell>
            <TableCell>{process.env.TZ || "unknown"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>S3 Upload Limit</TableCell>
            <TableCell>
              {process.env.NEXT_PUBLIC_UPLOAD_LIMIT || "50"}MB
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Application Version</TableCell>
            <TableCell>v{projectData.version}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Web Server</TableCell>
            <TableCell>{process.title}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Node.js Version</TableCell>
            <TableCell>{process.version}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Warranty</TableCell>
            <TableCell>Free software, No Warranty</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>License</TableCell>
            <TableCell>MIT License</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <PromoBlock />
    </div>
  );
}
