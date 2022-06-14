import React, { useEffect, useState } from "react";
import Typography from "apollo-react/components/Typography";
import Tooltip from "apollo-react/components/Tooltip";
import IconButton from "apollo-react/components/IconButton";
import ArrowDown from "apollo-react-icons/ArrowDown";
import ArrowRight from "apollo-react-icons/ArrowRight";
import Table from "apollo-react/components/Table";
import Tag from "apollo-react/components/Tag";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import Menu from "apollo-react/components/Menu";
import Status from "apollo-react/components/Status";
import StatusDotSolid from "apollo-react-icons/StatusDotSolid";
import MenuItem from "apollo-react/components/MenuItem";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { ReactComponent as RoundPlusSvg } from "../../components/Icons/roundplus.svg";
import { ReactComponent as PackageIcon } from "../../components/Icons/datapackage.svg";
import {
  deletePackage,
  redirectToDataSet,
  updateStatus,
} from "../../store/actions/DataPackageAction";
import { updateDSState } from "../../store/actions/DataFlowAction";
import { updateDSStatus } from "../../store/actions/DataSetsAction";

const ExpandCell = ({ row: { handleToggleRow, expanded, datapackageid } }) => {
  return (
    <div style={{ width: 12, marginLeft: "1px" }}>
      <Tooltip title={expanded ? "Collapse" : "Expand"} disableFocusListener>
        <IconButton
          id="expand"
          size="small"
          onClick={() => handleToggleRow(datapackageid)}
        >
          {expanded ? <ArrowDown /> : <ArrowRight />}
        </IconButton>
      </Tooltip>
    </div>
  );
};
// const PackageImg = (
//   <img
//     src="assets/svg/datapackage.svg"
//     alt="datapackage"
//     style={{ width: 15, marginRight: 8 }}
//   />
// );
const NameCustomCell = ({ row, column: { accessor } }) => {
  const title = row[accessor] || "No Package";
  return (
    <div className="flex package-name-td">
      <PackageIcon style={{ width: 15, margin: "0px 10px" }} />
      <span className="b-font">{title}</span>
    </div>
  );
};
const StatusCustomCell = ({ row, column: { accessor } }) => {
  const active = Number(row[accessor]);
  return (
    <div className="flex">
      {active === 1 ? (
        <Tag label="Active" variant="green" />
      ) : (
        <Tag label="Inactive" variant="grey" />
      )}
    </div>
  );
};

const PackagesList = ({ data, userInfo }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [expandedRows, setExpandedRows] = useState([]);
  const [tableData, setTableData] = useState([]);

  const addDataSet = (dfId, dfName, dpId, dpName, dsId = null, dsName = "") => {
    dispatch(redirectToDataSet(dfId, dfName, dpId, dpName, dsId, dsName));
    dispatch(updateDSState(true));
    dispatch(updateDSStatus(false));
    history.push("/dashboard/dataset/new");
  };

  const DataSetsCell = ({ row, column: { accessor } }) => {
    const datasets = row[accessor] || row.datasets;
    return (
      <div className="flex flex-center dataset-count-td">
        {/* {console.log("row", row)} */}
        <Typography variant="caption" className="datasetCount">
          {datasets.length || 0}
        </Typography>
        {row.sod_view_type === null && (
          <span className="add-dataset">
            <Tooltip title="Add dataset" disableFocusListener>
              <RoundPlusSvg
                className="add-dataset-btn"
                onClick={() =>
                  addDataSet(row.dataflowid, "", row.datapackageid, row.name)
                }
              />
            </Tooltip>
          </span>
        )}
      </div>
    );
  };

  const goToDataSet = (dfId, dfName, dpId, dpName, dsId, dsName) => {
    dispatch(redirectToDataSet(dfId, dfName, dpId, dpName, dsId, dsName));
    dispatch(updateDSState(false));
    history.push(`/dashboard/dataset/${dsId}`);
  };

  const DetailRow = ({ row }) => {
    return (
      <div className="datasets-list">
        {row.datasets?.map((dataset, i) => {
          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              className="dataset-row flex"
              key={dataset.datasetid}
              role="button"
              tabIndex={0}
              onClick={
                row.sod_view_type === null &&
                (() =>
                  goToDataSet(
                    row.dataflowid,
                    "",
                    row.datapackageid,
                    row.name,
                    dataset.datasetid,
                    dataset.mnemonic
                  ))
              }
            >
              <div className="dataset-details">
                <Typography
                  variant="caption"
                  className={
                    row.sod_view_type !== null
                      ? "sod-datasetName"
                      : "dataset-name"
                  }
                >
                  {dataset.name?.toUpperCase() ||
                    dataset.mnemonic ||
                    "DataSet Name"}
                </Typography>
                <Typography variant="caption" className="dataset-filetype">
                  {dataset.type?.toUpperCase() || "FileType"}
                </Typography>
              </div>
              <Status
                variant="positive"
                label={dataset.active ? "Active" : "Inactive"}
                size="small"
                className={`datasetStatus ${
                  dataset.active ? "active" : "inactive"
                }`}
                icon={StatusDotSolid}
              />
            </div>
          );
        })}
      </div>
    );
  };
  const ActionCell = ({ row }) => {
    const { packageName, onRowEdit } = row;
    const active = row.active && Number(row.active) === 1 ? 1 : 0;
    const packageId = row.datapackageid || null;
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const handleRequestClose = () => {
      setOpen(false);
    };
    const setActive = (status) => {
      if (packageId) {
        dispatch(
          updateStatus({
            package_id: packageId,
            active: status === 1 ? "0" : "1",
            user_id: userInfo.userId,
          })
        );
      }
    };
    const deleteAction = () => {
      if (packageId) {
        dispatch(
          deletePackage({ package_id: packageId, user_id: userInfo.userId })
        );
      }
    };
    const editAction = () => {
      if (packageId) {
        history.push("/dashboard/data-packages");
      }
    };
    const menuItems = [
      {
        text: `Set data package ${active === 1 ? "inactive" : "active"}`,
        onClick: () => setActive(active),
      },
      {
        text: "Set all dataset to active",
        // onClick: () => onRowEdit(packageName),
      },
      {
        text: "Set all datasets to inactive",
        // onClick: () => onRowEdit(packageName),
      },
      {
        text: "Delete data package",
        onClick: deleteAction,
      },
    ];
    const openAction = (e) => {
      setAnchorEl(e.currentTarget);
      setOpen(true);
    };

    return (
      <div className="flex">
        <EllipsisVertical
          fontSize="small"
          onClick={openAction}
          style={{ cursor: "pointer" }}
        />
        {row.sod_view_type === null ? (
          <Menu
            id="tableMenu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleRequestClose}
          >
            {menuItems.map((menu) => {
              return (
                <MenuItem key={menu.text} size="small" onClick={menu.onClick}>
                  {menu.text}
                </MenuItem>
              );
            })}
          </Menu>
        ) : (
          <Menu
            id="tableMenu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleRequestClose}
          >
            <MenuItem size="small" onClick={editAction}>
              Edit data package
            </MenuItem>
          </Menu>
        )}
      </div>
    );
  };
  const columns = [
    {
      accessor: "expand",
      customCell: ExpandCell,
      width: 20,
    },
    {
      header: "Package Name",
      accessor: "name",
      customCell: NameCustomCell,
    },
    {
      header: "Datasets",
      accessor: "datasets",
      customCell: DataSetsCell,
    },
    {
      header: "Active",
      accessor: "active",
      customCell: StatusCustomCell,
      width: 80,
    },
    {
      accessor: "action",
      customCell: ActionCell,
      align: "right",
      width: 32,
    },
  ];
  const handleToggleRow = (datapackageid) => {
    // eslint-disable-next-line no-shadow
    setExpandedRows((expandedRows) =>
      expandedRows.includes(datapackageid)
        ? expandedRows.filter((id) => id !== datapackageid)
        : [...expandedRows, datapackageid]
    );
    // setTimeout(() => {
    //   console.log(
    //     "packageName",
    //     expandedRows.filter((id) => id !== datapackageid),
    //     expandedRows,
    //     datapackageid
    //   );
    // }, 1000);
  };
  useEffect(() => {
    const newData = data.packagesList || [];
    setTableData(newData);
    // console.log("newData", newData);
  }, [data.packagesList]);
  return (
    <div className="remove-table-border-bottom">
      <Table
        columns={columns}
        rowId="packageName"
        rows={tableData.map((row) => ({
          ...row,
          expanded: expandedRows.includes(row.datapackageid),
          handleToggleRow,
        }))}
        rowProps={{ hover: false }}
        hidePagination={true}
        ExpandableComponent={DetailRow}
      />
    </div>
  );
};
export default PackagesList;
