import React, { createContext, useState } from "react";
import { Success, Warning, Info, Error } from "../constants";

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
      setErrorMessage({ variant: Error, messages: message, show: true });
    } else {
      setErrorMessage({ variant: Error, messages: error, show: true });
    }
    setTimeout(() => {
      setErrorMessage({ show: false });
    }, 7500);
  };

  const showSuccessMessage = (message) => {
    setErrorMessage({ variant: Success, messages: message, show: true });
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
