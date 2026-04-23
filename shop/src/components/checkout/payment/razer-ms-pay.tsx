import { useTranslation } from "next-i18next";
import Image from "@components/ui/next-image";

const RazerMSPay = () => {
    const { t } = useTranslation("common");
    return (
        <>
            <span className="text-sm leading-8 text-body block">{t("text-razer-message")}</span>
            <div className="text-sm leading-8">
                <Image
                    src="https://assets.becauseyou.com.my/assets/images/pm-razer.png"
                    alt="Razer"
                    width={828}
                    height={660}
                />
            </div>
        </>
    );
};
export default RazerMSPay;
