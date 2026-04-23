import Button from "@components/ui/button";
import Input from "@components/ui/input";
import { useUpdateCustomerMutation } from "@framework/customer/customer.query";
import { useUI } from "@contexts/ui.context";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

type FormValues = {
  email: string;
};

type Props = {
  data: {
    customerId: string;
    email?: string | null;
  };
};

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .email("forms:error-email-format")
    .required("forms:error-email-required"),
});

const ProfileAddOrUpdateEmail: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation("common");
  const { closeModal } = useUI();
  const { mutateAsync: updateCustomer, isLoading } = useUpdateCustomerMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: data?.email ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    const trimmedEmail = values.email.trim();
    if (!data?.customerId) {
      closeModal();
      return;
    }

    if (trimmedEmail === (data?.email ?? "")) {
      closeModal();
      return;
    }

    try {
      await updateCustomer({
        id: data.customerId,
        email: trimmedEmail,
      });
      toast.success(t("profile-update-successful"));
      closeModal();
    } catch (error: any) {
      const message =
        error?.response?.data?.email?.[0] ??
        error?.response?.data?.message ??
        t("error-something-wrong");
      toast.error(message);
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-white rounded-lg md:rounded-xl flex flex-col justify-center md:min-h-0">
      <h3 className="text-heading text-sm md:text-base font-semibold mb-5 text-center">
        {data?.email ? t("text-update") : t("text-add-new")} {t("text-email-address")}
      </h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
        noValidate
      >
        <Input
          type="email"
          labelKey="forms:label-email-required"
          placeholderKey="forms:placeholder-email"
          variant="solid"
          {...register("email")}
          errorKey={errors.email ? t(errors.email.message!) : ""}
        />
        <Button
          type="submit"
          loading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
          className="h-12 lg:h-13"
        >
          {data?.email ? t("text-update") : t("text-save")}
        </Button>
      </form>
    </div>
  );
};

export default ProfileAddOrUpdateEmail;
