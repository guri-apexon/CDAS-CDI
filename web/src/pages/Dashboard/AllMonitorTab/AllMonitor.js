/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
// libraries
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
// components
import { neutral8, orange } from "apollo-react/colors";
import Grid from "apollo-react/components/Grid";
import Hero from "apollo-react/components/Hero";
import Loader from "apollo-react/components/Loader";
import Peek from "apollo-react/components/Peek";
import QuarantineIcon from "apollo-react-icons/EyeHidden";
import SegmentedControl from "apollo-react/components/SegmentedControl";
import SegmentedControlGroup from "apollo-react/components/SegmentedControlGroup";
import StatusCheckIcon from "apollo-react-icons/StatusCheck";
import StatusDotOutlineIcon from "apollo-react-icons/StatusDotOutline";
import StatusExclamationIcon from "apollo-react-icons/StatusExclamation";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import Typography from "apollo-react/components/Typography";
import InfoCard from "../MonitorTab/InfoCard";
import DatasetTable from "../MonitorTab/DatasetTable";
// helpers
import { ReactComponent as DatasetsIcon } from "../../../components/Icons/dataset.svg";
import { getAllIngestionOfStudy } from "../../../store/actions/DashboardAction";
import { getUserInfo, getUserId } from "../../../utils/index";
import { moreColumnsWithFrozen } from "../MonitorTab/columns.data";
import { ReactComponent as FailureIcon } from "../../../components/Icons/failure.svg";
import { ReactComponent as StaleIcon } from "../../../components/Icons/Stale-grey.svg";
import { queryParamsFull } from "../MonitorTab/helper";
import {
  Categories,
  Features,
  useStudyPermission,
} from "../../../components/Common/usePermission";
// styles
import "../Dashboard.scss";

const queryString = require("query-string");

export default function MonitorTab({ userID }) {
  const dispatch = useDispatch();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const [control, setSegmentControl] = useState("0");
  const [rows, setRowData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeOnly, setActiveOnly] = useState(true);
  const [columnsState, setColumns] = useState(moreColumnsWithFrozen);
  const [hasUpdated, setHasUpdated] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const parsedQuery = queryString.parse(location.search);
  const { firstName } = getUserInfo();

  const [summary, setSummary] = useState({
    failed_loads: 0,
    quarantined_files: 0,
    files_exceeding: 0,
    fileswith_issues: 0,
    stale_datasets: 0,
  });
  const dashboard = useSelector((state) => state.dashboard);

  const history = useHistory();

  const { canEnabled: canReadIngestionIssues } = useStudyPermission(
    Categories.MENU,
    Features.CDI_INGESTION_ISSUES,
    userID
  );

  const fetchLatestData = (
    testflag = "",
    active = 1,
    processStatus = "",
    limit = "",
    noOfDays = ""
  ) => {
    const userId = getUserId();
    if (userId) {
      dispatch(
        getAllIngestionOfStudy(
          userId,
          testflag,
          active,
          processStatus,
          limit,
          noOfDays
        )
      );
    }
  };

  useEffect(() => {
    fetchLatestData(control, activeOnly);

    // trigger refresh data every 5 minutes
    const intervalId = setInterval(() => {
      fetchLatestData(control, activeOnly);
    }, 300000);

    // clear interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [activeOnly, control]);

  useEffect(() => {
    const summaryData = dashboard.ingestnData?.summary || {};
    const rowData = dashboard.ingestnData?.datasets || [];
    setTotalCount(dashboard.ingestnData?.totalSize || 0);
    setSummary({ ...summaryData });
    setRowData([...rowData]);
  }, [dashboard.ingestnData]);

  useEffect(() => {
    if (dashboard?.summaryLoading === false && !hasLoadedOnce && userID) {
      setHasLoadedOnce(true);
    }
  }, [dashboard?.summaryLoading]);

  const handleChange = (e, checked) => {
    setActiveOnly(checked);
  };

  const handlePeekOpen = (name, description) => {
    setOpen(true);
    setCurRow({ name, description });
  };

  const onSegmentChange = (value) => {
    setSegmentControl(value);
  };

  const handleViewButton = (query = "") => {
    let q = query;
    if (q.length && control !== "all") {
      q += `&${queryParamsFull.CONTROL}=${control}`;
    } else if (control !== "all") {
      q += `${queryParamsFull.CONTROL}=${control}`;
    }
    if (q.length) {
      history.push(`/cdihome/monitor?${q}`, {
        from: "dashboard",
      });
    } else {
      history.push("/cdihome/monitor");
    }
  };

  const CustomHeader = () => <></>;

  return (
    <div>
      {dashboard.summaryLoading && <Loader />}
      <Hero>
        <div className="topContainer" style={{ position: "relative" }}>
          <Typography
            variant="title1"
            style={{
              lineHeight: "32px",
              fontWeight: 600,
              display: "inline-flex",
              position: "absolute",
              left: "0",
            }}
            darkMode
          >
            Study Monitor Summary
          </Typography>
          <div style={{ textAlign: "center" }}>
            <SegmentedControlGroup
              value={control}
              exclusive
              style={{ margin: "auto 20%" }}
              onChange={(event, value) => onSegmentChange(value)}
            >
              <SegmentedControl
                className="monitor-btn"
                value="9"
                disabled={control === "9"}
              >
                All
              </SegmentedControl>
              <SegmentedControl
                className="monitor-btn"
                value="0"
                disabled={control === "0"}
              >
                Production
              </SegmentedControl>
              <SegmentedControl
                className="monitor-btn"
                value="1"
                disabled={control === "1"}
              >
                Test
              </SegmentedControl>
            </SegmentedControlGroup>
          </div>
        </div>
        <div className="dashboardSummary">
          <InfoCard
            title="Dataset Pipelines"
            subtitle="Count of the Active Datasets, i.e. All the Datasets associated with the user’s studies."
            value={totalCount}
            icon={() => {
              return (
                <DatasetsIcon
                  style={{ fill: "#00C221" }}
                  className="newMonitor-icon"
                />
              );
            }}
            handlePeekOpen={handlePeekOpen}
            closePeek={() => setOpen(false)}
            handleViewClick={() => {
              handleViewButton();
            }}
          />
          <InfoCard
            title="Data Refresh Alerts"
            subtitle="Count of all datasets whose latest job status is Failed."
            value={summary?.data_refresh_alerts}
            icon={() => {
              return (
                <StatusExclamationIcon
                  style={{ color: orange }}
                  className="newMonitor-icon"
                />
              );
            }}
            handlePeekOpen={handlePeekOpen}
            closePeek={() => setOpen(false)}
            handleViewClick={() => {
              handleViewButton(queryParamsFull.JOB_STATUS_FAILED);
            }}
          />
          <InfoCard
            title="Datasets with Issues"
            subtitle={`Files which were processed successfully but in which dataset configuration or VLC compliance issues were identified (will be listed as "PROCESSED WITH ERRORS" in data flow monitor)`}
            value={summary?.datasetwithissues}
            icon={() => {
              return <FailureIcon style={{ fill: "#e20000" }} />;
            }}
            color="orange"
            handlePeekOpen={handlePeekOpen}
            closePeek={() => setOpen(false)}
            handleViewClick={() => {
              handleViewButton(queryParamsFull.DATASET_WITH_ISSUES);
            }}
          />
          <InfoCard
            title="Stale  Datasets"
            subtitle="Datasets for which a file has not been received within the specified number of days."
            value={summary?.stale_datasets}
            icon={() => {
              return (
                <StaleIcon
                  style={{ fill: "#F2F2F2", color: "#FF2733" }}
                  className="newMonitor-icon"
                />
              );
            }}
            color="orange"
            handlePeekOpen={handlePeekOpen}
            closePeek={() => setOpen(false)}
            handleViewClick={() => {
              handleViewButton(queryParamsFull.STALE);
            }}
          />
          <InfoCard
            title="Quarantined Files"
            subtitle="Files being processed for value level conformance rules assigned the action of 'reject'."
            value={summary?.quarantined_files}
            icon={() => {
              return (
                <QuarantineIcon
                  style={{
                    fill: "#FF9300",
                    color: "#FF9300",
                  }}
                  className="newMonitor-icon"
                />
              );
            }}
            handlePeekOpen={handlePeekOpen}
            closePeek={() => setOpen(false)}
            handleViewClick={() => {
              handleViewButton(queryParamsFull.QUARANTINE);
            }}
          />
          <InfoCard
            title="Files exceed % of change"
            subtitle="Files in which the change in the number of records received exceeded the configured % row count decrease allowed."
            value={summary?.files_exceeding}
            icon={() => {
              return (
                <SwapVertIcon
                  style={{ fill: "#595959" }}
                  className="conter-icon"
                />
              );
            }}
            color="orange"
            handlePeekOpen={handlePeekOpen}
            closePeek={() => setOpen(false)}
            handleViewClick={() => {
              handleViewButton(queryParamsFull.EXCEEDS_PER_CHANGE);
            }}
          />

          <InfoCard
            title="In Queue"
            subtitle="Count of all datasets whose latest job status is Queued"
            value={summary?.in_queue}
            icon={StatusDotOutlineIcon}
            color="blueDark"
            handlePeekOpen={handlePeekOpen}
            closePeek={() => setOpen(false)}
            handleViewClick={() => {
              handleViewButton(queryParamsFull.JOB_STATUS_IN_QUEUE);
            }}
          />

          <Peek
            open={open}
            followCursor
            placement="top"
            content={
              <div style={{ maxWidth: 400 }}>
                <Typography
                  variant="title2"
                  gutterBottom
                  style={{ fontWeight: 600 }}
                >
                  {curRow.name}
                </Typography>
                <Typography variant="body2" style={{ color: neutral8 }}>
                  {curRow.description}
                </Typography>
              </div>
            }
          />
        </div>
      </Hero>
      <Grid
        container
        spacing={1}
        style={{ padding: "12px 5px 24px 5px", backgroundColor: "#f8f9fb" }}
      >
        <Grid item sm={12}>
          <div className="hide-pagination">
            <DatasetTable
              rows={rows}
              CustomHeader={CustomHeader}
              sortColumn="downloadendtime"
              sortOrder="desc"
              fromAllMonitor={true}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
