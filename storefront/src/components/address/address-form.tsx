"use client";

import Button from "@components/ui/button";
import Input from "@components/ui/input";
import Label from "@components/ui/label";
import { RadioBox as Radio } from "@components/ui/radiobox";
import TextArea from "@components/ui/text-area";
import { useTranslation } from "next-i18next";
import { toast } from "react-toastify";
import * as yup from "yup";
import { AddressType } from "@framework/utils/constants";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useUI } from "@contexts/ui.context";
import { useUpdateCustomerMutation } from "@framework/customer/customer.query";
import SelectInput from "@components/ui/select-input";

const stateList = [
  { label: "W.P. Kuala Lumpur", value: "W.P. Kuala Lumpur" },
  { label: "Selangor", value: "Selangor" },
  { label: "Johor", value: "Johor" },
  { label: "Kedah", value: "Kedah" },
  { label: "Kelantan", value: "Kelantan" },
  { label: "Melaka", value: "Melaka" },
  { label: "Negeri Sembilan", value: "Negeri Sembilan" },
  { label: "Pahang", value: "Pahang" },
  { label: "Perak", value: "Perak" },
  { label: "Perlis", value: "Perlis" },
  { label: "Pulau Pinang", value: "Pulau Pinang" },
  { label: "Sabah", value: "Sabah" },
  { label: "Sarawak", value: "Sarawak" },
  { label: "Terengganu", value: "Terengganu" },
  { label: "W.P. Labuan", value: "W.P. Labuan" },
  { label: "W.P. Putrajaya", value: "W.P. Putrajaya" },
];

type FormValues = {
  __typename?: string;
  title: string;
  //phone_number: string;
  type: AddressType;
  address: {
    phone_number: string;
    country: string;
    city: string;
    state: string;
    zip: string;
    street_address: string;
  };
};

const addressSchema = yup.object().shape({
  type: yup
    .string()
    .oneOf([AddressType.Billing, AddressType.Shipping])
    .required("error-type-required"),
  title: yup.string().required("error-title-required"),
  //phone_number: yup.string().required("error-phone-number-required"),
  address: yup.object().shape({
    phone_number: yup.string().required("error-phone-number-required"),
    country: yup.string().required("error-country-required"),
    city: yup.string().required("error-city-required"),
    // Accepts either a react-select object or a plain string (pre-populated form)
    state: yup
      .mixed()
      .test("state-required", "error-state-required", (v: any) => {
        if (!v) return false;
        if (typeof v === "string") return v.trim().length > 0;
        return Boolean(v.value || v.label);
      }),
    zip: yup.string().required("error-zip-required"),
    street_address: yup.string().required("error-street-required"),
  }),
});

const AddressForm: React.FC<any> = ({ data }) => {
  const { t } = useTranslation("common");
  const { address, type, customerId } = data;
  const { mutate: updateProfile } = useUpdateCustomerMutation();
  const { closeModal } = useUI();
  // if (address?.address) {
  //   address.address.country = "Malaysia";
  //   address.country = "Malaysia";
  // }

  function onSubmit(values: any) {
    if (!customerId) {
      // Session expired or guest checkout — update-customer is customer-scoped,
      // so we can't save this address until the user signs in again.
      toast.error(t("error-please-sign-in") || "Please sign in to save your address.", {
        theme: "dark",
      });
      return;
    }
    // `address.state` comes from the react-select Controller as `{label, value}`
    // on fresh input, or as a plain string when the form is pre-populated.
    const rawState = values?.address?.state;
    const state =
      rawState && typeof rawState === "object"
        ? rawState.value ?? rawState.label ?? ""
        : rawState ?? "";
    const formattedInput = {
      id: address?.id,
      customer_id: customerId,
      title: values.title,
      type: values.type,
      address: {
        ...(address?.id && { id: address.id }),
        ...values.address,
        state,
      },
    };

    updateProfile({
      id: customerId,
      address: [formattedInput],
    });

    closeModal();
  }

  const initialState = address?.address?.state ?? "";
  const defaultValues: any = {
    title: address?.title ?? "",
    type: address?.type ?? type,
    address: {
      phone_number: address?.address?.phone_number ?? "",
      country: "Malaysia",
      city: address?.address?.city ?? "",
      zip: address?.address?.zip ?? "",
      street_address: address?.address?.street_address ?? "",
      state: initialState
        ? { label: initialState, value: initialState }
        : undefined,
    },
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // `shouldUnregister: true` was dropping the react-select Controller's value
    // under react-hook-form v7.x latest, so submits saw `address.state=undefined`
    // and yup silently rejected. Keep registered fields alive.
    resolver: yupResolver(addressSchema as any),
    defaultValues,
  });

  const chosenType = watch("type");

  return (
    <div className="p-5 sm:p-8 md:rounded-xl min-h-screen md:min-h-0 bg-white">
      <h1 className="text-heading font-semibold text-lg text-center mb-4 sm:mb-6">
        {address ? t("text-update-address") : t("text-add-new-address")}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-5 h-full"
      >
        <div>
          <Label>{t("text-type")}</Label>
          <div className="space-x-4 rtl:space-x-reverse flex items-center">
            <Radio
              id="billing"
              {...register("type")}
              type="radio"
              value={AddressType.Billing}
              labelKey={t("text-billing")}
            />
            <Radio
              id="shipping"
              {...register("type")}
              type="radio"
              value={AddressType.Shipping}
              labelKey={t("text-shipping")}
            />
          </div>
        </div>

        <Input
          //labelKey={t("text-title")}
          labelKey={chosenType ===  AddressType.Shipping ? 'Receiver Name': 'Billing Name'}
          {...register("title")}
          errorKey={t(errors.title?.message!)}
          variant="outline"
          className="col-span-2"
          readOnly={address?.id === -1}
        />

        <Input
          //labelKey={t("text-phone-number")}
          labelKey={chosenType ===  AddressType.Shipping ? 'Receiver Number': t("text-phone-number")}
          {...register("address.phone_number")}
          errorKey={t(errors.address?.phone_number?.message!)}
          variant="outline"
          className="col-span-2"
          readOnly={address?.id === -1}
        />

        <Input
          labelKey={t("text-country")}
          {...register("address.country")}
          errorKey={t(errors.address?.country?.message!)}
          variant="outline"
          readOnly={true}
        />

        <Input
          labelKey={t("text-city")}
          {...register("address.city")}
          errorKey={t(errors.address?.city?.message!)}
          variant="outline"
          readOnly={address?.id === -1}
        />

        {address?.id === -1 ? (
          <Input
            labelKey={t("text-state")}
            {...register("address.state")}
            errorKey={t(errors.address?.state?.message!)}
            variant="outline"
            readOnly={true}
          />
        ) : (
          <div className="state-list">
            <label className="block text-gray-600 font-semibold text-sm leading-none mb-3 cursor-pointer">
              {t("text-state")}
            </label>
            <SelectInput
              className="state-select"
              name="address.state"
              control={control}
              options={stateList}
              isMulti={false}
            />
            {errors.address?.state && (
              <span className="text-red-500 text-xs mt-1 block">
                {t(errors.address?.state?.message as any)}
              </span>
            )}
          </div>
        )}

        <Input
          labelKey={t("text-zip")}
          {...register("address.zip")}
          errorKey={t(errors.address?.zip?.message!)}
          variant="outline"
          readOnly={address?.id === -1}
        />

        <TextArea
          //labelKey={t("text-street-address")}
          labelKey={chosenType ===  AddressType.Shipping ? 'Receiver Address': 'Billing Address'}
          {...register("address.street_address")}
          errorKey={t(errors.address?.street_address?.message!)}
          variant="outline"
          className="col-span-2"
          readOnly={address?.id === -1}
        />

        <Button className="w-full col-span-2">
          {address ? t("text-update") : t("text-save")} {t("text-address")}
        </Button>
      </form>
    </div>
  );
};

export default AddressForm;
