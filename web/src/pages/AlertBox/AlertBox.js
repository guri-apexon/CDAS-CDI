import React from "react";
import Modal from "apollo-react/components/Modal";

const AlertBox = ({ handleOkClose, message }) => {
  return (
    <Modal
      open={true}
      onClose={handleOkClose}
      disableBackdropClick="true"
      className="save-confirm"
      variant="warning"
      title="Session Timeout!"
      message={message}
      buttonProps={[
        {
          label: "Ok",
          onClick: handleOkClose,
          // disabled: loading,
        },
      ]}
      id="neutral"
    />
  );
};

export default AlertBox;
