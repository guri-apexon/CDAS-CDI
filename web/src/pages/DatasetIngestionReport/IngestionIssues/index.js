/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-script-url */
import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router";
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
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { downloadRows, exportToCSV } from "../../../utils/downloadData";

const IngestionIssues = () => {
  const toast = useContext(MessageContext);
  const history = useHistory();
  const location = useLocation();
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

  const checkCurrentLocation = () => {
    return location.pathname.includes("/cdihome/ingestion-issues") || false;
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
      title: "File Ingestion Issues",
    },
  ];

  const getTitle = () => {
    if (!datasetProperties?.dataflowid) return "------";
    return datasetProperties.loadType?.toLowerCase() === "increament"
      ? datasetProperties.DatasetName || "------"
      : datasetProperties.FileName || "------";
  };
  const [rowsPerPage, setRowPerPage] = useState(10);
  const [pageNo, setPageNo] = useState(0);
  const [sortedColumn, setSortedColumnValue] = useState("update_dt");
  const [sortedValue, setSortOrderValue] = useState("asc");
  const [inlineFilters, setInlineFilters] = useState([]);
  const downloadSummery = (e) => {
    const filteredColumns = [...columns].map((x) => {
      return x.header.props
        ? { ...x, header: x.header.props?.children[1] || "" }
        : x;
    });
    // console.log("filteredColumns", filteredColumns, tableRows);
    downloadRows({
      name: `Dataset-(${datasetId})-Ingestion-issue`,
      ext: "xlsx",
      columns: filteredColumns,
      pageNo,
      rowsPerPage,
      event: e,
      toast,
      rows: tableRows,
      inlineFilters,
      sortedColumn,
      sortedValue,
      showHidden: true,
    });
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
          <Button onClick={downloadSummery} icon={<Download />} size="small">
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
  // eslint-disable-next-line no-shadow
  const addDynamicCol = (data, selectedIssues, viewAll) => {
    const tableData = data ? data : tableRows;
    if (tableData?.length) {
      const issuesColumns = Object.keys(tableData[0]).filter(
        (x) => !["_rowno", "rowIndex"].includes(x)
      );
      const columnsArr = [...fixedColumns];
      // console.log("viewAll", viewAll, selectedIssues);
      if (selectedIssues?.length) {
        const allColumns = [
          ...new Set([
            ...issuesColumns,
            ...JSON.parse(selectedIssues[0].allcolumns),
          ]),
        ];

        (viewAllCol ? allColumns : issuesColumns).forEach((col) => {
          const colName = col?.toLowerCase();
          const haveIssue =
            !viewAllCol ||
            (viewAllCol &&
              selectedIssues[0].errorcolumnnames.includes(colName));
          const columnObj = {
            header: haveIssue ? (
              <>
                <IssueIcon className="black-icon table-th" />
                {colName}
              </>
            ) : (
              colName
            ),
            accessor: colName,
            filterFunction: createStringSearchFilter(colName),
            filterComponent: TextFieldFilter,
          };
          if (haveIssue) {
            columnObj.customCell = ({ row, column: { accessor: key } }) => {
              return <span>{row[key] || "----"}</span>; // className="issue-td" For Highlited
            };
          }
          if (colName === "_error") {
            columnObj.hidden = true;
          }
          columnsArr.push(columnObj);
        });
      }
      setColumns(columnsArr);
    }
  };
  const setDefaultColumns = () => {
    const columnsArr = [...fixedColumns];
    setColumns(columnsArr);
  };
  const refreshData = async (data) => {
    setRowDetails(null);
    setSelectedIssues(data);
    if (data?.length) {
      setTableloading(true);
      const { data: refreshedData, error } = await getIngestionIssueCols({
        selectedIssues: data,
        viewAll: viewAllCol,
      });
      if (error) {
        toast.showErrorMessage(error);
        setTableloading(false);
        return;
      }
      if (refreshedData) {
        // console.log("refreshedData", refreshedData, error);
        addDynamicCol(refreshedData, data);
        setTableRows(refreshedData.map((x, i) => ({ ...x, rowIndex: i })));
        setTableloading(false);
      }
    } else {
      setDefaultColumns();
      setTableRows([]);
      setTableloading(false);
      setViewAllCol(false);
    }
  };
  const getProperties = () => {
    dispatch(getDatasetProperties(datasetId));
  };
  useEffect(() => {
    // addDynamicCol(tableRows, selectedIssues, viewAllCol);
    refreshData(selectedIssues);
  }, [viewAllCol]);

  useEffect(() => {
    getProperties();
  }, []);
  return (
    <main className="ingestion-issues">
      <Header
        close={() => history.push("/dashboard")}
        submit={downloadSummery}
        breadcrumbItems={breadcrumpItems}
        headerTitle="Ingestion Issue Report"
        subTitle={getTitle()}
        icon={<IssueIcon className="black-icon" />}
        saveBtnLabel="View summary"
        hideBtns
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
              // eslint-disable-next-line no-nested-ternary
              width: rowDetails
                ? "calc(100% - 634px)"
                : leftPanelCollapsed
                ? "100%"
                : "calc(100% - 346px)",
            }}
          >
            <Table
              isLoading={tableLoading}
              title="Ingestion Issues"
              subtitle={`${tableRows.length} records with issues`}
              columns={columns}
              rows={tableRows}
              rowId="rowIndex"
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
              onChange={(rpp, sc, so, filts, page) => {
                setRowPerPage(rpp);
                setSortedColumnValue(sc);
                setSortOrderValue(so);
                setInlineFilters(filts);
                setPageNo(page);
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
      {currentTab === 1 && (
        <IssuesProperties datasetProperties={datasetProperties} />
      )}
    </main>
  );
};

export default IngestionIssues;
