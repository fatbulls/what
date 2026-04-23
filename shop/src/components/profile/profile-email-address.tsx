import PlusIcon from "@components/icons/plus-icon";
import ContactCard from "@components/ui/contact-card";
import { useUI } from "@contexts/ui.context";
import { useTranslation } from "next-i18next";

interface Props {
  userId: string;
  email?: string | null;
}

const ProfileEmailAddress = ({ userId, email }: Props) => {
  const { t } = useTranslation("common");
  const { openModal, setModalView, setModalData } = useUI();

  function onAdd() {
    setModalData({
      customerId: userId,
      email,
    });
    setModalView("ADD_OR_UPDATE_PROFILE_EMAIL");
    openModal();
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-5 lg:mb-8">
        <p className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse text-lg lg:text-xl xl:text-2xl text-heading capitalize font-bold">
          {t("text-email-address")}
        </p>

        <button
          className="flex items-center text-sm font-semibold text-heading transition-colors duration-200 focus:outline-none focus:opacity-70 hover:opacity-70 mt-1"
          onClick={onAdd}
        >
          <PlusIcon className="w-4 h-4 stroke-2 ltr:mr-0.5 rtl:ml-0.5" />
          {Boolean(email) ? t("text-update") : t("text-add")}
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <ContactCard number={email ? email : t("text-no-email")} />
      </div>
    </div>
  );
};

export default ProfileEmailAddress;
