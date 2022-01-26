/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import Panel from "apollo-react/components/Panel/Panel";
import PageHeader from "../../components/DataFlow/PageHeader";
import LeftPanel from "../../components/DataFlow/LeftPanel/LeftPanel";
import "./Dataset.scss";

const Dataset = () => {
  const [isPanelOpen, setIsPanelOpen] = React.useState(true);

  const styles = {
    rightPanel: {
      maxWidth: isPanelOpen ? "calc(100vw - 466px)" : "calc(100vw - 42px)",
      width: isPanelOpen ? "calc(100vw - 464px)" : "calc(100vw - 40px)",
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
          width={446}
        >
          <LeftPanel />
        </Panel>
        <Panel className={classes.rightPanel} width="100%" hideButton>
          <main className={classes.content}>test page</main>
        </Panel>
      </div>
    </>
  );
};

export default Dataset;
