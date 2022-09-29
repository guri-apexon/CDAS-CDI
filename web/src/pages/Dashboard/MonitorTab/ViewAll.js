/* eslint-disable no-script-url */
import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

import Loader from "apollo-react/components/Loader";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Switch from "apollo-react/components/Switch";
import FilterIcon from "apollo-react-icons/Filter";
import DownloadIcon from "apollo-react-icons/Download";
import RefreshIcon from "apollo-react-icons/Refresh";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import SegmentedControl from "apollo-react/components/SegmentedControl";
import SegmentedControlGroup from "apollo-react/components/SegmentedControlGroup";

import DatasetTable from "./DatasetTable";
import {
  getDatasetIngestionOfStudy,
  updatePreviousStateActiveOnlyBtn,
  updatePreviousStateSegmentControlTab,
} from "../../../store/actions/DashboardAction";
import { queryParams, queryParamsFull } from "./helper";
import { getUserId } from "../../../utils/index";

const userId = getUserId();
const queryString = require("query-string");

const useStyles = makeStyles(() => ({
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginLeft: "8px",
    marginTop: "12px",
  },
  bold: {
    fontWeight: "600",
  },
  contentHeader: {
    padding: "16px 25px 0",
    backgroundColor: "#ffffff",
  },

  breadcrumbs: {
    marginBottom: 16,
    paddingLeft: 0,
    marginTop: 0,
  },
}));

const ViewAll = () => {
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.dashboard);
  const location = useLocation();

  const [rows, setRowData] = useState([]);
  const [activeOnly, setActiveOnly] = useState(
    dashboard.previousState.activeOnlyBtn
  );

  const parsedQuery = queryString.parse(location.search);

  const [control, setSegmentControl] = useState(
    parsedQuery[queryParams.CONTROL] || "all"
  );

  const [selectedFilter, setSelectedFilter] = useState(control);

  // Go through query params to get processStatus by ignoring control parameter
  const [processStatus] = useState(
    Object.keys(parsedQuery)?.filter(
      (item) => item !== queryParams.CONTROL
    )[0] || ""
  );

  const fetchLatestData = (c = "", active = 1) => {
    if (dashboard?.selectedCard?.prot_id) {
      dispatch(
        getDatasetIngestionOfStudy(
          dashboard.selectedCard.prot_id,
          c,
          active,
          userId,
          processStatus
        )
      );
    }
  };

  useEffect(() => {
    const rowData = dashboard.ingestionData?.datasets || [];
    const params = Object.keys(parsedQuery);
    const availableValues = Object.values(queryParams);
    const validParams = params.filter((q) => availableValues.includes(q));
    if (validParams.length) {
      const filteredRowData = rowData.filter((r) => {
        if (params.includes(queryParams.JOB_STATUS_IN_QUEUE)) {
          return r.jobstatus?.toLowerCase().trim() === "queued";
        }
        if (params.includes(queryParams.JOB_STATUS_FAILED)) {
          return r.jobstatus?.toLowerCase().trim() === "failed";
        }
        if (params.includes(queryParams.LATENCY_WARNING)) {
          return !!r.data_latency_warnings;
        }
        if (params.includes(queryParams.REFRESH_ALERTS)) {
          return !!r.data_refresh_alerts;
        }
        if (params.includes(queryParams.EXCEEDS_PER_CHANGE)) {
          return !!r.exceeds_pct_cng;
        }
        if (params.includes(queryParams.STALE)) {
          return r.jobstatus?.toLowerCase().trim() === "stale";
        }
        if (params.includes(queryParams.QUARANTINE)) {
          return !!r.quarantined_files;
        }
        return true;
      });
      setRowData([...filteredRowData]);
    } else {
      setRowData([...rowData]);
    }
  }, [dashboard.ingestionData]);

  useEffect(() => {
    fetchLatestData(control, activeOnly);
  }, [processStatus, activeOnly, control]);

  const goToDashboard = () => {
    history.push("/dashboard?monitor");
  };

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: goToDashboard },
    {
      href: "javascript:void(0)",
      title: "Dataset Pipeline Summary",
    },
  ];

  const handleChange = (e, checked) => {
    setActiveOnly(checked);

    // update active only value in store as well
    dispatch(updatePreviousStateActiveOnlyBtn(checked));
  };

  const CustomHeader = ({ toggleFilters }) => (
    <>
      <div>
        <SegmentedControlGroup
          value={selectedFilter}
          exclusive
          onChange={(event, value) => {
            setSelectedFilter(value);
            setSegmentControl(value);

            // update segment value in store as well
            dispatch(updatePreviousStateSegmentControlTab(value));
          }}
        >
          <SegmentedControl value="all">All</SegmentedControl>
          <SegmentedControl value="0">Production</SegmentedControl>
          <SegmentedControl value="1">Test</SegmentedControl>
        </SegmentedControlGroup>
      </div>
      <div>
        <Switch
          label="View only active datasets"
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
          style={{ marginRight: "10px" }}
        >
          Filter
        </Button>
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
    </>
  );

  return (
    <div>
      <div className={classes.contentHeader}>
        <BreadcrumbsUI
          className={classes.breadcrumbs}
          id="dataflow-breadcrumb"
          items={breadcrumbItems}
        />

        <Typography
          variant="title1"
          className={`${classes.title} ${classes.bold}`}
        >
          All Dataset Pipeline Summary
        </Typography>
        <Button
          onClick={goToDashboard}
          className="back-btn"
          icon={<ChevronLeft />}
          size="small"
        >
          Back to Production Monitor
        </Button>
      </div>
      <div style={{ padding: 20, position: "relative" }}>
        {dashboard.summaryLoading && <Loader />}
        <DatasetTable CustomHeader={CustomHeader} rows={rows} />
      </div>
    </div>
  );
};

export default ViewAll;
