"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";
import { getPersonaImageFallbackChain } from "@/lib/quiz/personaVisuals";

type PersonaImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function PersonaImage({ src, alt, onError, ...restProps }: PersonaImageProps) {
  const fallbackChain = useMemo(() => getPersonaImageFallbackChain(src), [src]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSrc = fallbackChain[Math.min(currentIndex, fallbackChain.length - 1)];

  return (
    <Image
      {...restProps}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentIndex < fallbackChain.length - 1) {
          setCurrentIndex((value) => value + 1);
        }
        onError?.(event);
      }}
    />
  );
}
