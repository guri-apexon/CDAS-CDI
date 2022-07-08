import Modal from "apollo-react/components/Modal";

import "./Logout.scss";
import { goToCore } from "../../utils";

const Logout = () => {
  return (
    <div className="wrapper">
      <Modal
        open={true}
        // variant="error"
        disableBackdropClick={true}
        title="Logged out"
        message={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <>
            <div>Thank you for using the Clinical Data Analytics Suite.</div>
            <span>You are now logged out.</span>
          </>
        }
        id="errorLogout"
        buttonProps={[
          {
            label: "Return to Launchpad",
            variant: "primary",
            onClick: () => {
              goToCore();
              window.location.reload();
            },
          },
        ]}
      />
    </div>
  );
};

export default Logout;
