import React, { useEffect, useState } from "react";
import Typography from "apollo-react/components/Typography";
import Tooltip from "apollo-react/components/Tooltip";
import IconButton from "apollo-react/components/IconButton";
import ArrowDown from "apollo-react-icons/ArrowDown";
import ArrowRight from "apollo-react-icons/ArrowRight";
import Table from "apollo-react/components/Table";
import Tag from "apollo-react/components/Tag";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import Menu from "apollo-react/components/Menu";
import MenuItem from "apollo-react/components/MenuItem";
import { useDispatch } from "react-redux";
import {
  deletePackage,
  updateStatus,
} from "../../store/actions/DataPackageAction";

const ExpandCell = ({ row: { packageName, handleToggleRow, expanded } }) => {
  return (
    <div style={{ width: 12 }}>
      <Tooltip title={expanded ? "Collapse" : "Expand"} disableFocusListener>
        <IconButton
          id="expand"
          size="small"
          // onClick={() => handleToggleRow(packageName)}
        >
          {expanded ? <ArrowDown /> : <ArrowRight />}
        </IconButton>
      </Tooltip>
    </div>
  );
};
const PackageImg = (
  <img
    src="assets/svg/datapackage.svg"
    alt="datapackage"
    style={{ width: 15, marginRight: 8 }}
  />
);
const NameCustomCell = ({ row, column: { accessor } }) => {
  const title = row[accessor] || row.datapackageid;
  return (
    <div className="flex package-name-td">
      {PackageImg}
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

const DetailRow = ({ row }) => {
  return (
    <div style={{ display: "flex", padding: "8px 0px 8px 8px" }}>
      <Typography>DataSets</Typography>
    </div>
  );
};

const PackagesList = ({ data }) => {
  const dispatch = useDispatch();
  const [expandedRows, setExpandedRows] = useState([]);
  const [tableData, setTableData] = useState([]);
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
          })
        );
      }
    };
    const menuItems = [
      {
        text: `Set data package ${active === 1 ? "Inactive" : "Active"}`,
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
        onClick: () => packageId && dispatch(deletePackage(packageId)),
      },
    ];
    const openAction = (e) => {
      setAnchorEl(e.currentTarget);
      setOpen(true);
    };

    return (
      <>
        <EllipsisVertical fontSize="small" onClick={openAction} />
        <Menu
          id="tableMenu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleRequestClose}
        >
          {menuItems.map((menu) => {
            return (
              <MenuItem size="small" onClick={menu.onClick}>
                {menu.text}
              </MenuItem>
            );
          })}
        </Menu>
      </>
      // <IconMenuButton menuItems={menuItems} size="small">
      //   <EllipsisVertical />
      // </IconMenuButton>
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
  const handleToggleRow = (packageName) => {
    // eslint-disable-next-line no-shadow
    setExpandedRows((expandedRows) =>
      expandedRows.includes(packageName)
        ? expandedRows.filter((id) => id !== packageName)
        : [...expandedRows, packageName]
    );
  };
  useEffect(() => {
    const newData = data.packagesList || [];
    console.log("Tabledata", newData);
    const updatedData = newData;
    // tableData.map((row) => ({
    //   ...row,
    //   expanded: expandedRows.includes(row.packageName),
    //   handleToggleRow,
    // }));
    setTableData(updatedData);
  }, [data.packagesList]);
  return (
    <Table
      columns={columns}
      rowId="packageName"
      rows={tableData}
      rowProps={{ hover: false }}
      hidePagination={true}
      // tablePaginationProps={{
      //   labelDisplayedRows: ({ from, to, count }) =>
      //     `${count === 1 ? "Package" : "Packages"} ${from}-${to} of ${count}`,
      //   truncate: true,
      // }}
      ExpandableComponent={DetailRow}
    />
  );
};
export default PackagesList;
