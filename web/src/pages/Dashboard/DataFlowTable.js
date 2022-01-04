import React, { useState, useContext, useEffect } from "react";
import moment from "moment";
// import * as XLSX from "xlsx";
// import { pick } from "lodash";
import { useHistory } from "react-router-dom";

import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  dateFilterV2,
  numberSearchFilter,
  compareDates,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import { neutral7, neutral8 } from "apollo-react/colors";
import Typography from "apollo-react/components/Typography";
import Button from "apollo-react/components/Button";
import SegmentedControl from "apollo-react/components/SegmentedControl";
import SegmentedControlGroup from "apollo-react/components/SegmentedControlGroup";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import DateRangePickerV2 from "apollo-react/components/DateRangePickerV2";
import Tooltip from "apollo-react/components/Tooltip";
import FilterIcon from "apollo-react-icons/Filter";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import Link from "apollo-react/components/Link";
import IconButton from "apollo-react/components/IconButton";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import ChevronDown from "apollo-react-icons/ChevronDown";
import ChevronRight from "apollo-react-icons/ChevronRight";
import { TextField } from "apollo-react/components/TextField/TextField";
import PlusIcon from "apollo-react-icons/Plus";
import Progress from "../../components/Progress";
import { MessageContext } from "../../components/MessageProvider";
import { ReactComponent as DataFlowIcon } from "./dataflow.svg";
import { ReactComponent as SyncIcon } from "./sync.svg";

const createAutocompleteFilter =
  (source) =>
  ({ accessor, filters, updateFilterValue }) => {
    const ref = React.useRef();
    const [height, setHeight] = React.useState(0);
    const [isFocused, setIsFocused] = React.useState(false);
    const value = filters[accessor];

    React.useEffect(() => {
      const curHeight = ref?.current?.getBoundingClientRect().height;
      if (curHeight !== height) {
        setHeight(curHeight);
      }
    }, [value, isFocused, height]);

    return (
      <div
        style={{
          minWidth: 160,
          maxWidth: 200,
          position: "relative",
          height,
        }}
      >
        <AutocompleteV2
          style={{ position: "absolute", left: 0, right: 0 }}
          value={
            value
              ? value.map((label) => {
                  if (label === "") {
                    return { label: "blanks" };
                  }
                  return { label };
                })
              : []
          }
          name={accessor}
          source={source}
          onChange={(event, value2) => {
            updateFilterValue({
              target: {
                name: accessor,
                value: value2.map(({ label }) => {
                  if (label === "blanks") {
                    return "";
                  }
                  return label;
                }),
              },
            });
          }}
          fullWidth
          multiple
          chipColor="white"
          size="small"
          forcePopupIcon
          showCheckboxes
          limitChips={1}
          filterSelectedOptions={false}
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          matchFrom="any"
          showSelectAll
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={ref}
          noOptionsText="No matches"
        />
      </div>
    );
  };

const TextFieldFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      fullWidth
      margin="none"
      size="small"
    />
  );
};

const IntegerFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      type="number"
      style={{ width: 74 }}
      margin="none"
      size="small"
    />
  );
};

const DateFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <div style={{ minWidth: 230 }}>
      <div style={{ position: "absolute", top: 0, paddingRight: 4 }}>
        <DateRangePickerV2
          value={filters[accessor] || [null, null]}
          name={accessor}
          onChange={(value) =>
            updateFilterValue({
              target: { name: accessor, value },
            })
          }
          startLabel=""
          endLabel=""
          placeholder=""
          fullWidth
          margin="none"
          size="small"
        />
      </div>
    </div>
  );
};

const createStringArraySearchFilter = (accessor) => {
  return (row, filters) =>
    !Array.isArray(filters[accessor]) ||
    filters[accessor].length === 0 ||
    filters[accessor].some(
      (value) => value.toUpperCase() === row[accessor]?.toUpperCase()
    );
};

export default function DataFlowTable() {
  const [loading, setLoading] = useState(false);
  const [rowsPerPageRecord, setRowPerPageRecord] = useState(10);
  const [pageNo, setPageNo] = useState(0);
  const [sortedColumnValue, setSortedColumnValue] = useState("dateCreated");
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [sortOrderValue, setSortOrderValue] = useState("desc");
  const [inlineFilters, setInlineFilters] = useState([]);
  const messageContext = useContext(MessageContext);
  const [totalRows, setTotalRows] = useState(0);
  const history = useHistory();

  const [expandedRows, setExpandedRows] = useState([]);

  const handleToggleRow = (dataFlowId) => {
    // eslint-disable-next-line no-shadow
    setExpandedRows((expandedRows) =>
      expandedRows.includes(dataFlowId)
        ? expandedRows.filter((id) => id !== dataFlowId)
        : [...expandedRows, dataFlowId]
    );
  };

  const studyData = {
    studyboardData: [
      {
        studyId: "a020E000005SwPtQAK",
        dataFlowId: "a0A0E000004k79SUAQ",
        dataSets: "6",
        dataPackages: "2",
        studyName: "P16-836",
        dataFlowName: "IQVIA-TDSE-reference_uatk3",
        type: 0,
        dateCreated: "12/21/2021",
        vendorSource: "IQVIA Connected Devices",
        description: "IQVIA TDSE reference uatk3",
        adapter: "Tabular",
        status: 1,
        externalSourceSystem: "",
        locationType: "SFTP",
        lastModified: "12/21/2021",
        lastSyncDate: "12/10/2021",
      },
      {
        studyId: "a020E000005SwPtQAK",
        dataFlowId: "a0A0E000004k79SUAQ",
        dataSets: "1",
        dataPackages: "2",
        studyName: "P16-836",
        dataFlowName: "IQVIA-TDSE-reference_uatk3",
        type: 0,
        dateCreated: "12/21/2021",
        vendorSource: "IQVIA Connected Devices",
        description: "IQVIA TDSE reference uatk3",
        adapter: "Tabular",
        status: 1,
        externalSourceSystem: "",
        locationType: "SFTP",
        lastModified: "12/21/2021",
        lastSyncDate: "12/10/2021",
      },
      {
        studyId: "a020E000005SwPtQAK",
        dataFlowId: "a0A0E000004k7m3UAA",
        dataSets: "1",
        dataPackages: "1",
        studyName: "P16-836",
        dataFlowName: "IQVIA-TDSE-milestone_attrib_uatk3",
        type: 0,
        dateCreated: "12/21/2021",
        vendorSource: "IQVIA Connected Devices",
        description: "IQVIA TDSE milestone attrib uatk3",
        adapter: "Tabular",
        status: 1,
        externalSourceSystem: "",
        locationType: "SFTP",
        lastModified: "12/21/2021",
        lastSyncDate: "12/10/2021",
      },
      {
        studyId: "a020E000005SwPtQAK",
        dataFlowId: "a0A0E00000322XRUAY",
        dataSets: "6",
        dataPackages: "1",
        studyName: "P16-836",
        dataFlowName: "TARGETHEALTH-000108-Ferring-1",
        type: 0,
        dateCreated: "12/21/2021",
        vendorSource: "IQVIA-CBEX",
        description: "TARGETHEALTH 000108 Ferring 1",
        adapter: "Tabular",
        status: 1,
        externalSourceSystem: "",
        locationType: "SFTP",
        lastModified: "12/21/2021",
        lastSyncDate: "12/10/2021",
      },
    ],
  };

  const studyboardData = selectedFilter
    ? studyData?.studyboardData.filter(
        (data) => data.description === selectedFilter
      )
    : studyData.studyboardData;

  const obs = ["Failed", "Success", "In Progress"];

  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Link onClick={() => console.log(`link clicked ${rowValue}`)}>
        {rowValue}
      </Link>
    );
  };

  const DateCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    const date =
      rowValue && moment(rowValue, "DD-MMM-YYYY").isValid()
        ? moment(rowValue).format("DD-MMM-YYYY")
        : moment(rowValue).format("DD-MMM-YYYY");

    return <span>{date}</span>;
  };

  const syncAction = (e) => {
    console.log("syncAction", e);
  };

  const hardDeleteAction = (e) => {
    console.log("hardDeleteAction", e);
  };

  const viewAuditLogAction = (e) => {
    console.log("viewAuditLogAction", e);
  };

  const cloneDataFlowAction = (e) => {
    console.log("cloneDataFlowAction", e);
  };
  const changeStatusAction = (e) => {
    console.log("changeStatusAction", e);
  };

  const ActionCell = ({ row }) => {
    const { dataFlowId } = row;
    const menuItems = [
      {
        text: "View autid log",
        onClick: () => viewAuditLogAction(dataFlowId),
      },
      {
        text: "Change status to inactive",
        onClick: () => changeStatusAction(dataFlowId),
      },
      {
        text: "Clone data flow",
        onClick: () => cloneDataFlowAction(dataFlowId),
      },
      {
        text: "Hard delete data flow",
        onClick: () => hardDeleteAction(dataFlowId),
      },
    ];
    return (
      <div style={{ display: "flex", justifyContent: "end" }}>
        <IconButton onClick={() => syncAction(dataFlowId)} size="small">
          <SyncIcon />
        </IconButton>
        <Tooltip title="Actions" disableFocusListener>
          <IconMenuButton id="actions" menuItems={menuItems} size="small">
            <EllipsisVertical />
          </IconMenuButton>
        </Tooltip>
      </div>
    );
  };

  const ExpandCell = ({ row: { dataFlowId, expanded } }) => {
    const iconButton = (
      <IconButton
        id="expand"
        size="small"
        onClick={() => console.log(dataFlowId)}
      >
        {expanded ? <ChevronDown /> : <ChevronRight />}
      </IconButton>
    );

    return (
      <div
        style={{
          width: 12,
          marginTop: 0,
          marginLeft: 0,
        }}
      >
        <Tooltip title={expanded ? "Collapse" : "Expand"} disableFocusListener>
          {iconButton}
        </Tooltip>
      </div>
    );
  };

  const DetailRow = ({ row }) => {
    return (
      <div style={{ display: "flex", padding: "8px 0px 8px 8px" }}>
        <div style={{ width: 280 }}>
          <Typography style={{ color: neutral7 }} variant="body2">
            Data Flow Name
          </Typography>
          <Typography style={{ fontWeight: 500, color: neutral8 }}>
            {row.dataFlowId}
          </Typography>
        </div>
        <div style={{ marginLeft: 32 }}>
          <Typography style={{ color: neutral7 }} variant="body2">
            # Data Packages
          </Typography>
          <Typography style={{ fontWeight: 500, color: neutral8 }}>
            {row.dataFlowId}
          </Typography>
        </div>
        <div style={{ marginLeft: 32 }}>
          <Typography style={{ color: neutral7 }} variant="body2">
            Adapter
          </Typography>
          <Typography style={{ fontWeight: 500, color: neutral8 }}>
            {row.dataFlowId}
          </Typography>
        </div>
        <div style={{ marginLeft: 32 }}>
          <Typography style={{ color: neutral7 }} variant="body2">
            Date Created
          </Typography>
          <Typography style={{ fontWeight: 500, color: neutral8 }}>
            {row.dataFlowId}
          </Typography>
        </div>
      </div>
    );
  };

  const SelectiveCell = ({ row, column: { accessor } }) => {
    const description = row[accessor];
    // const Img = obIcons[description] || "noIcon";
    // if (Img === "noIcon") {
    //   return (
    //     <div style={{ position: "relative", marginLeft: 25 }}>
    //       {description}
    //     </div>
    //   );
    // }
    return <div style={{ position: "relative" }}>{description}</div>;
  };

  const CustomButtonHeader = ({ toggleFilters }) => (
    <>
      <div>
        <SegmentedControlGroup
          value={selectedFilter}
          exclusive
          onChange={(event, value) => setSelectedFilter(value)}
        >
          <SegmentedControl value="all">All</SegmentedControl>
          <SegmentedControl disabled={!(totalRows >= 1)} value="production">
            Production
          </SegmentedControl>
          <SegmentedControl disabled={!(totalRows >= 1)} value="test">
            Test
          </SegmentedControl>
        </SegmentedControlGroup>
      </div>
      <div>
        <Button
          size="small"
          variant="secondary"
          icon={PlusIcon}
          onClick={() => history.push("/dataflow-management")}
          style={{ marginRight: "8px", border: "none", boxShadow: "none" }}
        >
          Add data flow
        </Button>
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

  const columns = [
    {
      accessor: "expand",
      customCell: ExpandCell,
    },
    {
      header: "Vendor Source",
      accessor: "vendorSource",
      frozen: true,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("vendorSource"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.vendorSource }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Description",
      accessor: "description",
      frozen: true,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("description"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.description }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Type",
      accessor: "type",
      frozen: true,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("type"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.type }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Status",
      accessor: "status",
      frozen: true,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("status"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.status }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "External Source System",
      accessor: "externalSourceSystem",
      frozen: false,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("externalSourceSystem"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.externalSourceSystem }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Location Type",
      accessor: "locationType",
      frozen: false,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("locationType"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.locationType }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Datasets",
      accessor: "dataSets",
      frozen: false,
      sortFunction: compareNumbers,
      customCell: LinkCell,
      filterFunction: numberSearchFilter("dataSets"),
      filterComponent: IntegerFilter,
    },
    {
      header: "Last Modified",
      accessor: "lastModified",
      frozen: false,
      sortFunction: compareDates,
      customCell: DateCell,
      filterFunction: dateFilterV2("lastModified"),
      filterComponent: DateFilter,
    },

    {
      accessor: "action",
      customCell: ActionCell,
      width: 32,
    },
  ];

  const columnsToAdd = [
    {
      header: "Data Flow Name",
      accessor: "dataFlowName",
      frozen: false,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("dataFlowName"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.dataFlowName }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Date Created",
      accessor: "dateCreated",
      frozen: false,
      sortFunction: compareDates,
      customCell: DateCell,
      filterFunction: dateFilterV2("dateCreated"),
      filterComponent: DateFilter,
    },
    {
      header: "Data Packages",
      accessor: "dataPackages",
      frozen: false,
      sortFunction: compareNumbers,
      customCell: LinkCell,
      filterFunction: numberSearchFilter("dataPackages"),
      filterComponent: IntegerFilter,
    },
    {
      header: "Last Sync Date",
      accessor: "lastSyncDate",
      frozen: false,
      sortFunction: compareDates,
      customCell: DateCell,
      filterFunction: dateFilterV2("lastSyncDate"),
      filterComponent: DateFilter,
    },
    {
      header: "Adapter",
      accessor: "adapter",
      frozen: false,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("adapter"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            studyboardData
              .map((r) => ({ label: r.adapter }))
              .map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
  ];

  const moreColumns = [
    ...columns.map((column) => ({ ...column })).slice(0, -1),
    ...columnsToAdd.map((column) => ({ ...column, hidden: true })),
    columns.slice(-1)[0],
  ];

  const [tableRows, setTableRows] = useState([...studyboardData]);
  const [tableColumns, setTableColumns] = useState([...moreColumns]);

  // const handleToggleRow = (dataFlowId) => {
  //   // eslint-disable-next-line no-shadow
  //   setExpandedRows((expandedRows) =>
  //     expandedRows.includes(dataFlowId)
  //       ? expandedRows.filter((id) => id !== dataFlowId)
  //       : [...expandedRows, dataFlowId]
  //   );
  // };

  // useEffect(() => {
  //   if (!studyData.loading || studyData.studyboardFetchSuccess) {
  //     setLoading(false);
  //     setTableRows([...studyboardData]);
  //     setExportTableRows([...studyboardData]);
  //     setTableColumns([...moreColumns]);
  //   } else {
  //     setLoading(true);
  //   }
  // }, [studyData.loading, studyboardData, studyData.studyboardFetchSuccess]);

  const applyFilter = (cols, rows, filts) => {
    let filteredRows = rows;
    Object.values(cols).forEach((column) => {
      if (column.filterFunction) {
        filteredRows = filteredRows.filter((row) => {
          return column.filterFunction(row, filts);
        });
        if (column.sortFunction) {
          filteredRows.sort(
            column.sortFunction(sortedColumnValue, sortOrderValue)
          );
        }
      }
    });
    return filteredRows;
  };

  const exportDataRows = () => {
    const toBeExportRows = [...studyboardData];
    const sortedFilteredData = applyFilter(
      tableColumns,
      toBeExportRows,
      inlineFilters
    );
    return sortedFilteredData;
  };

  const downloadFile = async () => {
    history.push("/dataflow-management");
  };

  useEffect(() => {
    const rows = exportDataRows();
    setTableRows([...rows]);
  }, [inlineFilters, sortedColumnValue, sortOrderValue]);

  useEffect(() => {
    setTableColumns([...moreColumns]);
    setTableRows([...studyboardData]);
    setTotalRows(studyboardData.length);
  }, []);

  const EmptyTableComponent = () => (
    <>
      <DataFlowIcon
        style={{ color: neutral7, marginBottom: 4, height: 60, width: 60 }}
      />
      <Typography
        variant="title1"
        style={{ color: neutral7, lineHeight: "32px", marginBottom: 14 }}
      >
        No Data Flows
      </Typography>
      <Button
        variant="secondary"
        icon={<PlusIcon />}
        size="small"
        onClick={() => history.push("/dataflow-management")}
        style={{ marginRight: 10 }}
      >
        Add a data flow
      </Button>
    </>
  );

  const getTableData = React.useMemo(
    () => (
      <>
        {loading ? (
          <Progress />
        ) : (
          <>
            <Table
              isLoading={loading}
              title={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <>
                  {`${totalRows} ${
                    totalRows >= 1 ? "Data Flows" : "Data Flow"
                  }`}
                </>
              }
              col
              columns={tableColumns}
              rows={tableRows.map((row) => ({
                ...row,
                expanded: expandedRows.includes(row.employeeId),
                handleToggleRow,
              }))}
              initialSortedColumn="dateCreated"
              initialSortOrder="asc"
              sortedColumn={sortedColumnValue}
              sortOrder={sortOrderValue}
              rowsPerPageOptions={[10, 50, 100, "All"]}
              tablePaginationProps={{
                labelDisplayedRows: ({ from, to, count }) =>
                  `${
                    count === 1 ? "Data Flow " : "Data Flows"
                  } ${from}-${to} of ${count}`,
                truncate: true,
              }}
              page={pageNo}
              rowsPerPage={rowsPerPageRecord}
              onChange={(rpp, sc, so, filts, page) => {
                // console.log("onChange", rpp, sc, so, filts, page, others);
                setRowPerPageRecord(rpp);
                setSortedColumnValue(sc);
                setSortOrderValue(so);
                setInlineFilters(filts);
                setPageNo(page);
              }}
              columnSettings={{
                enabled: true,
                frozenColumnsEnabled: true,
                defaultColumns: moreColumns,
                onChange: (changeColumns) => {
                  setTableColumns(changeColumns);
                },
              }}
              CustomHeader={(props) => (
                <CustomButtonHeader downloadFile={downloadFile} {...props} />
              )}
              emptyProps={{
                content: <EmptyTableComponent />,
              }}
            />
          </>
        )}
      </>
    ),
    [
      tableColumns,
      tableRows,
      sortOrderValue,
      moreColumns,
      sortedColumnValue,
      pageNo,
      rowsPerPageRecord,
      loading,
    ]
  );

  return <div className="study-table">{getTableData}</div>;
}
