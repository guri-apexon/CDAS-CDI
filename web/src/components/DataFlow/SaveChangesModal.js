/* eslint-disable no-lonely-if */
// libraries
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
// components
import Modal from "apollo-react/components/Modal";
import AlertBox from "../../pages/AlertBox/AlertBox";
// helpers
import { checkFormChanges } from "../../utils";
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
 * @param {boolean} manualTriggerToggle Flag for opening/closing modal
 * @param {boolean} manualIsAnyChangeCheck Flag for checking any changes in form
 * @param {boolean} manualIsAnyChangeFlag Flag for triggering manual changes
 * @param {boolean} manualCheckerFlag Flag for custom manual changes check
 * @param {Function} handleManualChecker Function to run custom manual changes check
 * @param {string} shouldTriggerOnRedirect Flag for controlling opening/closing modal while route changes
 * @param {string} shouldCheckForChanges Flag for checking changes
 * @param {string} message Modal message
 * @param {string} title Modal title
 * @param {Function} handlePostManualContinue runs upon clicking continue btn when in manual mode
 * @param {Function} handlePostManualDiscardChange runs upon clicking discard btn when in manual mode
 */
const SaveChangesModal = ({
  continueBtnLabel = "Keep editing",
  discardBtnLabel = "Leave without saving",
  isManualTrigger = false,
  manualTriggerToggle = false,
  manualIsAnyChangeCheck = false,
  manualIsAnyChangeFlag = false,
  manualCheckerFlag = false,
  handleManualChecker = () => {},
  shouldTriggerOnRedirect = true,
  shouldCheckForChanges = true,
  message = "All unsaved changes will be lost.",
  title = "Lose your work?",
  handlePostManualContinue = () => {},
  handlePostManualDiscardChange = () => {},
}) => {
  const dispatch = useDispatch();
  const history = useHistory();

  // Save Change Master Flag
  const SAVE_CHANGE_MODAL_FLAG =
    process.env.REACT_APP_SAVE_CHANGE_MODAL_FLAG === "true" ? true : false;

  const alertStore = useSelector((state) => state.alert);
  const form = useSelector((state) => state.form) || null;
  const dataFlowStore = useSelector((state) => state.dataFlow) || null;

  // Save Changes Modal Variables
  const routerHandle = useRef();
  const [targetRoute, setTargetRoute] = useState("");
  const [isShowAlertBox, setShowAlertBox] = useState(false);
  const [showSaveChangesModal, setShowSaveChangesModal] = useState(false);
  const [anyChanges, setAnyChanges] = useState(false);

  const unblockRouter = () => {
    dispatch(formComponentInActive());
    dispatch(hideAlert());
    dispatch(hideAppSwitcher());
    if (routerHandle) {
      routerHandle?.current?.();
    }
  };

  const handleCloseSaveChangesModal = () => {
    if (isManualTrigger) {
      setTargetRoute("");
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
    if (SAVE_CHANGE_MODAL_FLAG) {
      if (shouldCheckForChanges) {
        let isAnyChange = false;

        // go through redux form data and check if there is any change
        if (!manualIsAnyChangeCheck) {
          isAnyChange = checkFormChanges(form, dataFlowStore) || false;
        }
        if (manualIsAnyChangeCheck) {
          isAnyChange = manualIsAnyChangeFlag || false;
        }

        // check for custom field changes
        if (manualCheckerFlag) {
          isAnyChange = handleManualChecker(isAnyChange) || false;
        }

        setAnyChanges(isAnyChange);

        if (isAnyChange && shouldTriggerOnRedirect) {
          routerHandle.current = history.block((tr) => {
            setTargetRoute(tr?.pathname);
            setShowSaveChangesModal(true);
            return false;
          });
        }
      } else {
        if (shouldTriggerOnRedirect) {
          routerHandle.current = history.block((tr) => {
            setTargetRoute(tr?.pathname);
            setShowSaveChangesModal(true);
            return false;
          });
        }
      }
    }

    return () => {
      if (SAVE_CHANGE_MODAL_FLAG && shouldTriggerOnRedirect) {
        routerHandle?.current?.();
      }
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
    if (anyChanges) {
      if (alertStore?.showAlertBox && !isShowAlertBox) {
        setShowAlertBox(true);
      } else {
        setShowAlertBox(false);
      }
    } else {
      if (alertStore?.showAlertBox) {
        dispatch(showAppSwitcher());
      }
    }
  }, [alertStore]);

  // Set form to active set for alert box configuration
  useEffect(() => {
    if (SAVE_CHANGE_MODAL_FLAG) {
      dispatch(formComponentActive());
    }
  }, []);

  // Manually open trigger
  useEffect(() => {
    if (SAVE_CHANGE_MODAL_FLAG && isManualTrigger) {
      setShowSaveChangesModal(manualTriggerToggle);
    }
  }, [isManualTrigger, manualTriggerToggle]);

  return (
    <>
      {isShowAlertBox && SAVE_CHANGE_MODAL_FLAG && (
        <AlertBox
          onClose={keepEditingBtn}
          submit={leavePageBtn}
          message="All unsaved changes will be lost."
          title="Lose your work?"
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
            variant: "primary",
            label: discardBtnLabel,
            onClick: handleDiscardChanges,
          },
        ]}
      />
    </>
  );
};

export default SaveChangesModal;
