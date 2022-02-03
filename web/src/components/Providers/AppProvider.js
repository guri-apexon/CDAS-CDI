import React, { createContext, useState } from "react";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: "",
    name: "",
    username: "",
    lastlogin: "",
    token: null,
    actions: "",
  });

  const updateUser = (userData) => {
    setUser({
      id: userData.id,
      name: userData.name,
      username: userData.username,
      lastlogin: userData.lastlogin,
      token: userData.token,
      actions: userData.actions,
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
