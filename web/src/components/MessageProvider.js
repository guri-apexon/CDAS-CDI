import React, { createContext, useState } from "react";

export const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState({
    variant: "",
    messages: "",
    show: false,
  });

  const bannerCloseHandle = () => {
    setErrorMessage({ show: false });
  };

  const showErrorMessage = (error) => {
    if (error && error.data) {
      const { message } = error.data;
      setErrorMessage({ variant: "error", messages: message, show: true });
    } else {
      setErrorMessage({ variant: "error", messages: error, show: true });
    }
    setTimeout(() => {
      setErrorMessage({ show: false });
    }, 5000);
  };

  const showSuccessMessage = (message) => {
    setErrorMessage({ variant: "success", messages: message, show: true });
    setTimeout(() => {
      setErrorMessage({ show: false });
    }, 5000);
  };

  return (
    <MessageContext.Provider
      value={{
        errorMessage,
        showErrorMessage,
        bannerCloseHandle,
        showSuccessMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export default MessageProvider;
