import React from "react";
import { Redirect } from "react-router";
import Typography from "apollo-react/components/Typography";

function UserManagement() {
  return (
    <div
      style={{
        textAlign: "center",
        height: "calc(100vh - 184px)",
        minHeight: 800,
      }}
    >
      <Typography>UserManagement</Typography>
      <Redirect to="/launchpad" />
    </div>
  );
}

export default UserManagement;
