"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { useTranslation } from "next-i18next";
import { messageCardAtom } from "@store/checkout";
import TextArea from "@components/ui/text-area";

// Collapsed "Add a gift note" control. Message is optional and stored as
// `messageCardAtom` which the order builder already threads through.
const GiftNoteToggle: React.FC = () => {
  const { t } = useTranslation("common");
  const [message, setMessage] = useAtom(messageCardAtom);
  const [open, setOpen] = useState<boolean>(() => Boolean(message));

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-accent underline hover:no-underline mt-4"
      >
        {t("text-add-gift-note", { defaultValue: "+ Add a gift note" })}
      </button>
    );
  }
  return (
    <div className="mt-4">
      <TextArea
        name="gift-note"
        labelKey={t("text-gift-note") || "Gift note"}
        placeholder={t("text-gift-note-placeholder") || "Write a short message for the recipient…"}
        value={message ?? ""}
        onChange={(e: any) => setMessage(e.target.value)}
        maxLength={350}
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-body">{(message ?? "").length} / 350</span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setMessage(null);
          }}
          className="text-xs text-body underline hover:no-underline"
        >
          {t("text-remove-note") || "Remove note"}
        </button>
      </div>
    </div>
  );
};

export default GiftNoteToggle;
