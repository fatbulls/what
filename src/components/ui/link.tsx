import type { AnchorHTMLAttributes, FC, ReactNode } from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

type LinkComponentProps = NextLinkProps &
  Omit<AnchorProps, "href"> & {
    children: ReactNode;
  };

const Link: FC<LinkComponentProps> = ({
  href,
  as,
  replace,
  scroll,
  shallow,
  prefetch,
  locale,
  children,
  ...anchorProps
}) => {
  return (
    <NextLink
      href={href}
      as={as}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      prefetch={prefetch}
      locale={locale}
      legacyBehavior
      passHref
    >
      <a {...anchorProps}>{children}</a>
    </NextLink>
  );
};

export default Link;
