import Image from "@components/ui/next-image";
import { useTranslation } from "next-i18next";

interface BlogBannerProps {
  title?: string;
  image?: string;
}

const BlogBanner: React.FC<BlogBannerProps> = ({ title, image }) => {
  const { t } = useTranslation("common");
  const heading = title ?? t("text-new-blog");

  return (
    <div></div>
  );
};

export default BlogBanner;
