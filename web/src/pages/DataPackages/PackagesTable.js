import React, { useEffect, useState } from "react";
import { Redirect } from "react-router";
import Typography from "apollo-react/components/Typography";
import Tooltip from "apollo-react/components/Tooltip";
import IconButton from "apollo-react/components/IconButton";
import ArrowDown from "apollo-react-icons/ArrowDown";
import ArrowRight from "apollo-react-icons/ArrowRight";
import Table, {
  compareDates,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import moment from "moment";
import Button from "apollo-react/components/Button";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import EllipsisVerticalIcon from "apollo-react-icons/EllipsisVertical";

const ExpandCell = ({ row: { packageName, handleToggleRow, expanded } }) => {
  return (
    <div style={{ width: 12 }}>
      <Tooltip title={expanded ? "Collapse" : "Expand"} disableFocusListener>
        <IconButton
          id="expand"
          size="small"
          onClick={() => handleToggleRow(packageName)}
        >
          {expanded ? <ArrowDown /> : <ArrowRight />}
        </IconButton>
      </Tooltip>
    </div>
  );
};
const NameCustomCell = ({ row, column: { accessor } }) => {
  const title = row[accessor] || row.datapackageid;
  return (
    <div className="flex">
      <img
        src="assets/svg/datapackage.svg"
        alt="datapackage"
        style={{ width: 15, marginRight: 8 }}
      />
      <span className="b-font">{title || "Unknown"}</span>
    </div>
  );
};

const ActionCell = ({ row }) => {
  const { packageName, onRowEdit } = row;
  const menuItems = [
    {
      text: "Set data package active",
      onClick: () => onRowEdit(packageName),
    },
    {
      text: "Set all dataset to active",
      onClick: () => onRowEdit(packageName),
    },
    {
      text: "Set all datasets to inactive",
      onClick: () => onRowEdit(packageName),
    },
    {
      text: "Delete data package",
      onClick: () => onRowEdit(packageName),
    },
  ];

  return (
    <div>
      <Tooltip title="Actions" disableFocusListener>
        <IconMenuButton id="actions" menuItems={menuItems} size="small">
          <EllipsisVerticalIcon />
        </IconMenuButton>
      </Tooltip>
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
    header: "Status",
    accessor: "status",
  },
  {
    accessor: "action",
    customCell: ActionCell,
    align: "right",
    width: 32,
  },
];
const DetailRow = ({ row }) => {
  return (
    <div style={{ display: "flex", padding: "8px 0px 8px 8px" }}>
      <Typography>DataSets</Typography>
    </div>
  );
};
const skillLevels = ["Beginner", "Intermediate", "Expert"];

const PackagesList = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [tableData, setTableData] = useState([]);
  const handleToggleRow = (packageName) => {
    // eslint-disable-next-line no-shadow
    setExpandedRows((expandedRows) =>
      expandedRows.includes(packageName)
        ? expandedRows.filter((id) => id !== packageName)
        : [...expandedRows, packageName]
    );
  };
  useEffect(() => {
    const newData = data.packagesList.data || [];
    console.log("Tabledata", newData);
    const updatedData = newData.map((row, i) => ({
      ...row,
      description: `${row.name} is an amazing ${
        row.dept
      } person. They've been with us for ${Math.floor(
        moment().diff(moment(row.hireDate, "MM/DD/YYYY"), "years")
      )} years!`,
      birthday: moment(row.hireDate, "MM/DD/YYYY")
        .subtract(23, "years")
        .format("MM/DD/YYYY"),
      skillLevel: skillLevels[i % 3],
    }));
    setTableData(updatedData);
  }, [data]);
  return (
    <Table
      columns={columns}
      rowId="packageName"
      rows={tableData.map((row) => ({
        ...row,
        expanded: expandedRows.includes(row.packageName),
        handleToggleRow,
      }))}
      rowProps={{ hover: false }}
      hidePagination={true}
      tablePaginationProps={{
        labelDisplayedRows: ({ from, to, count }) =>
          `${count === 1 ? "Package" : "Packages"} ${from}-${to} of ${count}`,
        truncate: true,
      }}
      ExpandableComponent={DetailRow}
    />
  );
};
export default PackagesList;
