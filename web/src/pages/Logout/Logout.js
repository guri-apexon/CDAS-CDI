import React from "react";
import Modal from "apollo-react/components/Modal";

import "./Logout.scss";

const Logout = () => {
  return (
    <div className="wrapper">
      <Modal
        open={true}
        variant="error"
        title="Logged Out"
        message="Thank you for using the Clinical Data Analytics Suite. You are now logged out."
        hideButtons={true}
        id="errorLogout"
      />
    </div>
  );
};

export default Logout;
