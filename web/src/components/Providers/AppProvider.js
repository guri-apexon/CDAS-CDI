import React, { createContext, useState, useEffect } from "react";
import { getRolesPermissions } from "../../services/ApiServices";

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
    studyPermissions: {},
    studyPermissionsStatus: {},
  });
  const [loading, setLoading] = useState({});

  const updateUser = (userData) => {
    const data = { ...user, ...userData };
    setUser(data);
  };

  const changeStudyLoading = (status, studyId) => {
    const studyLoading = { ...loading };
    studyLoading[studyId] = status;
    setLoading(studyLoading);
  };

  const getStudyPermissions = async (studyId) => {
    const studyPermissions = user.studyPermissions[studyId] || [];
    if (studyPermissions.length === 0) {
      changeStudyLoading(true, studyId);

      let uniquePermissions = [];
      const data = await getRolesPermissions(studyId);
      console.log(`>>> study (${studyId}) permissions`, data);
      if (data.message === "Something went wrong") {
        console.log(
          `There was an issue authorizing your login information. Please contact your Administrator.`
        );
      } else {
        uniquePermissions = Array.from(
          data
            .reduce((acc, { categoryName, featureName, allowedPermission }) => {
              const current = acc.get(featureName) || {
                allowedPermission: [],
              };
              return acc.set(featureName, {
                ...current,
                categoryName,
                featureName,
                allowedPermission: [
                  ...current.allowedPermission,
                  allowedPermission,
                ],
              });
            }, new Map())
            .values()
        );
        updateUser({
          studyPermissions: {
            ...user.studyPermissions,
            [studyId]: uniquePermissions,
          },
        });
      }
      changeStudyLoading(true, studyId);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        getStudyPermissions,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
