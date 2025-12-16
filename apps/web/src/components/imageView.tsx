"use client";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";

export default function ImageView({
  imageSrc,
  closeState,
}: {
  imageSrc: string;
  closeState: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xl z-10 justify-center items-center flex transition-all duration-75"
        onClick={closeState}
      >
        <div
          className="bg-amber-700 flex flex-col justify-center p-3 pt-4 z-50 mx-auto rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row justify-between px-3 pb-3">
            <span>Image</span>
            <motion.button
              onClick={closeState}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              className="cursor-pointer"
            >
              <XIcon />
            </motion.button>
          </div>
          <div>
            <img
              src={imageSrc}
              alt="Preview Image"
              width={500}
              height={500}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </>
  );
}
