"use client";
import { XIcon } from "lucide-react";
import Image from "next/image";

export default function ImageView({
  imageSrc,
  closeState,
}: {
  imageSrc: string;
  closeState: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xl z-10 justify-center items-center flex">
        <div className="bg-amber-700 flex flex-col justify-center p-1 pt-3 z-50 mx-auto">
          <div className="flex flex-row justify-between px-3">
            <span>Image</span>
            <button className="" onClick={closeState}>
              <XIcon />
            </button>
          </div>
          <div>
            <Image
              src={imageSrc}
              alt="Preview Image"
              width={500}
              height={500}
            />
          </div>
        </div>
      </div>
    </>
  );
}
