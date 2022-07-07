/* eslint-disable jsx-a11y/anchor-is-valid */
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
import Link from "apollo-react/components/Link/Link";
import Typography from "apollo-react/components/Typography/Typography";
import Panel from "apollo-react/components/Panel/Panel";
import Blade from "apollo-react/components/Blade";
import Download from "apollo-react-icons/Download";
import Table from "apollo-react/components/Table/Table";
import FilterIcon from "apollo-react-icons/Filter";
import Switch from "apollo-react/components/Switch/Switch";
import Button from "apollo-react/components/Button/Button";
import {
  compareNumbers,
  compareStrings,
  createStringSearchFilter,
  numberSearchFilter,
} from "apollo-react/components/Table";
import { ReactComponent as IssueIcon } from "../../../components/Icons/Issue.svg";
import Header from "../Header";
import IssueLeftPanel from "./LeftSidebar";
import { TextFieldFilter } from "../../../utils";
import IssuesProperties from "./Properties";
import IssueRightPanel from "./RightSidebar";
import {
  getIngestionIssueCols,
  getIngestionIssues,
} from "../../../services/ApiServices";

const rows = [
  {
    record_no: "1",
    sub_id: "1221321",
  },
  {
    record_no: "2",
    sub_id: "3213232",
  },
  {
    record_no: "3",
    sub_id: "4343",
  },
  {
    record_no: "4",
    sub_id: "443243",
  },
];

const IngestionIssues = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { datasetProperties } = useSelector((state) => state.ingestionReports);
  const [tableRows, setTableRows] = useState(rows);
  const [currentTab, setCurrentTab] = useState(0);
  const [viewAllCol, setViewAllCol] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [issuesArr, setIssuesArr] = useState([]);
  const { datasetId } = useParams();

  const openRightPanel = (row) => {
    console.log("openRightPanel", row);
    setShowRightPanel(true);
  };

  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: "File Ingestion Issues",
    },
  ];

  const columns = [
    {
      header: "Record #",
      accessor: "record_no",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("record_no"),
      filterComponent: TextFieldFilter,
      customCell: ({ row, column: { accessor: key } }) => {
        return (
          <Link className="rightpanel-link" onClick={() => openRightPanel(row)}>
            {row[key]}
          </Link>
        );
      },
    },
    {
      header: (
        <>
          <IssueIcon className="black-icon table-th" />
          sub_id
        </>
      ),
      accessor: "sub_id",
      filterFunction: createStringSearchFilter("sub_id"),
      filterComponent: TextFieldFilter,
    },
  ];
  const downloadSummery = () => {
    console.log("downloadSummery");
  };

  const CustomButtonHeader = ({ toggleFilters }) => {
    return (
      <>
        <div>
          <Switch
            className="inline-checkbox"
            label="View all columns"
            checked={viewAllCol}
            onChange={(e, v) => setViewAllCol(v)}
            size="small"
          />
          <span className="v-line">&nbsp;</span>
          <Button icon={<Download />} size="small">
            Download
          </Button>
          &nbsp;&nbsp;
          <Button
            size="small"
            variant="secondary"
            icon={FilterIcon}
            onClick={toggleFilters}
          >
            Filter
          </Button>
        </div>
      </>
    );
  };
  const fetchIssues = async () => {
    console.log("Mount Issue", datasetId);
    const issuesRes = await getIngestionIssues(datasetId);
    if (issuesRes) setIssuesArr(issuesRes);
    console.log("Response::", issuesRes);
  };
  const refreshData = async (data) => {
    const filteredIssue = issuesArr.filter((x) => data.includes(x.issue_type));
    if (filteredIssue?.length) {
      const refreshedData = await getIngestionIssueCols({
        selectedIssues: filteredIssue,
      });
      console.log("refreshedData", refreshedData);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

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
        onTabChange={(v) => setCurrentTab(v)}
      />
      {currentTab === 0 && (
        <section className="content-wrapper flex">
          <IssueLeftPanel
            width={346}
            closePanel={() => setLeftPanelCollapsed(true)}
            openPanel={() => setLeftPanelCollapsed(false)}
            listArr={issuesArr}
            setSelectedIssues={(data) => refreshData(data)}
          />
          <div
            id="mainTable"
            style={{
              width: leftPanelCollapsed ? "100%" : "calc(100% - 346px)",
            }}
          >
            <Table
              title="Ingestion Issues"
              subtitle="20 records with issues"
              columns={columns}
              rows={tableRows}
              rowId="record_no"
              initialSortedColumn="record_no"
              initialSortOrder="asc"
              rowsPerPageOptions={[5, 10, 15, "All"]}
              tablePaginationProps={{
                labelDisplayedRows: ({ from, to, count }) =>
                  `${
                    count === 1 ? "Issue" : "Issues"
                  } ${from}-${to} of ${count}`,
                truncate: true,
              }}
              CustomHeader={(props) => <CustomButtonHeader {...props} />}
            />
          </div>
          {showRightPanel && (
            <Panel
              id="rightSidebar"
              side="right"
              hideButton
              open={true}
              onOpen={() => {
                console.log("Opened");
              }}
            >
              <IssueRightPanel
                closePanel={() => {
                  setShowRightPanel(false);
                }}
              />
            </Panel>
          )}
        </section>
      )}
      {currentTab === 1 && <IssuesProperties />}
    </main>
  );
};

export default IngestionIssues;
