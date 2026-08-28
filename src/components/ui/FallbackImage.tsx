"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

type FallbackImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc: string;
};

export function FallbackImage({ src, fallbackSrc, ...props }: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={props.alt ?? ""}
      onError={() => setCurrentSrc(fallbackSrc)}
    />
  );
}