import React from "react";
import Modal from "apollo-react/components/Modal";

const AlertBox = ({ onClose, submit, title, message }) => {
  return (
    <Modal
      open={true}
      onClose={onClose}
      disableBackdropClick={true}
      className="save-confirm"
      variant="warning"
      title={title}
      message={message}
      buttonProps={[
        {
          label: "Dismiss",
          onClick: onClose,
          // disabled: loading,
        },
        {
          label: "Yes cancel",
          onClick: submit,
          // disabled: loading,
        },
      ]}
      id="neutral"
    />
  );
};

export default AlertBox;
