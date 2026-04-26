import { Bounce, ToastContainer, type ToastContainerProps } from "react-toastify";

// react-toastify 11 is React-19-native — no defaultProps shim needed
// (that hack was only for the 7.0.4 version bundled with the original
// ChawkBazar port).

const defaultToastOptions: ToastContainerProps = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: true,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  transition: Bounce,
  closeButton: true,
  draggableDirection: "x",
  draggablePercent: 80,
};

const ToastContainerClient = (props: ToastContainerProps) => (
  <ToastContainer {...defaultToastOptions} {...props} />
);

export default ToastContainerClient;
