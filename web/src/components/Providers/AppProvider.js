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
    permissions: [],
  });

  const updateUser = (userData) => {
    setUser({
      id: userData.id,
      name: userData.name,
      username: userData.username,
      lastlogin: userData.lastlogin,
      token: userData.token,
      actions: userData.actions,
      permissions: userData.permissions,
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
