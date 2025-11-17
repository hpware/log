"use client";
import { useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";

function CropDemo({ src }: { src: string }) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%", // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });

  return (
    <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
      <img src={src || "/user/default_pfp.png"} />
    </ReactCrop>
  );
}

export default function Page() {
  const [demo, setDemo] = useState<string>("");
  return (
    <div>
      <div className="flex flex-row">
        <span>URL: </span>
        <input
          type="text"
          value={demo}
          onChange={(e) => setDemo(e.target.value)}
        />
      </div>
      <CropDemo src={demo} />
    </div>
  );
}
