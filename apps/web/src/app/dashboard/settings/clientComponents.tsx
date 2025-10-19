"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

export function ChangeSiteSettings() {
  return (
    <>
      <section id="site"></section>
      <div className="ml-8">
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
      </div>
    </>
  );
}
