import Link from "@components/ui/link";
import Image from "@components/ui/next-image";
import type { FC } from "react";
import cn from "classnames";
import { LinkProps } from "next/link";

interface BannerProps {
	data: any;
	variant?: "rounded" | "default";
	effectActive?: boolean;
	className?: string;
	classNameInner?: string;
	href: LinkProps["href"];
	priority?: boolean;
	sizes?: string;
}

const BannerCard: FC<BannerProps> = ({
	data,
	className,
	variant = "rounded",
	effectActive = false,
	classNameInner,
	href,
	priority = false,
	sizes = "(max-width: 768px) 100vw, 1440px",
}) => {
	const { title, image } = data ?? {};
	const toNumber = (value: any, fallback: number) => {
		const parsed = typeof value === "number" ? value : parseFloat(value ?? "");
		return Number.isFinite(parsed) ? parsed : fallback;
	};
	const desktopImage = image?.desktop ?? image;
	const mobileImage = image?.mobile;
	const hasResponsiveSources = Boolean(desktopImage?.url && mobileImage?.url);
	const baseImage = hasResponsiveSources ? mobileImage : (desktopImage?.url ? desktopImage : mobileImage ?? {});
	const fallbackUrl = desktopImage?.url ?? mobileImage?.url ?? image;
	const imageUrl = baseImage?.url ?? fallbackUrl;
	const imageWidth = toNumber(baseImage?.width, toNumber(desktopImage?.width, 1440));
	const imageHeight = toNumber(baseImage?.height, toNumber(desktopImage?.height, 570));
	const bannerSizes = data?.sizes ?? sizes;
	return (
		<div className={cn("mx-auto w-full", className)}>
				<Link
					href={href}
					className={cn(
						"h-full group flex w-full justify-center relative overflow-hidden",
						classNameInner
					)}
				>
					<div className="w-full">
						<Image
							src={imageUrl}
							width={imageWidth}
							height={imageHeight}
							alt={title}
							sizes={bannerSizes}
							priority={priority}
							layout="responsive"
							className={cn("bg-gray-300 object-cover w-full", {
								"rounded-md": variant === "rounded",
							})}
						/>
					</div>
				{effectActive && (
					<div className="absolute top-0 -left-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
				)}
			</Link>
		</div>
	);
};

export default BannerCard;
