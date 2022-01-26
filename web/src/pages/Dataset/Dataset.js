/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import Typography from "apollo-react/components/Typography";
import Panel from "apollo-react/components/Panel/Panel";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import PageHeader from "../../components/DataFlow/PageHeader";
import LeftPanel from "../../components/DataFlow/LeftPanel/LeftPanel";
import "./Dataset.scss";
import SettingsTab from "./SettingsTab";
import ColumnsTab from "./ColumnsTab";
import VLCTab from "./VLCTab";

const Dataset = () => {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [value, setValue] = React.useState(0);

  const styles = {
    rightPanel: {
      maxWidth: isPanelOpen ? "calc(100vw - 466px)" : "calc(100vw - 42px)",
      width: isPanelOpen ? "calc(100vw - 464px)" : "calc(100vw - 40px)",
    },
    content: {
      flexGrow: 1,
      background: "#f6f7fb",
      minHeight: "calc(100vh - 125px)",
    },
    contentHeader: {
      paddingTop: 11,
      padding: "16px 25px 0px 25px",
      backgroundColor: "#ffffff",
    },
    contentTitle: {
      padding: "20px 0px",
      fontSize: 20,
      lineHeight: "22px",
      fontWeight: 500,
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

  const handleChangeTab = (event, v) => {
    setValue(v);
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
          <main className={classes.content}>
            <div className={classes.contentHeader}>
              <Typography
                className={classes.contentTitle}
                variant="title1"
                gutterBottom
              >
                Ingestion Dashboard
              </Typography>
              <Tabs value={value} onChange={handleChangeTab} truncate>
                <Tab label="Settings" />
                <Tab label="Dataset Columns" />
                <Tab label="VLC" />
                {/* <Tab label="Tab Header 3" /> */}
              </Tabs>
            </div>

            <div style={{ padding: 20 }}>
              {value === 0 && <SettingsTab />}
              {value === 1 && <ColumnsTab />}
              {value === 2 && <VLCTab />}
            </div>
          </main>
        </Panel>
      </div>
    </>
  );
};

export default Dataset;
