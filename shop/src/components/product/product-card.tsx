import cn from "classnames";
import Image from "@components/ui/next-image";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { useUI } from "@contexts/ui.context";
import usePrice from "@lib/use-price";
import { Product } from "@framework/types";
import { siteSettings } from "@settings/site.settings";
import {useRouter} from "next/router";
import {ROUTES} from "@lib/routes";
import { trackSelectItem } from "@lib/analytics";

interface ProductProps {
  product: Product;
  className?: string;
  contactClassName?: string;
  imageContentClassName?: string;
  variant?: "grid" | "gridSlim" | "list" | "listSmall";
  imgWidth?: number | string;
  imgHeight?: number | string;
  imgLoading?: "eager" | "lazy";
  imgFetchPriority?: "high" | "low" | "auto";
  listName?: string;
  listId?: string;
  listIndex?: number;
}

const ProductCard: FC<ProductProps> = ({
  product,
  className = "",
  contactClassName = "",
  imageContentClassName = "",
  variant = "list",
  imgWidth = 340,
  imgHeight = 440,
  imgLoading,
  imgFetchPriority,
  listName,
  listId,
  listIndex,
}) => {
  const { openModal, setModalView, setModalData } = useUI();
  const { name, image, min_price, max_price, product_type, description } =
    product ?? {};
  let richDescText = description?.toString()?.replace(/<\/?[^>]*>/g, ''); // 去掉标签

  const router = useRouter();
  const { price, basePrice } = usePrice({
    amount: product?.sale_price ? product?.sale_price : product?.price!,
    baseAmount: product?.price,
  });

  const { price: minPrice } = usePrice({
    amount: min_price!,
  });

  const { price: maxPrice } = usePrice({
    amount: max_price!,
  });

  function handlePopupView() {
      //关闭弹出lightbox，直接打开商品详情
      //window.open(`${ROUTES.PRODUCT}/${product.slug}`,'_blank'); //新窗口打开
      if (product) {
        trackSelectItem({
          product,
          listName,
          listId,
          position: typeof listIndex === "number" ? listIndex : undefined,
        });
      }
      router.push(`${ROUTES.PRODUCT}/${product.slug}`, undefined, {
          locale: router.locale,
      });

    //关闭弹出lightbox
    /*setModalData(product.slug);
    setModalView("PRODUCT_VIEW");
    return openModal();*/
  }

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  useEffect(() => {
    setIsImageLoaded(false);
  }, [product?.id, product?.slug, image?.original]);

  const aspectRatio = useMemo(() => {
    if (typeof imgWidth === "number" && typeof imgHeight === "number" && Number(imgWidth) > 0) {
      return `${Number(imgWidth)} / ${Number(imgHeight)}`;
    }
    return undefined;
  }, [imgWidth, imgHeight]);
  const shouldUseFillImage = variant === "grid" || variant === "gridSlim";

  const renderProductImage = () => {
    const containerClass = cn(
      "relative w-full overflow-hidden rounded-md",
      {
        "bg-gray-200 animate-pulse": !isImageLoaded,
      }
    );

    if (shouldUseFillImage && aspectRatio) {
      return (
        <div className={containerClass} style={{ aspectRatio }}>
          <Image
            src={image?.original ?? siteSettings?.product?.placeholderImage()}
            layout="fill"
            objectFit="cover"
            loading={imgLoading}
            fetchPriority={imgFetchPriority}
            quality={80}
            sizes={typeof imgWidth === "number"
              ? `(max-width: 768px) 50vw, (max-width: 1280px) 33vw, ${Math.round(Number(imgWidth))}px`
              : undefined}
            alt={name || "Product Image"}
            className={cn("w-full transition duration-200 ease-in bg-gray-200", {
              "rounded-md group-hover:rounded-b-none": variant === "grid",
              "rounded-md transform group-hover:scale-105": variant === "gridSlim",
            })}
            onLoadingComplete={() => setIsImageLoaded(true)}
          />
        </div>
      );
    }

    return (
      <div className={containerClass}>
        <Image
          src={image?.original ?? siteSettings?.product?.placeholderImage()}
          width={imgWidth}
          height={imgHeight}
          loading={imgLoading}
          fetchPriority={imgFetchPriority}
          quality={80}
          sizes={typeof imgWidth === "number"
            ? `(max-width: 768px) 50vw, (max-width: 1280px) 33vw, ${Math.round(Number(imgWidth))}px`
            : undefined}
          alt={name || "Product Image"}
          className={cn("bg-gray-200 object-cover ltr:rounded-l-md rtl:rounded-r-md", {
            "w-full rounded-md transition duration-200 ease-in group-hover:rounded-b-none":
              variant === "grid",
            "rounded-md transition duration-150 ease-linear transform group-hover:scale-105":
              variant === "gridSlim",
            "ltr:rounded-l-md rtl:rounded-r-md transition duration-200 ease-linear transform group-hover:scale-105":
              variant === "list",
          })}
          onLoadingComplete={() => setIsImageLoaded(true)}
        />
      </div>
    );
  };

  return (
    <div
      className={cn(
        "group box-border overflow-hidden flex rounded-md cursor-pointer",
        {
          "ltr:pr-0 rtl:pl-0 pb-2 lg:pb-3 flex-col items-start bg-white transition duration-200 ease-in-out transform hover:-translate-y-1 hover:md:-translate-y-1.5 hover:shadow-product":
            variant === "grid",
          "ltr:pr-0 rtl:pl-0 md:pb-1 flex-col items-start bg-white": variant === "gridSlim",
          "items-center bg-transparent border border-gray-100 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-listProduct":
            variant === "listSmall",
          "flex-row items-center transition-transform ease-linear bg-gray-200 ltr:pr-2 ltr:lg:pr-3 ltr:2xl:pr-4 rtl:pl-2 rtl:lg:pl-3 rtl:2xl:pl-4":
            variant === "list",
        },
        className
      )}
      onClick={handlePopupView}
      role="button"
      title={name}
    >
      <div
        className={cn(
          "flex",
          {
            "mb-3 md:mb-3.5 w-full": variant === "grid",
            "mb-3 md:mb-3.5 pb-0 w-full": variant === "gridSlim",
            "flex-shrink-0 w-32 sm:w-44 md:w-36 lg:w-44":
              variant === "listSmall",
          },
          imageContentClassName
        )}
      >
        {renderProductImage()}
      </div>
      <div
        className={cn(
          "w-full overflow-hidden",
          {
            "ltr:pl-0 rtl:pr-0 ltr:lg:pl-2.5 ltr:xl:pl-4 rtl:lg:pr-2.5 rtl:xl:pr-4 ltr:pr-2.5 ltr:xl:pr-4 rtl:pl-2.5 rtl:xl:pl-4": variant === "grid",
            "ltr:pl-0 rtl:pr-0": variant === "gridSlim",
            "px-4 lg:px-5 2xl:px-4": variant === "listSmall",
          },
          contactClassName
        )}
      >
        <h2
          className={cn("text-heading font-semibold truncate mb-1", {
            "text-sm md:text-base": variant === "grid",
            "md:mb-1.5 text-sm sm:text-base md:text-sm lg:text-base xl:text-lg":
              variant === "gridSlim",
            "text-sm sm:text-base md:mb-1.5 pb-0": variant === "listSmall",
            "text-sm sm:text-base md:text-sm lg:text-base xl:text-lg md:mb-1.5":
              variant === "list",
          })}
        >
          {name}
        </h2>
        {richDescText && (
          <p className="text-body text-xs md:text-[13px] lg:text-sm leading-normal xl:leading-relaxed max-w-[250px] truncate">
            {richDescText}
          </p>
        )}
        <div
          className={`text-heading font-semibold text-sm sm:text-base mt-1.5 space-x-1 rtl:space-x-reverse ${
            variant === "grid"
              ? "3xl:text-lg lg:mt-2.5"
              : "sm:text-lg md:text-base 3xl:text-xl md:mt-2.5 2xl:mt-3"
          }`}
        >
          {product_type.toLocaleLowerCase() === "variable" ? (
            <>
              <span className="inline-block">{minPrice}</span>
              <span> - </span>
              <span className="inline-block">{maxPrice}</span>
            </>
          ) : (
            <>
              <span className="inline-block">{price}</span>

              {basePrice && (
                <del className="sm:text-base font-normal text-gray-800 ltr:pl-1 rtl:pr-1">
                  {basePrice}
                </del>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
