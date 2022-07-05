/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-script-url */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";

import "../ingestionReport.scss";
import "./index.scss";
import Box from "apollo-react/components/Box";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography/Typography";
import Panel from "apollo-react/components/Panel/Panel";
import { ReactComponent as IssueIcon } from "../../../components/Icons/Issue.svg";
import Header from "../Header";

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
      title: "File Ingestion Issues",
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
        subTitle="tst_pharmacokinetic_tabular_labcorp_results_current"
        icon={<IssueIcon className="black-icon" />}
        saveBtnLabel="View summery"
        hideCancel
        tabs={["Data", "Properties"]}
        selectedTab={0}
        onTabChange={(v) => console.log("Hello", v)}
      />
      <section className="content-wrapper">
        <Panel
          onClose={(v) => console.log("Hello", v)}
          onOpen={(v) => console.log("Hello", v)}
          open={true}
          width={446}
        >
          <Typography>Filter</Typography>
        </Panel>
      </section>
    </main>
  );
};

export default IngestionIssues;
