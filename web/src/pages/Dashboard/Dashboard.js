import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Panel from "apollo-react/components/Panel";
import PageHeader from "../../components/DataFlow/PageHeader";
import RightPanel from "./RightPanel";
import LeftPanel from "./LeftPanel";
import "./Dashboard.scss";

const Dashboard = () => {
  const [isPanelOpen, setIsPanelOpen] = React.useState(true);

  const styles = {
    rightPanel: {
      maxWidth: isPanelOpen ? "calc(100vw - 427px)" : "calc(100vw - 42px)",
      width: isPanelOpen ? "calc(100vw - 425px)" : "calc(100vw - 40px)",
    },
  };

  const useStyles = makeStyles(styles);
  const classes = useStyles();

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleOpen = () => {
    setIsPanelOpen(true);
  };

  return (
    <>
      <PageHeader height={64} />
      <div className="pageRoot">
        <Panel
          onClose={handleClose}
          onOpen={handleOpen}
          open={isPanelOpen}
          width={407}
        >
          <LeftPanel />
        </Panel>
        <Panel className={classes.rightPanel} width="100%" hideButton>
          <RightPanel />
        </Panel>
      </div>
    </>
  );
};

export default Dashboard;
