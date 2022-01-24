import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Panel from "apollo-react/components/Panel";
import { neutral1 } from "apollo-react/colors";
import PageHeader from "../../components/DataFlow/PageHeader";

import RightPanel from "./RightPanel";
import LeftPanel from "./LeftPanel";
import "./Dashboard.scss";

const styles = {
  root: {
    display: "flex",
    height: "100vh",
    backgroundColor: neutral1,
    boxSizing: "content-box",
    maxWidth: "100vw",
  },
  leftPanel: {
    maxWidth: "calc(100vh - 120px)",
  },
};

const Dashboard = () => {
  const useStyles = makeStyles(styles);
  const classes = useStyles();

  return (
    <>
      {/* {console.log("studies", pinnedStudies, studyList)} */}
      <PageHeader height={64} />
      <div className={classes.root}>
        <Panel className={classes.leftPanel} width={407}>
          <LeftPanel />
        </Panel>
        <Panel width="100%" hideButton>
          <RightPanel />
        </Panel>
      </div>
    </>
  );
};

export default Dashboard;
