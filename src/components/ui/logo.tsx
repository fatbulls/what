import Link from "@components/ui/link";
import Image from "@components/ui/next-image";
import { useSettings } from "@contexts/settings.context";
import { useTranslation } from "next-i18next";

interface LogoProps {
  className?: string;
  href?: string;
  priority?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, href = "/", priority = false }) => {
  const { logo } = useSettings();
  const { t } = useTranslation("common");
  const ariaLabel = t("text-go-home", "Go to home page");
  const altText = t("text-site-logo", "Because You logo");

  const width = logo?.width ?? 144;
  const height = logo?.height ?? 40;

  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    position: "relative" as const,
  };

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      <span className="inline-flex focus:outline-none" style={containerStyle}>
        <Image
          src={logo?.original ?? "/assets/placeholder/logo.svg"}
          alt={altText}
          width={width}
          height={height}
          layout="fill"
          objectFit="contain"
          priority={priority}
        />
      </span>
    </Link>
  );
};

export default Logo;
