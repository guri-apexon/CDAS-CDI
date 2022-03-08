/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-script-url */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
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
import { getDatasetProperties } from "../../store/actions/IngestionReportAction";
import { updateSelectedDataflow } from "../../store/actions/DashboardAction";

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
  const dispatch = useDispatch();
  const { datasetProperties, loading } = useSelector(
    (state) => state.ingestionReports
  );
  const [tabvalue, setTabValue] = useState(0);
  const handleChangeTab = (event, value) => {
    setTabValue(value);
  };
  const { datasetId } = useParams();

  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: "Study Ingestion Report",
    },
    {
      href: "javascript:void(0)",
      title: datasetProperties?.DatasetName ?? "",
    },
  ];

  const getProperties = () => {
    dispatch(getDatasetProperties(datasetId));
  };

  useEffect(() => {
    getProperties();
  }, []);

  useEffect(() => {
    if (datasetProperties) {
      dispatch(updateSelectedDataflow(datasetProperties?.dataflowid));
    }
  }, [datasetProperties]);

  return (
    <main className="ingestion-report">
      {loading && <Loader />}
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
          <Typography variant="body2" gutterBottom>
            {datasetProperties?.Vendor}
          </Typography>
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
        {tabvalue === 0 && <Metrics datasetProperties={datasetProperties} />}
        {tabvalue === 1 && (
          <TransferLog datasetProperties={datasetProperties} />
        )}
        {tabvalue === 2 && <Properties datasetProperties={datasetProperties} />}
      </div>
    </main>
  );
};

export default DatasetIngestionReport;
