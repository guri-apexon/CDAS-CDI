/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { neutral8, orange, red } from "apollo-react/colors";
import Hero from "apollo-react/components/Hero";
import Grid from "apollo-react/components/Grid";
import Box from "apollo-react/components/Box";
import Table from "apollo-react/components/Table";
import Loader from "apollo-react/components/Loader";
import Typography from "apollo-react/components/Typography";
import SegmentedControl from "apollo-react/components/SegmentedControl";
import SegmentedControlGroup from "apollo-react/components/SegmentedControlGroup";
import StatusNegativeIcon from "apollo-react-icons/StatusNegative";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import InfoIcon from "apollo-react-icons/Info";
import Peek from "apollo-react/components/Peek";
import Button from "apollo-react/components/Button";
import Switch from "apollo-react/components/Switch";
import DownloadIcon from "apollo-react-icons/Download";
import FilterIcon from "apollo-react-icons/Filter";
import RefreshIcon from "apollo-react-icons/Refresh";
import StatusCheckIcon from "apollo-react-icons/StatusCheck";
import StatusDotOutlineIcon from "apollo-react-icons/StatusDotOutline";
import StatusExclamationIcon from "apollo-react-icons/StatusExclamation";
import QuarantineIcon from "apollo-react-icons/EyeHidden";

import { moreColumnsWithFrozen } from "./columns.data";
import InfoCard from "./InfoCard";

import { getUserInfo, titleCase } from "../../../utils/index";
import { ReactComponent as StaleIcon } from "../../../components/Icons/Stale-grey.svg";
import { ReactComponent as IssueIcon } from "../../../components/Icons/Issue.svg";
import { ReactComponent as DatasetsIcon } from "../../../components/Icons/dataset.svg";
import { ReactComponent as FailureIcon } from "../../../components/Icons/Failed.svg";
// import { ReactComponent as QuarantineIcon } from "../../../components/Icons/Quarantine.svg";
import "../Dashboard.scss";

import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../../components/Common/usePermission";
import DatasetTable from "./DatasetTable";
import { queryParamsFull } from "./helper";
import { updatePreviousStateSegmentControlTab } from "../../../store/actions/DashboardAction";

export default function MonitorTab({ fetchLatestData, protId, updateHeight }) {
  const dashboard = useSelector((state) => state.dashboard);

  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const [control, setSegmentControl] = useState(
    dashboard.previousState.segmentControl || "0"
  );
  const [rows, setRowData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeOnly, setActiveOnly] = useState(true);
  const [columnsState, setColumns] = useState(moreColumnsWithFrozen);
  const [hasUpdated, setHasUpdated] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const { firstName } = getUserInfo();

  const [summary, setSummary] = useState({
    failed_loads: 0,
    quarantined_files: 0,
    files_exceeding: 0,
    fileswith_issues: 0,
    stale_datasets: 0,
  });

  const history = useHistory();

  const dispatch = useDispatch();

  const { canEnabled: canReadIngestionIssues } = useStudyPermission(
    Categories.MENU,
    Features.CDI_INGESTION_ISSUES,
    protId
  );

  useEffect(() => {
    const summaryData = dashboard.ingestionData?.summary || {};
    const rowData = dashboard.ingestionData?.datasets || [];
    setTotalCount(dashboard.ingestionData?.totalSize || 0);
    setSummary({ ...summaryData });
    setRowData([...rowData]);
    updateHeight();
    console.log(">> summar", summaryData);
  }, [dashboard.ingestionData]);

  useEffect(() => {
    fetchLatestData(control, activeOnly);
  }, [activeOnly, control, protId]);

  useEffect(() => {
    if (dashboard?.summaryLoading === false && !hasLoadedOnce && protId) {
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

    // update segment value in store as well
    dispatch(updatePreviousStateSegmentControlTab(value));
  };
  const handleViewButton = (query = "") => {
    let q = query;
    if (q.length && control !== "all") {
      q += `&${queryParamsFull.CONTROL}=${control}`;
    } else if (control !== "all") {
      q += `${queryParamsFull.CONTROL}=${control}`;
    }
    if (q.length) {
      history.push(`/dashboard/monitor?${q}`);
    } else {
      history.push("/dashboard/monitor");
    }
  };

  const CustomHeader = ({ toggleFilters }) => (
    <div>
      <Button
        size="small"
        id="filterBtn"
        variant="secondary"
        icon={FilterIcon}
        onClick={toggleFilters}
      >
        Filter
      </Button>
    </div>
  );

  if (!protId) {
    return (
      <div>
        <Box
          className="h-v-center flex-column add-btn-container"
          style={{ height: "100vh" }}
        >
          <DatasetsIcon
            style={{
              position: "relative",
              margin: "0 auto",
              width: "60px",
              height: "60px",
            }}
          />
          <Typography
            variant="title1"
            style={{ fontSize: 24, lineHeight: "48px" }}
          >
            Nothing to See Here
          </Typography>
          <Typography
            variant="title1"
            style={{ fontSize: 20, lineHeight: "24px" }}
          >
            Please select a study.
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div>
      {/* {dashboard.summaryLoading && !hasLoadedOnce && <Loader />} */}
      {dashboard.summaryLoading && <Loader />}
      <div
        style={{
          textAlign: "right",
          marginBottom: "10px",
        }}
      >
        <Button
          size="small"
          id="filterBtn"
          variant="secondary"
          icon={RefreshIcon}
          onClick={() => fetchLatestData(control, activeOnly)}
        >
          Refresh
        </Button>
      </div>
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
                value="all"
                disabled={control === "all"}
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
            handlePeekOpen={handlePeekOpen}
            closePeek={() => setOpen(false)}
            icon={() => {
              return (
                <FailureIcon
                  style={{ color: red }}
                  className="newMonitor-icon"
                />
              );
            }}
            handleViewClick={() => {
              handleViewButton(queryParamsFull.JOB_STATUS_FAILED);
            }}
          />
          <InfoCard
            title="Datasets with Issues"
            subtitle={`Files which were processed successfully but in which dataset configuration or VLC compliance issues were identified (will be listed as "PROCESSED WITH ERRORS" in data flow monitor)`}
            value={summary?.datasetwithissues}
            icon={() => {
              return (
                <StatusExclamationIcon
                  style={{ color: orange }}
                  className="newMonitor-icon"
                />
              );
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
            <DatasetTable rows={rows} CustomHeader={CustomHeader} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
