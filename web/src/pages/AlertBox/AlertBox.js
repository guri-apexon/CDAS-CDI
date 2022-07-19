import React from "react";
import Modal from "apollo-react/components/Modal";

const AlertBox = ({
  onClose,
  submit,
  title = "Lose your work?",
  message = "All unsaved changes will be lost.",
}) => {
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
          label: "Cancel",
          onClick: onClose,
          // disabled: loading,
        },
        {
          label: "Yes",
          onClick: submit,
          // disabled: loading,
        },
      ]}
      id="neutral"
    />
  );
};

export default AlertBox;
