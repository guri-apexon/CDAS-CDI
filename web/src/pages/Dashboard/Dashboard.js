/* eslint-disable react/button-has-type */
import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation, useHistory } from "react-router-dom";
import Panel from "apollo-react/components/Panel";
import Typography from "apollo-react/components/Typography";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import { Link } from "apollo-react/components/Link";
import { useDispatch, useSelector } from "react-redux";
import {
  getFlowDetailsOfStudy,
  getDatasetIngestionOfStudy,
} from "../../store/actions/DashboardAction";

import LeftPanel from "./LeftPanel";
import "./Dashboard.scss";
import { getUserId } from "../../utils/index";

// import { downloadTemplate } from "../../utils/downloadData";

import DataflowTab from "./DataflowTab/DataflowTab";
import MonitorTab from "./MonitorTab/MonitorTab";
import { freezeDfVersion } from "../../store/actions/DataFlowAction";
import { resetFTP, resetJDBC } from "../../store/actions/DataSetsAction";

const queryString = require("query-string");

const userId = getUserId();

const styles = {
  pageRootInnerWrapper: {
    maxHeight: "calc( 100vh - 120px)",
    overflow: "hidden",
  },
  rightPanel: {
    maxWidth: "calc(100vw - 425px)",
    width: "calc(100vw - 425px)",
  },
  rightPanelExtended: {
    maxWidth: "calc(100vw - 42px)",
    width: "calc(100vw - 40px)",
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

const Dashboard = () => {
  const history = useHistory();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [value, setValue] = useState(1);
  const mainContentRef = useRef(null);
  const [sidebarHeight, setSidebarHeight] = useState(400);

  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const location = useLocation();

  const dashboard = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();

  const parsedQuery = queryString.parse(location.search);

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

  const fetchLatestData = (control = "", activeOnly = 1) => {
    if (dashboard?.selectedCard?.prot_id) {
      dispatch(
        getDatasetIngestionOfStudy(
          dashboard.selectedCard.prot_id,
          control,
          activeOnly,
          userId
        )
      );
    }
  };

  useEffect(() => {
    const showMonitorTab =
      process.env.REACT_APP_MONITOR_VIEW_DEFAULT === "true" ? 0 : 1;
    setValue(showMonitorTab);
  }, []);

  useEffect(() => {
    if (dashboard?.selectedCard?.prot_id) {
      updateData();
      // fetchLatestData();
    }
  }, [dashboard.selectedCard]);

  const setHeight = (offsetHeight) => {
    setTimeout(() => {
      const height = offsetHeight
        ? offsetHeight
        : mainContentRef?.current?.offsetHeight;
      if (height !== sidebarHeight) {
        setSidebarHeight(height);
      }
    }, 400);
  };

  useEffect(() => {
    setHeight(mainContentRef?.current?.clientHeight);
  }, [mainContentRef?.current?.clientHeight]);

  // useEffect(() => {
  //   // if (value === 1) {
  //   setHeight();
  //   // }
  // }, [value]);
  useEffect(() => {
    history.listen((loc, action) => {
      if (loc.pathname === "/dashboard") {
        dispatch(resetJDBC());
        dispatch(resetFTP());
      }
    });
  }, [history]);

  useEffect(() => {
    dispatch(freezeDfVersion(false));
    if (Object.keys(parsedQuery)?.includes("monitor")) {
      setValue(0);
    }
  }, []);
  return (
    <>
      <div className="pageRoot dashboard-wrapper">
        <Panel
          onClose={handleClose}
          onOpen={handleOpen}
          open={isPanelOpen}
          width={407}
        >
          <LeftPanel stydyHeight={sidebarHeight - 40} setValue={setValue} />
        </Panel>
        <Panel
          className={
            isPanelOpen ? classes.rightPanel : classes.rightPanelExtended
          }
          width="100%"
          hideButton
        >
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

            <div
              id="tabsContainer"
              ref={mainContentRef}
              style={{ padding: 20 }}
            >
              {value === 0 && (
                <MonitorTab
                  fetchLatestData={fetchLatestData}
                  updateHeight={setHeight}
                  protId={dashboard?.selectedCard?.prot_id}
                />
              )}
              {value === 1 && (
                <DataflowTab updateHeight={setHeight} updateData={updateData} />
              )}
            </div>
          </main>
        </Panel>
      </div>
    </>
  );
};

export default Dashboard;
