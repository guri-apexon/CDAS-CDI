import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Panel from "apollo-react/components/Panel";
import Typography from "apollo-react/components/Typography";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import { useDispatch, useSelector } from "react-redux";
import { getFlowDetailsOfStudy } from "../../store/actions/DashboardAction";
import PageHeader from "../../components/DataFlow/PageHeader";
import LeftPanel from "./LeftPanel";
import "./Dashboard.scss";

import DataflowTab from "./DataflowTab";

const Dashboard = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [value, setValue] = useState(1);

  const styles = {
    rightPanel: {
      maxWidth: isPanelOpen ? "calc(100vw - 427px)" : "calc(100vw - 42px)",
      width: isPanelOpen ? "calc(100vw - 425px)" : "calc(100vw - 40px)",
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

  const dashboard = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleOpen = () => {
    setIsPanelOpen(true);
  };

  const handleChangeTab = (event, v) => {
    setValue(v);
  };

  const updateData = () => {
    dispatch(getFlowDetailsOfStudy(dashboard.selectedCard.prot_id));
  };

  useEffect(() => {
    if (dashboard?.selectedCard?.prot_id) {
      updateData();
    }
  }, [dashboard.selectedCard]);

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
                <Tab label="Monitor" />
                <Tab label="Data Flows" />
                {/* <Tab label="Tab Header 3" /> */}
              </Tabs>
            </div>

            <div style={{ padding: 20 }}>
              {value === 0 && (
                <>
                  <Typography variant="body2"> Monitor page content</Typography>
                </>
              )}
              {value === 1 && <DataflowTab updateData={updateData} />}
            </div>
          </main>
        </Panel>
      </div>
    </>
  );
};

export default Dashboard;
