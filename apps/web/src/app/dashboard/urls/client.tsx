"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LinkIcon, TrashIcon, CopyIcon } from "lucide-react";

interface ShortUrl {
  id: number;
  urlSlug: string;
  targetUrl: string;
  createdAt: string;
}

export default function Client() {
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["shortUrls"],
    queryFn: async () => {
      const res = await fetch("/api/data/get_short_urls");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data as ShortUrl[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/data/shorten_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlSlug: slug, targetUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortUrls"] });
      setSlug("");
      setTargetUrl("");
      toast.success("Short URL created");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/data/delete_short_url?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortUrls"] });
      toast.success("Short URL deleted");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">URL Shortener</h1>
        <p className="text-muted-foreground">
          Create and manage your shortened URLs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Short URL</CardTitle>
          <CardDescription>
            Enter a URL and an optional custom slug
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="Custom slug (e.g., my-link)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="sm:w-48"
            />
            <Input
              placeholder="https://example.com/very/long/url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !targetUrl}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Shorten
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Slug can contain letters, numbers, hyphens and underscores. If left
            blank, a random slug will be generated.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Short URLs</CardTitle>
          <CardDescription>
            {data?.length || 0} shortened URL(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No short URLs yet. Create one above!
            </div>
          ) : (
            <div className="space-y-2">
              {data?.map((url) => (
                <div
                  key={url.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">
                        {baseUrl}/u/{url.urlSlug}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(`${baseUrl}/u/${url.urlSlug}`)
                        }
                      >
                        <CopyIcon className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      → {url.targetUrl}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(url.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="ml-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Short URL?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the short URL{" "}
                          <strong>{url.urlSlug}</strong>. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteMutation.mutate(url.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Shortener",
};