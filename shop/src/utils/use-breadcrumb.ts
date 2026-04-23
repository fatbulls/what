import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export function convertBreadcrumbTitle(string: string) {
	return string
		.replace(/-/g, " ")
		.replace(/oe/g, "ö")
		.replace(/ae/g, "ä")
		.replace(/ue/g, "ü")
		.toLowerCase();
}

export default function useBreadcrumb() {
	const router = useRouter();
	const [breadcrumbs, setBreadcrumbs] = useState<any>(null);

	const { asPath } = router;

	useEffect(() => {
		if (!asPath) {
			return;
		}

		const asPathWithoutQuery = asPath.split("?")[0]?.split("#")[0] ?? asPath;
		const pathSegments = asPathWithoutQuery
			.split("/")
			.filter((segment) => segment.length > 0);

		const pathArray = pathSegments.map((segment, index) => {
			const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
			return {
				breadcrumb: decodeURIComponent(segment),
				href,
			};
		});

		setBreadcrumbs(pathArray);
	}, [asPath]);

	return breadcrumbs;
}
