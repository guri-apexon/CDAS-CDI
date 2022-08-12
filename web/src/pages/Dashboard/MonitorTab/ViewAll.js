/* eslint-disable no-script-url */
/* eslint-disable react/jsx-wrap-multilines */
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
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import SelectButton from "apollo-react/components/SelectButton";
import MenuItem from "apollo-react/components/MenuItem";
import Modal from "apollo-react/components/Modal";
import TextField from "apollo-react/components/TextField";

import DatasetTable from "./DatasetTable";
import { getDatasetIngestionOfStudy } from "../../../store/actions/DashboardAction";
import { queryParams } from "./helper";

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
  const [activeOnly, setActiveOnly] = useState(true);

  const parsedQuery = queryString.parse(location.search);
  const [selectedMenuText, setSelectedMenuText] =
    useState("Within past 3 days");

  const [control, setSegmentControl] = useState(
    parsedQuery[queryParams.CONTROL] || "all"
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [viewAll, setIsViewAll] = useState(false);
  const [customValue, setCustomValue] = useState(null);
  const [errorInput, setErrorInput] = useState(false);

  const changeCustomDays = (val) => {
    if (val < 1 || val > 120) {
      setErrorInput(true);
      return false;
    }
    setCustomValue(val);
    setErrorInput(false);
    return null;
  };

  const fetchLatestData = (c = "", active = 1) => {
    if (dashboard?.selectedCard?.prot_id) {
      dispatch(
        getDatasetIngestionOfStudy(dashboard.selectedCard.prot_id, c, active)
      );
    }
  };

  useEffect(() => {
    console.log(history, "history");
    if (history.location?.state?.from === "dashboard") {
      setIsViewAll(true);
    }
  }, [history]);

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
  }, [activeOnly, control]);

  const goToDashboard = () => {
    history.push("/dashboard?monitor");
  };

  const goToCDIHome = () => {
    history.push("/cdihome");
  };

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: goToDashboard },
    {
      href: "javascript:void(0)",
      title: "Dataset Pipeline Summary",
    },
  ];

  // const getFileHistoryData = (days = "") => {
  //   const date = moment().utc().format("YYYY-MM-DD");
  //   dispatch(getDatasetIngestionTransferLog(datasetId, days, date));
  //   setMenuOpen(false);

  const getFileHistoryData = (days = "") => {
    // const date = moment().utc().format("YYYY-MM-DD");
    // dispatch(getDatasetIngestionTransferLog(datasetId, days, date));
    setMenuOpen(false);
  };

  const selectChangeView = (val) => {
    if (val === "custom") {
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
      // getFileHistoryData(val);
      setSelectedMenuText(`Within past ${val} days`);
    }
  };

  const handleChange = (e, checked) => {
    setActiveOnly(checked);
  };

  const CustomHeader = ({ toggleFilters }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {viewAll && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" style={{ fontSize: 14, marginRight: 10 }}>
            Change View:
          </Typography>
          <SelectButton
            size="small"
            placeholder="Within past 10 days"
            style={{ marginRight: 10 }}
            onChange={selectChangeView}
            displayText={selectedMenuText}
            noDeselect
          >
            <MenuItem value="3">Within past 3 days</MenuItem>
            <MenuItem value="7">Within past 7 days</MenuItem>
            <MenuItem value="10">Within past 10 days</MenuItem>
            <MenuItem value="30">Within past 30 days</MenuItem>
            <MenuItem value="custom">Custom date range</MenuItem>
          </SelectButton>
        </div>
      )}
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
        {!viewAll && (
          <Button
            id="downloadBtn"
            icon={<DownloadIcon />}
            size="small"
            style={{ marginRight: 16 }}
          >
            Download
          </Button>
        )}
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
    </div>
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
        {!viewAll ? (
          <Button
            onClick={goToDashboard}
            className="back-btn"
            icon={<ChevronLeft />}
            size="small"
          >
            Back to Production Monitor
          </Button>
        ) : (
          <Button
            onClick={goToCDIHome}
            className="back-btn"
            icon={<ChevronLeft />}
            size="small"
          >
            Back to CDIhome
          </Button>
        )}
        <Modal
          open={menuOpen}
          onClose={() => {
            setMenuOpen(false);
            setCustomValue(null);
            setSelectedMenuText(selectedMenuText);
            setErrorInput(false);
          }}
          title="Choose Custom Days"
          message={
            <TextField
              type="number"
              label="Choose upto past 120 days"
              value={customValue}
              inputProps={{ min: 1, max: 120, pattern: "[0-9]" }}
              onChange={(e) => changeCustomDays(e.target.value)}
              helperText={errorInput ? "Select valid input" : null}
              error={errorInput}
            />
          }
          buttonProps={[
            {
              label: "Ok",
              disabled: errorInput || !customValue,
              onClick: () => {
                getFileHistoryData(customValue);
                setSelectedMenuText(`Within past ${customValue} days`);
              },
            },
          ]}
        />
      </div>
      <div style={{ padding: 20, position: "relative" }}>
        {dashboard.summaryLoading && <Loader />}
        <DatasetTable CustomHeader={CustomHeader} rows={rows} />
      </div>
    </div>
  );
};
export default ViewAll;
