"use client";

import { useUI } from "@contexts/ui.context";
import Modal from "./modal";
import dynamic from "next/dynamic";
import Newsletter from "../newsletter";

const LoginForm = dynamic(() => import("@components/auth/login-form"));
const OtpLogin = dynamic(() => import("@components/auth/otp/otp-login"));
const SignUpForm = dynamic(() => import("@components/auth/sign-up-form"));
const ForgetPasswordForm = dynamic(
  () => import("@components/auth/forget-password/forget-password")
);
const ProductPopup = dynamic(() => import("@components/product/product-popup"));
const AddressForm = dynamic(() => import("@components/address/address-form"));
const AddressDeleteView = dynamic(
  () => import("@components/address/address-delete-view")
);
const ProfileAddOrUpdateContact = dynamic(
  () => import("@components/profile/profile-add-or-update-contact")
);
const ProfileAddOrUpdateEmail = dynamic(
  () => import("@components/profile/profile-add-or-update-email")
);

const ManagedModal: React.FC = () => {
  const { displayModal, closeModal, modalView, modalData } = useUI();
  const modalVariant =
    modalView === "ADD_OR_UPDATE_CHECKOUT_CONTACT" ||
    modalView === "ADD_OR_UPDATE_PROFILE_CONTACT" ||
    modalView === "ADD_OR_UPDATE_PROFILE_EMAIL" ||
    modalView === "OTP_LOGIN_VIEW"
      ? "default"
      : "center";
  // Hide the floating X on the login modal — user can dismiss by
  // clicking the backdrop. Removes the "easy bail" affordance so people
  // are nudged into either signing in or explicitly clicking elsewhere.
  const hideCloseButton = modalView === "LOGIN_VIEW";

  return (
    <Modal
      open={displayModal}
      onClose={closeModal}
      variant={modalVariant}
      hideCloseButton={hideCloseButton}
    >
      {modalView === "LOGIN_VIEW" && <LoginForm />}
      {modalView === "OTP_LOGIN_VIEW" && <OtpLogin />}
      {modalView === "SIGN_UP_VIEW" && <SignUpForm />}
      {modalView === "FORGET_PASSWORD" && <ForgetPasswordForm />}
      {modalView === "PRODUCT_VIEW" && <ProductPopup productSlug={modalData} />}
      {modalView === "NEWSLETTER_VIEW" && <Newsletter />}
      {modalView === "ADDRESS_FORM_VIEW" && <AddressForm data={modalData} />}
      {modalView === "ADDRESS_DELETE_VIEW" && (
        <AddressDeleteView data={modalData} />
      )}
      {modalView === "ADD_OR_UPDATE_PROFILE_CONTACT" && (
        <ProfileAddOrUpdateContact data={modalData} />
      )}
      {modalView === "ADD_OR_UPDATE_PROFILE_EMAIL" && (
        <ProfileAddOrUpdateEmail data={modalData} />
      )}
    </Modal>
  );
};

export default ManagedModal;
