import Image from "@components/ui/next-image";
import { useTranslation } from "next-i18next";

type Props = {
  lat: number;
  lng: number;
};

const GoogleStaticMap: React.FC<Props> = ({ lat, lng }) => {
  const { t } = useTranslation();

  const GOOGLE_MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!;

  const mapSrc = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&markers=color:red|${lat},${lng}&zoom=12&size=400x200&key=${GOOGLE_MAP_API_KEY}`;

  return GOOGLE_MAP_API_KEY ? (
    <iframe
    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15936.378254362884!2d101.6943934!3d3.0694007!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc4b16e817b231%3A0x6fc1d7d0708ee21b!2sBecause%20You%20Florist%20%26%20Workshop!5e0!3m2!1sen!2sin!4v1706588899650!5m2!1sen!2sin"
    width="100%"
    height="auto"
    />
  ) : (
    <p className="text-red-500">{t("text-no-google-map-key")}</p>
  );
};

export default GoogleStaticMap;
