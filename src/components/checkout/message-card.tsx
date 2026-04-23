import { useTranslation } from "next-i18next";
import TextArea from "@components/ui/text-area";
import { useAtom } from "jotai";
import { messageCardAtom } from "@store/checkout";
import { InputHTMLAttributes, TextareaHTMLAttributes, useEffect } from "react";
import { useForm } from "react-hook-form";

interface MessageCardProps {
  label: string;
  className?: string;
  count?: number;
  messageCardContent?: string;
}
interface ReviewFormValues {
  messageCard: string;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  label,
  className,
  count,
}) => {
  const { t } = useTranslation("common");
  const [messageCard, setMessageCard] = useAtom(messageCardAtom);

  useEffect(() => {
    setMessageCard("");
  }, []);

  const handleChangeMessageCard = (e) => {
    const value = e?.target?.value ?? "";
    setMessageCard(value);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-5 lg:mb-6 xl:mb-7 -mt-1 xl:-mt-2">
        <div className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse text-lg lg:text-xl xl:text-2xl text-heading capitalize font-bold">
          {count && (
            <span className="flex items-center justify-center ltr:mr-2 rtl:ml-2">
              {count}.
            </span>
          )}
          {label}
        </div>
      </div>

      {
        <div className="grid gap-4 grid-cols-1">
          <TextArea
            maxLength={350}
            placeholderKey={t("test-message-card-placeholder")}
            onChange={handleChangeMessageCard}
          />
        </div>
      }
    </div>
  );
};
export default MessageCard;
