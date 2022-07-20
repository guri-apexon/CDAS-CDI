/* eslint-disable no-lonely-if */
// libraries
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
// components
import Modal from "apollo-react/components/Modal";
import AlertBox from "../../pages/AlertBox/AlertBox";
// helpers
import {
  formComponentActive,
  formComponentInActive,
  hideAlert,
  hideAppSwitcher,
  showAppSwitcher,
} from "../../store/actions/AlertActions";

/**
 * Renders modal whenever route is changed without saving changes
 *
 * @param {string} continueBtnLabel Label for continue btn
 * @param {string} discardBtnLabel Label for discard btn
 * @param {boolean} isManualTrigger Flag for checking if modal needs to trigger manually
 * @param {string} manualTriggerToggle Flag for opening/closing modal
 * @param {string} message Modal message
 * @param {string} title Modal title
 * @param {Function} handlePostManualContinue runs upon clicking continue btn when in manual mode
 * @param {Function} handlePostManualDiscardChange runs upon clicking discard btn when in manual mode
 */
const SaveChangesModal = ({
  continueBtnLabel = "Keep editing",
  discardBtnLabel = "Discard changes",
  isManualTrigger = false,
  manualTriggerToggle = false,
  message = "Do you really want to exit and discard dataflow changes",
  title = "Exit",
  handlePostManualContinue = () => {},
  handlePostManualDiscardChange = () => {},
}) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const alertStore = useSelector((state) => state.alert);

  // Save Changes Modal Variables
  const routerHandle = useRef();
  const [targetRoute, setTargetRoute] = useState("");
  const [isShowAlertBox, setShowAlertBox] = useState(false);
  const [showSaveChangesModal, setShowSaveChangesModal] = useState(false);

  const unblockRouter = () => {
    dispatch(formComponentInActive());
    dispatch(hideAlert());
    dispatch(hideAppSwitcher());
    if (routerHandle) {
      routerHandle.current();
    }
  };

  const handleCloseSaveChangesModal = () => {
    if (isManualTrigger) {
      handlePostManualContinue();
    }
    setShowSaveChangesModal(false);
  };

  const handleDiscardChanges = () => {
    unblockRouter();
    if (isManualTrigger) {
      handleCloseSaveChangesModal();
      handlePostManualDiscardChange();
      if (targetRoute) {
        history.push(targetRoute);
      }
    } else {
      if (targetRoute === "") {
        history.push("/dashboard");
      } else {
        history.push(targetRoute);
        handleCloseSaveChangesModal();
      }
    }
  };

  // Save Changes Modal Effect
  useEffect(() => {
    routerHandle.current = history.block((tr) => {
      setTargetRoute(tr?.pathname);
      setShowSaveChangesModal(true);
      return false;
    });

    return () => {
      routerHandle.current();
    };
  });

  // Alert Box On App Switcher
  const keepEditingBtn = () => {
    dispatch(hideAlert());
    setShowAlertBox(false);
  };

  const leavePageBtn = () => {
    dispatch(hideAlert());
    dispatch(showAppSwitcher());
    setShowAlertBox(false);
  };

  // Detect whenever showAlertBox changes
  useEffect(() => {
    if (alertStore?.showAlertBox) {
      setShowAlertBox(true);
    }
  }, [alertStore]);

  // Set form to active set for alert box configuration
  useEffect(() => {
    dispatch(formComponentActive());
  }, []);

  // Manually open trigger
  useEffect(() => {
    if (isManualTrigger) {
      setShowSaveChangesModal(manualTriggerToggle);
    }
  }, [isManualTrigger, manualTriggerToggle]);

  return (
    <>
      {isShowAlertBox && (
        <AlertBox
          onClose={keepEditingBtn}
          submit={leavePageBtn}
          message="Do you really want to exit and discard dataflow changes"
          title="Exit"
          dataflow
        />
      )}

      <Modal
        id="success"
        message={message}
        onClose={handleCloseSaveChangesModal}
        open={showSaveChangesModal}
        title={title}
        variant="warning"
        buttonProps={[
          {
            label: continueBtnLabel,
            onClick: handleCloseSaveChangesModal,
          },
          {
            label: discardBtnLabel,
            variant: "primary",
            onClick: handleDiscardChanges,
          },
        ]}
      />
    </>
  );
};

export default SaveChangesModal;
