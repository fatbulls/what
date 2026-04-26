"use client";

import { useTranslation } from "next-i18next";
import Image from "@components/ui/next-image";

const DirectBankTransfer = () => {
    const { t } = useTranslation("common");
    return (
        <>
            <span className="text-sm leading-8 text-body block">{t("text-dbt-message")}</span>
            <div className="text-sm leading-8">
                <label>BANK: </label>
                <span className="font-semibold text-heading float-right">AMBANK</span>
            </div>
            <div className="text-sm leading-8">
                <label>ACCOUNT NAME: </label>
                <span className="font-semibold text-heading float-right">BECAUSE SDN BHD</span>
            </div>
            <div className="text-sm leading-8">
                <label>ACCOUNT NUMBER: </label>
                <span className="font-semibold text-heading float-right">8881051850538</span>
            </div>
            <div className="mt-4">
                <Image
                    src="https://assets.becauseyou.com.my/assets/images/qr-duitnow.png"
                    alt="Duitnow QR Code"
                    width={397}
                    height={560}
                />
            </div>
        </>
    );
};
export default DirectBankTransfer;
