/* eslint-disable no-script-url */
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import Box from "apollo-react/components/Box";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Status from "apollo-react/components/Status";
import Divider from "apollo-react/components/Divider";

import CheckIcon from "apollo-react-icons/Check";
import ClockIcon from "apollo-react-icons/Clock";

import Metrics from "./metrics";
import TransferLog from "./transferLog";
import Properties from "./properties";
import { ReactComponent as DatasetsIcon } from "../../components/Icons/dataset.svg";
import "./ingestionReport.scss";

const DatasetIngestionReport = () => {
  const history = useHistory();
  const [tabvalue, setTabValue] = useState(0);
  const handleChangeTab = (event, value) => {
    setTabValue(value);
  };
  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: "Study Ingestion Report",
    },
    {
      href: "javascript:void(0)",
      title: "Dataset Name",
    },
  ];
  return (
    <main className="ingestion-report">
      <Paper className="no-shadow">
        <Box className="top-content">
          <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
          <div className="flex header_title">
            <div className="flex left_title">
              <DatasetsIcon id="datasetRepicon" />
              <Typography className="b-font">
                Dataset Ingestion Report
              </Typography>
            </div>
            <div className="flex right_title">
              <Status
                variant="positive"
                className="datasetSts"
                label="Up-to-date"
                icon={CheckIcon}
              />
              <ClockIcon className="clockIcon" />
            </div>
          </div>
          <Typography variant="title1" gutterBottom>
            DatasetName
          </Typography>
          <Typography variant="body2" gutterBottom>
            Vendor name
          </Typography>
        </Box>
        <Divider />
        <Tabs
          value={tabvalue}
          style={{ marginLeft: 25 }}
          onChange={handleChangeTab}
        >
          <Tab label="Metrics" />
          <Tab label="Transfer Log" />
          <Tab label="Properties" />
        </Tabs>
      </Paper>
      <div style={{ padding: 24 }}>
        {tabvalue === 0 && <Metrics />}
        {tabvalue === 1 && <TransferLog />}
        {tabvalue === 2 && <Properties />}
      </div>
    </main>
  );
};

export default DatasetIngestionReport;
