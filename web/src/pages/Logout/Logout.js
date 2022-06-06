import React from "react";
import Modal from "apollo-react/components/Modal";

import "./Logout.scss";

const Logout = () => {
  return (
    <div className="wrapper">
      <Modal
        open={true}
        variant="error"
        title="Logged out"
        message="Thank you for using CDI. Your session token has expired. You will be redirected to Dashboard now."
        hideButtons={true}
        id="errorLogout"
      />
    </div>
  );
};

export default Logout;
