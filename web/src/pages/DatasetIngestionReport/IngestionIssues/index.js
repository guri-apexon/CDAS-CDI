/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-script-url */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";

import "../ingestionReport.scss";
import Header from "../../../components/DataFlow/Header";
import { ReactComponent as IssueIcon } from "../../../components/Icons/datapackage.svg";

const IngestionIssues = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { datasetProperties } = useSelector((state) => state.ingestionReports);
  const [tabvalue, setTabValue] = useState(0);
  const [transferLogFilter, setTransferLogFilter] = useState("");
  const handleChangeTab = (event, value, filter = "") => {
    setTabValue(value);
    setTransferLogFilter(filter);
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
  const downloadSummery = () => {
    console.log("downloadSummery");
  };

  useEffect(() => {}, []);

  return (
    <main className="ingestion-issues">
      <Header
        close={() => history.push("/dashboard")}
        submit={downloadSummery}
        breadcrumbItems={breadcrumpItems}
        headerTitle="Header Issue title"
        icon={<IssueIcon />}
        saveBtnLabel="Download summery"
      />
      Hello Issues
    </main>
  );
};

export default IngestionIssues;
