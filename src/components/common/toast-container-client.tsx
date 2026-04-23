import { Bounce, ToastContainer, type ToastContainerProps } from "react-toastify";

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

if ((ToastContainer as any).defaultProps) {
  delete (ToastContainer as any).defaultProps;
}

if (typeof window !== "undefined") {
  import("react-toastify/dist/react-toastify.esm")
    .then((mod) => {
      const progressBar: any = (mod as any).ProgressBar;
      if (progressBar?.defaultProps) {
        delete progressBar.defaultProps;
      }
    })
    .catch(() => undefined);
}

const ToastContainerClient = (props: ToastContainerProps) => (
  <ToastContainer {...defaultToastOptions} {...props} />
);

export default ToastContainerClient;
