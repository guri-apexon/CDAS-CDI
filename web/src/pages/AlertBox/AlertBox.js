import React from "react";
import Modal from "apollo-react/components/Modal";

const AlertBox = ({ onClose, submit, title, message, dataflow }) => {
  return (
    <Modal
      open={true}
      onClose={onClose}
      disableBackdropClick={true}
      className="save-confirm"
      variant="warning"
      title={title}
      message={message}
      buttonProps={
        dataflow
          ? [
              {
                label: "Keep editing",
                onClick: onClose,
              },
              {
                label: "Leave without saving",
                variant: "primary",
                onClick: submit,
              },
            ]
          : [
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
            ]
      }
      id="neutral"
    />
  );
};

export default AlertBox;
