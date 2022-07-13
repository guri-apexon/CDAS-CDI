/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
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
import { IntegerFilter, TextFieldFilter } from "../../../utils";
import IssuesProperties from "./Properties";
import IssueRightPanel from "./RightSidebar";
import {
  getIngestionIssueCols,
  getIngestionIssues,
} from "../../../services/ApiServices";
import { getDatasetProperties } from "../../../store/actions/IngestionReportAction";

const IngestionIssues = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { datasetProperties } = useSelector((state) => state.ingestionReports);
  const [tableRows, setTableRows] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [viewAllCol, setViewAllCol] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rowDetails, setRowDetails] = useState(null);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [tableLoading, setTableloading] = useState(false);
  const { datasetId } = useParams();

  const rowNoCell = ({ row, column: { accessor: key } }) => {
    return (
      <Link className="rightpanel-link" onClick={(e) => openRightPanel(row)}>
        {row[key]}
      </Link>
    );
  };
  const fixedColumns = [
    {
      header: "Record #",
      accessor: "_rowno",
      sortFunction: compareNumbers,
      filterFunction: numberSearchFilter("_rowno"),
      filterComponent: IntegerFilter,
      customCell: rowNoCell,
    },
  ];
  const [columns, setColumns] = useState(fixedColumns);

  const openRightPanel = (row) => {
    const rowId = row._rowno;
    setRowDetails(row);
  };

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
  const addDynamicCol = (cols) => {
    const columnsArr = [...fixedColumns];
    cols.forEach((col) => {
      const columnObj = {
        header: (
          <>
            <IssueIcon className="black-icon table-th" />
            {col}
          </>
        ),
        accessor: col,
        filterFunction: createStringSearchFilter(col),
        filterComponent: TextFieldFilter,
      };
      columnsArr.push(columnObj);
    });
    setColumns(columnsArr);
  };
  const refreshData = async (data) => {
    console.log("refreshData", data);
    setSelectedIssues(data);
    if (data?.length) {
      setTableloading(true);
      const refreshedData = await getIngestionIssueCols({
        selectedIssues: data,
      });
      const issuesColumns = Object.keys(refreshedData[0]).filter(
        (x) => x !== "_rowno"
      );
      addDynamicCol(issuesColumns);
      setTableRows(refreshedData);
      setTableloading(false);
    }
  };
  const getProperties = () => {
    dispatch(getDatasetProperties(datasetId));
  };

  useEffect(() => {
    getProperties();
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
            datasetId={datasetId}
            width={346}
            closePanel={() => setLeftPanelCollapsed(true)}
            openPanel={() => setLeftPanelCollapsed(false)}
            setSelectedIssues={(data) => refreshData(data)}
          />
          <div
            id="mainTable"
            style={{
              width: rowDetails ? "calc(100% - 634px)" : "100%",
            }}
          >
            <Table
              isLoading={tableLoading}
              title="Ingestion Issues"
              subtitle={`${tableRows.length} records with issues`}
              columns={columns}
              rows={tableRows}
              rowId="_rowno"
              initialSortedColumn="_rowno"
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
          {rowDetails && (
            <Panel
              id="rightSidebar"
              side="right"
              width={288}
              hideButton
              open={true}
              onOpen={() => {
                console.log("Opened");
              }}
            >
              <IssueRightPanel
                rowDetails={rowDetails}
                selectedIssues={selectedIssues}
                closePanel={() => {
                  setRowDetails(null);
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
