"use client";

import cn from "classnames";
import Image from "@components/ui/next-image";
import type { Attachment } from "@framework/types";
import { useState, useEffect } from "react";

interface ProductGalleryImageProps {
  image?: Attachment | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: "cover" | "contain";
  priority?: boolean;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}

const ProductGalleryImage = ({
  image,
  alt,
  className,
  width = 475,
  height = 618,
  objectFit = "cover",
  priority = false,
  loading,
  fetchPriority,
}: ProductGalleryImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [image?.original, image?.thumbnail]);

  const src = image?.original ?? image?.thumbnail ?? "/assets/placeholder/products/product-gallery.svg";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-200",
        !isLoaded && "animate-pulse",
        className
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit={objectFit}
        className="bg-gray-200"
        priority={priority}
        loading={loading}
        fetchPriority={fetchPriority}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default ProductGalleryImage;
