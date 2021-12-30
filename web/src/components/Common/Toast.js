import Banner from "apollo-react/components/Banner";
import { useEffect, useState } from "react";

const Toast = () => {
  const [bannerText, setBannerText] = useState("");
  const [bannerType, setBannerType] = useState("success");
  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    document.addEventListener("toast", (event) => {
      const { text, type } = event.detail;
      setBannerType(type);
      setBannerText(text);
      setOpen(true);
      console.log("event", text, type);
      setTimeout(() => {
        setOpen(false);
      }, 3500);
    });
    return () => {
      document.removeEventListener("toast");
    };
  }, []);
  return (
    <>
      <Banner
        variant={bannerType}
        open={open}
        message={bannerText}
        onClose={onClose}
      />
    </>
  );
};
export default Toast;
