"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
export default function ImageView({
  imageSrc,
  closeState,
}: {
  imageSrc: string;
  closeState: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) closeState();
      }}
    >
      <DialogContent className="sm:max-w-5xl">
        <DialogTitle>Image</DialogTitle>
        <DialogDescription className="sr-only">
          Expanded post image
        </DialogDescription>
        <img
          src={imageSrc}
          alt="Expanded post image"
          className="max-h-[80dvh] max-w-full object-contain mx-auto"
        />
      </DialogContent>
    </Dialog>
  );
}
