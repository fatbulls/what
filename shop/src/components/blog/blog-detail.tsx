import Image from "@components/ui/next-image";
import { FaFacebookF } from "@react-icons/all-files/fa/FaFacebookF";
import { FaTwitter } from "@react-icons/all-files/fa/FaTwitter";
import { FaWhatsapp } from "@react-icons/all-files/fa/FaWhatsapp";
import Accordion from "@components/common/accordion";

interface BlogDetailProps {
  blogs?: any;
  image?: string;
}

const parseJson = (value?: string) => {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const parseCategories = (value?: any) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const parsed = parseJson(value);
  return Array.isArray(parsed) ? parsed : [];
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getFeaturedImage = (blogs?: any, fallback?: string) => {
  if (fallback) return fallback;
  const parsed = parseJson(blogs?.thumbnail);
  if (parsed?.original) return parsed.original;
  if (typeof blogs?.thumbnail === "string") return blogs.thumbnail;
  return undefined;
};

const buildShareLinks = (url: string, title?: string) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title ?? "");
  return [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FaFacebookF,
    },
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: FaTwitter,
    },
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: FaWhatsapp,
    },
  ];
};

const sanitizeContent = (value?: string) => {
  if (typeof value !== "string") return "";

  return value.replace(/href=("|')javascript:[^"']*("|')/gi, "href=\"#\"");
};

const BlogDetail: React.FC<BlogDetailProps> = ({ blogs, image }) => {
  if (!blogs) return null;

  const featuredImage = getFeaturedImage(blogs, image);
  const categories = parseCategories(blogs?.category_id);
  const publishedAt = formatDate(blogs?.updated_at ?? blogs?.created_at);
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://becauseyou.com.my/${blogs?.slug ?? ""}`;
  const shareLinks = buildShareLinks(shareUrl, blogs?.title);
  const faqItems = (() => {
    const rawFaq = blogs?.faq;

    let parsed: any[] = [];

    if (Array.isArray(rawFaq)) {
      parsed = rawFaq;
    } else if (typeof rawFaq === "string") {
      try {
        const json = JSON.parse(rawFaq);
        parsed = Array.isArray(json) ? json : [];
      } catch (error) {
        parsed = [];
      }
    }

    return parsed
      .filter((item) => (item?.question || "").trim())
      .map((item, index) => ({
        title: item?.question ?? `FAQ ${index + 1}`,
        content: (item?.answer ?? "").replace(/\n/g, "<br />"),
      }));
  })();
  const content = sanitizeContent(blogs?.content);

  return (
    <div className="mx-auto w-full max-w-6xl py-10 md:py-14 lg:py-16">
      <article className="mx-auto flex w-full flex-col gap-8 lg:w-[80%]">
        {featuredImage && (
          <div className="relative overflow-hidden rounded-lg shadow-vendorCard">
            <Image
              src={featuredImage}
              alt={blogs?.title ?? "Blog featured image"}
              width={1280}
              height={720}
              layout="responsive"
              objectFit="cover"
              className="select-none"
            />
          </div>
        )}

        <h1 className="text-3xl font-semibold leading-tight text-heading md:text-[36px] md:leading-[3rem]">
          {blogs?.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          {publishedAt ? <span>{publishedAt}</span> : null}
          {categories?.map((category: any) => (
            <span
              key={category?.id ?? category?.slug ?? category?.name}
              className="rounded-full bg-gray-200 px-2 py-1 text-[11px] font-semibold text-heading"
            >
              {category?.name}
            </span>
          ))}
        </div>

        <div
          className="blog-content prose max-w-none text-base leading-7 text-body prose-headings:text-heading prose-a:text-brown hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {faqItems.length > 0 ? (
          <div className="border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-xl font-semibold text-heading md:text-2xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <Accordion items={faqItems} translatorNS="common" />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6">
          <span className="text-sm font-semibold uppercase tracking-wide text-heading">
            Share
          </span>
          {shareLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-heading transition-colors duration-200 hover:border-[#a9957f] hover:bg-[#a9957f] hover:text-white"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
