/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { neutral8 } from "apollo-react/colors";
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

import { moreColumnsWithFrozen } from "./columns.data";

import { ReactComponent as StaleIcon } from "../../../components/Icons/Stale.svg";
import { ReactComponent as IssueIcon } from "../../../components/Icons/Issue.svg";
import { ReactComponent as DatasetsIcon } from "../../../components/Icons/dataset.svg";
import { ReactComponent as FailureIcon } from "../../../components/Icons/failure.svg";

import "../Dashboard.scss";

import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../../components/Common/usePermission";

export default function MonitorTab({ fetchLatestData, protId }) {
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const [control, setSegmentControl] = useState("all");
  const [rows, setRowData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeOnly, setActiveOnly] = useState(true);
  const [columnsState, setColumns] = useState(moreColumnsWithFrozen);
  const [hasUpdated, setHasUpdated] = useState(false);
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
    protId
  );

  useEffect(() => {
    const summaryData = dashboard.ingestionData?.summary || {};
    const rowData = dashboard.ingestionData?.datasets || [];
    setTotalCount(dashboard.ingestionData?.totalSize || 0);
    setSummary({ ...summaryData });
    setRowData([...rowData]);
  }, [dashboard.ingestionData]);

  useEffect(() => {
    fetchLatestData(control, activeOnly);
  }, [activeOnly, control, protId]);

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
  const CustomHeader = ({ toggleFilters }) => (
    <div>
      <Switch
        label="Show active datasets"
        size="small"
        checked={activeOnly}
        labelPlacement="start"
        className="MuiSwitch"
        onChange={handleChange}
        style={{ marginRight: 21 }}
      />
      <Button
        id="downloadBtn"
        icon={<DownloadIcon />}
        size="small"
        style={{ marginRight: 16 }}
      >
        Download
      </Button>
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
      {dashboard.summaryLoading && <Loader />}
      <Hero>
        <div className="topContainer">
          <Typography
            variant="title1"
            style={{
              lineHeight: "32px",
              fontWeight: 600,
              display: "inline-flex",
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
              <SegmentedControl value="all">All</SegmentedControl>
              <SegmentedControl value="0">Production</SegmentedControl>
              <SegmentedControl value="1">Test</SegmentedControl>
            </SegmentedControlGroup>
          </div>
        </div>
        <div className="dashboardSummary">
          <div className="dashInfo">
            <div className="dashCounter">
              <FailureIcon
                className="conter-icon failureIcon"
                style={{ fill: "#000000" }}
              />
              <Typography variant="h1" darkMode id="failed_loads_count">
                {summary.failed_loads || 0}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Failed Loads
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Failed Loads",
                    "Files that did not load due to file/table issues"
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <StatusNegativeIcon className="conter-icon" />
              <Typography variant="h1" darkMode id="quarantined_files_count">
                {summary.quarantined_files || 0}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Quarantined Files
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Quarantined Files",
                    "Files being processed for value level conformance rules assigned the action of 'reject'."
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <SwapVertIcon className="conter-icon" />
              <Typography variant="h1" darkMode id="files_exceeding_count">
                {summary.files_exceeding || 0}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Files exceeding % change
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Files exceeding % change",
                    "Files in which the change in the number of records received exceeded the configured % row count decrease allowed"
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <IssueIcon className="conter-icon" style={{ fill: "#000000" }} />
              <Typography variant="h1" darkMode id="fileswith_issues_count">
                {summary.fileswith_issues || 0}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Files with Ingestion Issues
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Files with Ingestion Issues",
                    "Files that were successfully loaded, but validation issues were found"
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <StaleIcon className="conter-icon" />
              <Typography variant="h1" darkMode id="stale_datasets_count">
                {summary.stale_datasets || 0}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Stale Datasets
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Stale Datasets",
                    "Datasets for which a file has not been received within the specified number of days"
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <Peek
            open={open}
            followCursor
            placement="bottom"
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
          <Table
            key="studyDatasets"
            title="Study Datasets"
            subtitle={
              <div style={{ position: "relative" }}>
                <DatasetsIcon
                  style={{
                    position: "relative",
                    top: 2,
                    marginRight: 5,
                    width: "14px",
                    height: "14px",
                  }}
                />
                {`${totalCount} datasets`}
              </div>
            }
            columns={columnsState}
            rows={rows.map((row) => ({
              ...row,
              canReadIngestionIssues,
              history,
            }))}
            initialSortedColumn="datasetname"
            rowsPerPageOptions={[10, 50, 100, "All"]}
            tablePaginationProps={{
              labelDisplayedRows: ({ from, to, count }) =>
                `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
              truncate: true,
            }}
            CustomHeader={(props) => <CustomHeader {...props} />}
            columnSettings={{
              enabled: true,
              onChange: (columns) => {
                setHasUpdated(true);
                setColumns(columns);
              },
              defaultColumns: moreColumnsWithFrozen,
              frozenColumnsEnabled: true,
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
}
