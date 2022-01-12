/* eslint-disable react/button-has-type */
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import Table, { createStringSearchFilter } from "apollo-react/components/Table";
import MenuItem from "apollo-react/components/MenuItem";
import TextField from "apollo-react/components/TextField";
import Button from "apollo-react/components/Button";
import Grid from "apollo-react/components/Grid";
import IconButton from "apollo-react/components/IconButton";
import Pencil from "apollo-react-icons/Pencil";
import Upload from "apollo-react-icons/Upload";
import Trash from "apollo-react-icons/Trash";
import Divider from "apollo-react/components/Divider";
import Search from "apollo-react/components/Search";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import Select from "apollo-react/components/Select";

import { createDatasetData } from "../../store/actions/DataSetsAction";

const useStyles = makeStyles(() => ({
  paper: {
    padding: "25px 16px",
  },
  section: {
    marginBottom: 32,
  },
}));
const fieldStyles = {
  style: {
    marginTop: 3,
    marginLeft: -8,
  },
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

const Cell = ({ row, column }) => (
  <div style={{ paddingTop: row.editMode ? 12 : 0 }}>
    {row[column.accessor]}
  </div>
);

const DatasetTable = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { numberOfRows, dataOrigin, formattedData } = props;
  const initialRows = Array.from({ length: numberOfRows }, (i, index) => ({
    columnId: index + 1,
    variableLabel: "",
    columnName: "",
    position: "",
    format: "",
    dataType: "",
    primary: "",
    unique: "",
    required: "",
    minLength: "",
    maxLength: "",
    values: "",
  }));
  const [rows, setRows] = useState([...initialRows]);
  const [editedRows, setEditedRows] = useState([...initialRows]);
  const [editByRow, setEditByRow] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const ActionCell = ({ row }) => {
    const { columnId, onRowEdit, onRowSave, onCancel, editedRow, onDelete } =
      row;

    return editMode ? (
      <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
        <Button size="small" style={{ marginRight: 8 }} onClick={onCancel}>
          Cancel
        </Button>
        <Button size="small" variant="primary">
          Save
        </Button>
      </div>
    ) : (
      <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
        <IconButton size="small" onClick={() => onRowEdit(columnId)}>
          <Pencil />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(columnId)}>
          <Trash />
        </IconButton>
      </div>
    );
  };
  const menuItems = [
    {
      text: "Download Template",
      onClick: console.log("Download Template"),
    },
    {
      text: "Download Table",
      onClick: console.log("Download Table"),
    },
  ];

  const CustomHeader = ({ onCancel, onSave, onEditAll }) => (
    <div>
      <Grid container alignItems="center">
        <Button size="small" style={{ marginRight: 8 }} onClick={onCancel}>
          Cancel All
        </Button>
        <Button size="small" variant="primary" onClick={onSave}>
          Save All
        </Button>
        <IconButton color="primary" size="small" disabled>
          <Pencil />
        </IconButton>
        <IconButton color="primary" size="small" disabled>
          <Upload />
        </IconButton>
        <Divider
          orientation="vertical"
          flexItem
          style={{ marginLeft: 15, marginRight: 15 }}
        />
        <Search
          placeholder="Search"
          size="small"
          style={{ marginTop: "-5px", marginBottom: 0 }}
          disabled
        />
        <IconMenuButton id="actions-2" menuItems={menuItems} size="small">
          <EllipsisVertical />
        </IconMenuButton>
      </Grid>
    </div>
  );
  const makeEditableSelectCell =
    (options) =>
    ({ row, column: { accessor: key } }) =>
      row.editMode ? (
        <Select
          size="small"
          fullWidth
          canDeselect={false}
          value={row[key]}
          onChange={(e) => row.editRow(row.columnId, key, e.target.value)}
          {...fieldStyles}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      ) : (
        row[key]
      );

  const EditableCell = ({ row, column: { accessor: key } }) =>
    row.editMode ? (
      <TextField
        size="small"
        fullWidth
        value={row[key]}
        onChange={(e) => row.editRow(row.columnId, key, e.target.value)}
        error={!row[key]}
        helperText={!row[key] && "Required"}
        {...fieldStyles}
      />
    ) : (
      row[key]
    );
  const columns = [
    {
      header: "",
      accessor: "columnId",
      customCell: Cell,
      frozen: true,
    },
    {
      header: "Variable Label",
      accessor: "variableLabel",
      customCell: EditableCell,
      filterFunction: createStringSearchFilter("variableLabel"),
      filterComponent: TextFieldFilter,
      frozen: true,
    },
    {
      header: "Column Name/Designator",
      accessor: "columnName",
      customCell: EditableCell,
      frozen: true,
    },
    // {
    //   header: "Position",
    //   accessor: "position",
    //   customCell: EditableCell,
    // },
    {
      header: "Format",
      accessor: "format",
      customCell: EditableCell,
      frozen: false,
    },
    {
      header: "Data Type",
      accessor: "dataType",
      customCell: makeEditableSelectCell(["Alphanumeric", "Numeric", "Date"]),
      frozen: false,
    },
    {
      header: "Primary?",
      accessor: "primary",
      customCell: makeEditableSelectCell(["Yes", "No"]),
      frozen: false,
    },
    {
      header: "Unique?",
      accessor: "unique",
      customCell: makeEditableSelectCell(["Yes", "No"]),
      frozen: false,
    },
    {
      header: "Required?",
      accessor: "required",
      customCell: makeEditableSelectCell(["Yes", "No"]),
      frozen: false,
    },
    {
      header: "Min length",
      accessor: "minLength",
      customCell: EditableCell,
      frozen: false,
    },
    {
      header: "Max length",
      accessor: "maxLength",
      customCell: EditableCell,
      frozen: false,
    },
    {
      header: "List of values",
      accessor: "values",
      customCell: EditableCell,
      frozen: false,
    },
    {
      accessor: "action",
      customCell: ActionCell,
      align: "right",
    },
  ];

  useEffect(() => {
    if (dataOrigin === "fileUpload") {
      setRows([...formattedData]);
    }
    console.log("dataOrigin", dataOrigin, formattedData, rows);
  }, [dataOrigin]);

  // const editMode = editedRows.length > 0;
  const onEditAll = () => {
    setEditedRows(rows);
  };

  const onRowEdit = (columnId) => {
    console.log("rowid", columnId);
  };
  const onSave = () => {
    setRows(editedRows);
    setEditedRows(rows);
    dispatch(createDatasetData(editedRows));
  };

  const onCancel = () => {
    setEditedRows([]);
  };
  const onDelete = (columnId) => {
    setRows(rows.filter((row) => row.columnId !== columnId));
  };

  const editRow = (columnId, key, value) => {
    console.log(columnId, "key", key, value);
    setEditedRows((rws) =>
      rws.map((row) =>
        row.columnId === columnId ? { ...row, [key]: value } : row
      )
    );
  };

  const getTableData = React.useMemo(
    () => (
      <>
        <Table
          title="Dataset Column Settings"
          subtitle={`${
            rows.length > 1
              ? `${rows.length}dataset columns`
              : `${rows.length}dataset columns`
          }`}
          columns={columns}
          rowId="columnId"
          hasScroll={true}
          rows={(editMode ? editedRows : rows).map((row) => ({
            ...row,
            onDelete,
            editRow,
            editMode,
            onRowEdit,
          }))}
          rowsPerPageOptions={[10, 50, 100, "All"]}
          rowProps={{ hover: false }}
          tablePaginationProps={{
            labelDisplayedRows: ({ from, to, count }) =>
              `${count === 1 ? "Item" : "Items"} ${from}-${to} of ${count}`,
            truncate: true,
          }}
          CustomHeader={CustomHeader}
          headerProps={{ onSave, onCancel, editMode }}
        />
      </>
    ),
    [columns, editMode, editedRows, rows]
  );

  return (
    <div>
      <div className={classes.section}>{getTableData}</div>
    </div>
  );
};

export default DatasetTable;