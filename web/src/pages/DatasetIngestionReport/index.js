/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-script-url */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useHistory, useLocation } from "react-router-dom";
import Paper from "apollo-react/components/Paper";
import Loader from "apollo-react/components/Loader";
import Typography from "apollo-react/components/Typography";
import Box from "apollo-react/components/Box";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Divider from "apollo-react/components/Divider";
import Tag from "apollo-react/components/Tag";
import CheckIcon from "apollo-react-icons/Check";
import Tooltip from "apollo-react/components/Tooltip";
import ClockIcon from "apollo-react-icons/Clock";

import Metrics from "./metrics";
import TransferLog from "./transferLog";
import Properties from "./properties";
import { ReactComponent as DatasetsIcon } from "../../components/Icons/dataset.svg";
import { ReactComponent as StaleIcon } from "../../components/Icons/Stale.svg";
import { ReactComponent as FailureIcon } from "../../components/Icons/failure.svg";
import "./ingestionReport.scss";
import {
  getDatasetProperties,
  getDatasetIngestionIssueTypes,
} from "../../store/actions/IngestionReportAction";

const queryString = require("query-string");

const getDatasetStatus = (status) => {
  return (
    <div>
      {status?.toLowerCase() === "up-to-date" && (
        <div style={{ marginTop: "-2px" }}>
          <CheckIcon
            style={{
              position: "relative",
              top: 4,
              fontSize: 14,
              color: "#00C221",
              marginRight: 8,
            }}
          />
          {status}
        </div>
      )}
      {status?.toLowerCase() === "stale" && (
        <div style={{ marginTop: "-5px" }}>
          <Tag
            label={status}
            className="staleAlertStatus"
            style={{
              backgroundColor: "#e2000012",
              fontWeight: 600,
              color: "#E20000",
            }}
            Icon={StaleIcon}
          />
        </div>
      )}
      {status?.toLowerCase() === "failed" && (
        <div style={{ marginTop: "-5px" }}>
          <Tag
            label={status}
            className="failedStatus"
            style={{
              backgroundColor: "#e20000",
              fontWeight: 600,
              color: "#fff",
            }}
            Icon={FailureIcon}
          />
        </div>
      )}

      {status?.toLowerCase() === "inactive" && (
        <div style={{ marginTop: "-5px" }}>
          <Tag label={status} color="#B5B5B5" />
        </div>
      )}
      {(status?.toLowerCase() === "processing" ||
        status?.toLowerCase() === "queued" ||
        status?.toLowerCase() === "skipped") && (
        <div style={{ marginTop: "-3px" }}>
          <Tag label={status} className="queueStatus" />
        </div>
      )}
    </div>
  );
};

const DatasetIngestionReport = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const {
    datasetProperties,
    loading,
    issuetypeloading,
    historyloading,
    issuetypes,
  } = useSelector((state) => state.ingestionReports);
  const [tabvalue, setTabValue] = useState(0);
  const [transferLogFilter, setTransferLogFilter] = useState("");
  const handleChangeTab = (event, value, filter = "") => {
    setTabValue(value);
    setTransferLogFilter(filter);
  };
  const { datasetId } = useParams();
  const parsedQuery = queryString.parse(location.search);

  const checkCurrentLocation = () => {
    return location.pathname.includes("/cdihome/ingestion-report") || false;
  };

  const breadcrumpItems = [
    {
      href: "javascript:void(0)",
      onClick: () => {
        if (checkCurrentLocation()) {
          history.push("/cdihome");
        } else {
          history.push("/dashboard");
        }
      },
    },
    {
      href: "javascript:void(0)",
      title: "Study Ingestion Report",
      onClick: () => history.push("/dashboard"),
    },
    {
      href: "javascript:void(0)",
      title: datasetProperties?.DatasetName ?? "",
    },
  ];

  const getIngestionIssueTypes = () => {
    dispatch(getDatasetIngestionIssueTypes(datasetId));
  };

  const getProperties = () => {
    dispatch(getDatasetProperties(datasetId));
  };

  useEffect(() => {
    getProperties();
    getIngestionIssueTypes();
    if (Object.keys(parsedQuery)?.includes("logs")) {
      setTabValue(1);
    }
  }, []);

  return (
    <main className="ingestion-report">
      {(loading || issuetypeloading || historyloading) && <Loader />}
      <Paper className="no-shadow">
        <Box className="top-content">
          <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          <div className="flex header_title">
            <div className="flex left_title">
              <DatasetsIcon id="datasetRepicon" />
              <Typography className="b-font" id="ingestion-report-title">
                Dataset Ingestion Report
              </Typography>
            </div>
            <div className="flex right_title">
              <Tooltip title="Current Status of Dataset" placement="top">
                <span
                  className="datasetStatus"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {getDatasetStatus(datasetProperties?.DatasetStatus)}
                  <ClockIcon className="clockIcon" />
                </span>
              </Tooltip>
            </div>
          </div>
          <Typography variant="title1" gutterBottom>
            {datasetProperties?.DatasetName}
          </Typography>

          <Tooltip
            title={datasetProperties?.Vendor}
            placement="top"
            style={{ marginLeft: 0 }}
          >
            <span>{datasetProperties?.Vendor}</span>
          </Tooltip>
        </Box>
        <Divider />
        <Tabs
          id="ingestion-report-tab"
          value={tabvalue}
          style={{ marginLeft: 25 }}
          onChange={handleChangeTab}
        >
          <Tab id="report-metrics" label="Metrics" />
          <Tab id="report-transferlog" label="Transfer Log" />
          <Tab id="report-properties" label="Properties" />
        </Tabs>
      </Paper>
      <div style={{ paddingBottom: 24 }}>
        {tabvalue === 0 && (
          <Metrics
            datasetProperties={datasetProperties}
            issuetypes={issuetypes}
            handleChangeTab={(v) => handleChangeTab("", 1, v)}
          />
        )}
        {tabvalue === 1 && (
          <TransferLog
            datasetProperties={datasetProperties}
            transferLogFilter={transferLogFilter}
          />
        )}
        {tabvalue === 2 && <Properties datasetProperties={datasetProperties} />}
      </div>
    </main>
  );
};

export default DatasetIngestionReport;
