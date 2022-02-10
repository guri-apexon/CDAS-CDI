/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useContext, useEffect } from "react";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Table, {
  dateFilterV2,
  numberSearchFilter,
  compareDates,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import { neutral7, neutral8 } from "apollo-react/colors";
import Modal from "apollo-react/components/Modal";
import Typography from "apollo-react/components/Typography";
import Button from "apollo-react/components/Button";
import Tag from "apollo-react/components/Tag";
import SegmentedControl from "apollo-react/components/SegmentedControl";
import SegmentedControlGroup from "apollo-react/components/SegmentedControlGroup";
import Tooltip from "apollo-react/components/Tooltip";
import FilterIcon from "apollo-react-icons/Filter";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import Link from "apollo-react/components/Link";
import IconButton from "apollo-react/components/IconButton";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import ChevronDown from "apollo-react-icons/ChevronDown";
import ChevronRight from "apollo-react-icons/ChevronRight";
import PlusIcon from "apollo-react-icons/Plus";
import Progress from "../../components/Common/Progress/Progress";
import { MessageContext } from "../../components/Providers/MessageProvider";
import { ReactComponent as DataFlowIcon } from "../../components/Icons/dataflow.svg";
import {
  hardDelete,
  activateDF,
  inActivateDF,
  syncNowDataFlow,
} from "../../services/ApiServices";

import { updateSelectedDataflow } from "../../store/actions/DashboardAction";

import {
  createAutocompleteFilter,
  IntegerFilter,
  createStringArraySearchFilter,
  DateFilter,
} from "../../utils/index";

const DateCell = ({ row, column: { accessor } }) => {
  const rowValue = row[accessor];
  const date =
    rowValue && moment(rowValue, "DD-MMM-YYYY").isValid()
      ? moment(rowValue).format("DD-MMM-YYYY")
      : moment(rowValue).format("DD-MMM-YYYY");

  return <span>{date}</span>;
};

const StatusCell = ({ row, column: { accessor } }) => {
  const description = row[accessor];
  return (
    <Tag
      style={{ marginRight: 10 }}
      label={description}
      className={`status-cell ${
        description === "Active" ? "active" : "inActive"
      }`}
    />
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
          {row.dataFlowName}
        </Typography>
      </div>
      <div style={{ marginLeft: 32 }}>
        <Typography style={{ color: neutral7 }} variant="body2">
          # Data Packages
        </Typography>
        <Typography style={{ fontWeight: 500, color: neutral8 }}>
          {row.dataPackages}
        </Typography>
      </div>
      <div style={{ marginLeft: 32 }}>
        <Typography style={{ color: neutral7 }} variant="body2">
          Adapter
        </Typography>
        <Typography style={{ fontWeight: 500, color: neutral8 }}>
          {row.adapter}
        </Typography>
      </div>
      <div style={{ marginLeft: 32 }}>
        <Typography style={{ color: neutral7 }} variant="body2">
          Date Created
        </Typography>
        <Typography style={{ fontWeight: 500, color: neutral8 }}>
          {row.dateCreated}
        </Typography>
      </div>
    </div>
  );
};

export default function DataflowTab({ updateData }) {
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const messageContext = useContext(MessageContext);
  const [showSyncNow, setShowSyncNow] = useState(false);
  const [showHardDelete, setShowHardDelete] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [rowData, setRowData] = useState([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.dashboard);

  const [expandedRows, setExpandedRows] = useState([]);

  const handleToggleRow = (dataFlowId) => {
    // eslint-disable-next-line no-shadow
    setExpandedRows((expandedRows) =>
      expandedRows.includes(dataFlowId)
        ? expandedRows.filter((id) => id !== dataFlowId)
        : [...expandedRows, dataFlowId]
    );
  };

  useEffect(() => {
    // eslint-disable-next-line no-nested-ternary
    const dashboardData = selectedFilter
      ? selectedFilter === "all"
        ? dashboard.flowData
        : dashboard?.flowData.filter((data) => data.type === selectedFilter)
      : dashboard.flowData;
    setRowData([...dashboardData]);
  }, [dashboard.flowData, selectedFilter]);

  const hardDeleteAction = async (e) => {
    setSelectedFlow(e);
    setShowHardDelete(true);
  };

  const hideSyncNow = () => {
    setSelectedFlow(null);
    setShowSyncNow(false);
  };

  const hideHardDelete = () => {
    setSelectedFlow(null);
    setShowHardDelete(false);
  };

  const handleHardDelete = async () => {
    const { dataFlowId } = selectedFlow;
    const deleteStatus = await hardDelete(dataFlowId);
    if (deleteStatus.success) {
      await updateData();
    }
    setShowHardDelete(false);
  };

  const sendSyncRequest = async (e) => {
    setSelectedFlow(e);
    setShowSyncNow(true);
  };

  const handleSync = async () => {
    const { dataFlowId, version } = selectedFlow;
    const syncStatus = await syncNowDataFlow({ version, dataFlowId });
    if (syncStatus.success) {
      await updateData();
    }
    setShowSyncNow(false);
  };

  const viewAuditLogAction = (e) => {
    history.push(`/audit-logs/${e}`);
  };

  const cloneDataFlowAction = (e) => {
    console.log("cloneDataFlowAction", e);
  };

  const changeStatusAction = async (e) => {
    if (e.status === "Inactive") {
      const updateStataus = await activateDF(e.dataFlowId, e.version);
      if (updateStataus?.success) {
        await updateData();
      } else {
        messageContext.showErrorMessage(
          `Activate the dataflow is cannot be completed and the dataflow having the issue`
        );
      }
    } else {
      await inActivateDF(e.dataFlowId, e.version);
      await updateData();
    }
  };

  const handleLink = (dataFlowId) => {
    dispatch(updateSelectedDataflow(dataFlowId));
    history.push("/dataflow-management");
  };

  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    const { dataFlowId } = row;
    return <Link onClick={() => handleLink(dataFlowId)}>{rowValue}</Link>;
  };

  const ActionCell = ({ row }) => {
    const { dataFlowId, status, version } = row;
    const activeText =
      status === "Active"
        ? "Change status to inactive"
        : "Change status to active";
    const menuItems = [
      {
        text: "View audit log",
        onClick: () => viewAuditLogAction(dataFlowId),
      },
      {
        text: activeText,
        onClick: () => changeStatusAction({ dataFlowId, status, version }),
      },
      {
        text: "Send sync request",
        onClick: () => sendSyncRequest(row),
        disabled: !(status === "Active"),
      },
      {
        text: "Clone data flow",
        onClick: () => cloneDataFlowAction(dataFlowId),
        disabled: true,
      },
      {
        text: "Hard delete data flow",
        onClick: () => hardDeleteAction(row),
      },
    ];
    return (
      <div style={{ display: "flex", justifyContent: "end" }}>
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
        onClick={() => handleToggleRow(dataFlowId)}
      >
        {expanded ? <ChevronDown /> : <ChevronRight />}
      </IconButton>
    );

    return (
      <div
        style={{
          width: 32,
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

  const CustomButtonHeader = ({ toggleFilters }) => (
    <>
      <div>
        <SegmentedControlGroup
          value={selectedFilter}
          exclusive
          onChange={(event, value) => setSelectedFilter(value)}
        >
          <SegmentedControl value="all">All</SegmentedControl>
          <SegmentedControl disabled={!(totalRows >= 1)} value="Production">
            Production
          </SegmentedControl>
          <SegmentedControl disabled={!(totalRows >= 1)} value="Test">
            Test
          </SegmentedControl>
        </SegmentedControlGroup>
      </div>
      <div>
        <Button
          size="small"
          variant="secondary"
          icon={PlusIcon}
          onClick={() => {
            if (dashboard.selectedCard.prot_id !== "") {
              history.push("/dataflow-management");
            } else {
              messageContext.showErrorMessage(
                `Please select a study to Add Data flow`
              );
            }
          }}
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
            rowData
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
            rowData
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
            rowData.map((r) => ({ label: r.type })).map((item) => item.label)
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
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("status"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            rowData.map((r) => ({ label: r.status })).map((item) => item.label)
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
            rowData
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
            rowData
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
      align: "right",
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
      header: "Version",
      accessor: "version",
      frozen: false,
      align: "right",
      sortFunction: compareNumbers,
      filterFunction: numberSearchFilter("version"),
      filterComponent: IntegerFilter,
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
            rowData
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
      align: "right",
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
            rowData.map((r) => ({ label: r.adapter })).map((item) => item.label)
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

  const [tableRows, setTableRows] = useState([...rowData]);
  const [tableColumns, setTableColumns] = useState([...moreColumns]);

  const toDataflowMgmt = async () => {
    history.push("/dataflow-management");
  };

  useEffect(() => {
    setTableColumns([...moreColumns]);
    setTableRows([...rowData]);
    setTotalRows(rowData.length);
  }, []);

  useEffect(() => {
    setTableColumns([...moreColumns]);
    setTableRows([...rowData]);
    setTotalRows(rowData.length);
  }, [rowData]);

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

  return (
    <div className="dataflow-table">
      {loading ? (
        <Progress />
      ) : (
        <>
          <Table
            isLoading={loading}
            title={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <>
                {`${totalRows} ${totalRows >= 1 ? "Data Flows" : "Data Flow"}`}
              </>
            }
            col
            columns={tableColumns}
            rows={tableRows.map((row) => ({
              ...row,
              expanded: expandedRows.includes(row.dataFlowId),
              handleToggleRow,
            }))}
            rowId="dataFlowId"
            initialSortedColumn="dateCreated"
            initialSortOrder="asc"
            rowsPerPageOptions={
              totalRows >= 30 ? [10, 50, 100, "All"] : [10, 20, 50, "All"]
            }
            hasScroll={true}
            maxWidth="calc(100vw - 465px)"
            maxHeight="calc(100vh - 293px)"
            tablePaginationProps={{
              labelDisplayedRows: ({ from, to, count }) =>
                `${count === 1 ? "Item " : "Items "} ${from}-${to} of ${count}`,
              truncate: true,
            }}
            columnSettings={{
              enabled: true,
              frozenColumnsEnabled: true,
              defaultColumns: moreColumns,
            }}
            CustomHeader={(props) => (
              <CustomButtonHeader toDataflowMgmt={toDataflowMgmt} {...props} />
            )}
            emptyProps={{
              content: <EmptyTableComponent />,
            }}
            ExpandableComponent={DetailRow}
          />
        </>
      )}
      <Modal
        open={showHardDelete}
        variant="warning"
        title="Delete Dataflow"
        onClose={hideHardDelete}
        message="Do you want to proceed with data deletion that cannot be undone?"
        buttonProps={[
          { label: "Cancel", onClick: hideHardDelete },
          { label: "Ok", onClick: handleHardDelete },
        ]}
        id="deleteDataFlow"
      />
      <Modal
        open={showSyncNow}
        title="Sync Dataflow"
        onClose={hideSyncNow}
        message="Do you want to proceed with SYNC NOW action?"
        buttonProps={[
          { label: "Cancel", onClick: hideSyncNow },
          { label: "Ok", onClick: handleSync },
        ]}
        id="syncDataFlow"
      />
    </div>
  );
}
