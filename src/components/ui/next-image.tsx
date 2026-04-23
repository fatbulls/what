import React from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";

type LegacyLayout = "fill" | "responsive" | "intrinsic" | "fixed";

type ImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  width?: number | string;
  height?: number | string;
  objectFit?: React.CSSProperties["objectFit"];
  objectPosition?: React.CSSProperties["objectPosition"];
  priority?: boolean;
  layout?: LegacyLayout;
  quality?: number;
  sizes?: string;
  loader?: NextImageProps["loader"];
};

const CDN_HOST = "assets.becauseyou.com.my";
const CDN_ORIGIN_HOSTS = new Set([
  CDN_HOST,
  "becauseyou-oss.s3.ap-southeast-1.amazonaws.com",
  "becauseyou.com.my",
]);

const DEFAULT_SIZES = "(max-width: 768px) 100vw, 50vw";
const DEFAULT_REMOTE_QUALITY = 85;

const toNumber = (value?: number | string) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const normalizeToCdnPath = (input?: string) => {
  if (!input || input.startsWith("data:")) {
    return null;
  }
  const value = `${input}`.trim();
  const hasProtocol = /^https?:\/\//i.test(value);
  const isProtocolRelative = value.startsWith("//");
  if (!hasProtocol && !isProtocolRelative) {
    return null;
  }
  try {
    const url = hasProtocol ? new URL(value) : new URL(`https:${value}`);
    if (!CDN_ORIGIN_HOSTS.has(url.hostname)) {
      return null;
    }
    const pathname = url.pathname.startsWith("/") ? url.pathname : `/${url.pathname}`;
    const suffix = url.search ?? "";
    return `${pathname}${suffix}`;
  } catch (error) {
    return null;
  }
};

const buildCdnUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `https://${CDN_HOST}${normalizedPath}`;
};

const hasCustomStyle = (style?: React.CSSProperties) =>
  Boolean(style && Object.keys(style).length > 0);

const PlainImage = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt = "",
      width,
      height,
      objectFit,
      objectPosition,
      style,
      loading,
      priority,
      className,
      layout,
      quality,
      sizes,
      loader,
      ...rest
    },
    ref
  ) => {
    const rawSrc = typeof src === "string" ? src : (src as any)?.src;
    const cdnPath = normalizeToCdnPath(rawSrc);
    const finalSrc = cdnPath ? buildCdnUrl(cdnPath) : rawSrc ?? "";

    const numericWidth = toNumber(width);
    const numericHeight = toNumber(height);

    const hasInlineStyle = hasCustomStyle(style);
    const mergedStyle = {
      ...style,
      ...(objectFit ? { objectFit } : {}),
      ...(objectPosition ? { objectPosition } : {}),
    } as React.CSSProperties | undefined;

    const canUseNextImage =
      typeof finalSrc === "string" &&
      !hasInlineStyle &&
      (!layout || layout !== "fill" ? numericWidth && numericHeight : true);

    const isCdnUrl =
      typeof finalSrc === "string" && finalSrc.startsWith(`https://${CDN_HOST}`);
    const shouldOptimize = Boolean(loader || isCdnUrl);
    const resolvedQuality =
      quality ?? (shouldOptimize ? DEFAULT_REMOTE_QUALITY : undefined);

    const baseNextImageProps: Omit<NextImageProps, "src" | "width" | "height" | "layout"> & {
      src: NextImageProps["src"];
    } = {
      src: finalSrc as NextImageProps["src"],
      alt,
      priority,
      loading: priority ? "eager" : loading,
      className,
      style: mergedStyle,
      quality: resolvedQuality,
      sizes,
      loader,
      unoptimized: !shouldOptimize,
      ...(priority ? { fetchPriority: "high" as const } : {}),
      ...rest,
    };

    const renderFallbackImage = () => (
      <img
        ref={ref}
        src={finalSrc}
        alt={alt}
        loading={priority ? "eager" : loading ?? "lazy"}
        className={className}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          ...mergedStyle,
        }}
        width={numericWidth}
        height={numericHeight}
        {...rest}
      />
    );

    if (!canUseNextImage) {
      return renderFallbackImage();
    }

    if (layout === "fill") {
      return (
        <span
          style={{
            position: "relative",
            display: "block",
            width: "100%",
            height: "100%",
            ...mergedStyle,
          }}
        >
          <NextImage {...baseNextImageProps} fill />
        </span>
      );
    }

    if ((layout === "responsive" || (!layout && numericWidth && numericHeight)) && numericWidth && numericHeight) {
      const ratioValue = numericHeight / numericWidth;
      const sizesValue = sizes ?? DEFAULT_SIZES;
      return (
        <span style={{ position: "relative", display: "block", width: "100%" }}>
          <span style={{ display: "block", paddingBottom: `${ratioValue * 100}%` }} />
          <NextImage
            {...baseNextImageProps}
            fill
            sizes={sizesValue}
          />
        </span>
      );
    }

    if ((layout === "intrinsic" || layout === "fixed") && numericWidth && numericHeight) {
      return (
        <NextImage
          {...baseNextImageProps}
          width={numericWidth}
          height={numericHeight}
        />
      );
    }

    return renderFallbackImage();
  }
);

PlainImage.displayName = "PlainImage";

export default PlainImage;
