/* eslint-disable react/button-has-type */
import React, { useState, useContext, useEffect } from "react";
import * as XLSX from "xlsx";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
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
import Plus from "apollo-react-icons/Plus";
import Tooltip from "apollo-react/components/Tooltip";
import Modal from "apollo-react/components/Modal";
import { MessageContext } from "../../components/MessageProvider";

import {
  checkNumeric,
  checkAlphaNumeric,
  checkRequired,
  checkFormat,
  checkRequiredValue,
  checkCharacterLength,
} from "../../components/FormComponents/validators";
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

const ActionCell = ({ row }) => {
  const {
    columnId,
    onRowEdit,
    onRowSave,
    editMode,
    onCancel,
    editedRow,
    onDelete,
  } = row;

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

const addSingleRow = () => {
  console.log("Add a single row");
};

const addMultipleRows = () => {
  console.log("Add multiple rows");
};

const downloadTemplate = () => {
  console.log("Download Template");
};

const downloadTable = () => {
  console.log("Download Table");
};

const menuItems = [
  {
    text: "Download Template",
    onClick: downloadTemplate,
  },
  {
    text: "Download Table",
    onClick: downloadTable,
  },
];

const addMenuItems = [
  {
    text: "Add 1 row",
    onClick: addSingleRow,
  },
  {
    text: "Add multiple rows",
    onClick: addMultipleRows,
  },
];

const makeEditableSelectCell =
  (options) =>
  ({ row, column: { accessor: key } }) => {
    const errorText =
      checkRequired(row[key]) || checkRequiredValue(row[key], key, row.primary);
    return row.editMode ? (
      <Select
        size="small"
        fullWidth
        canDeselect={false}
        value={row[key]}
        error={errorText ? true : false}
        helperText={errorText}
        onChange={(e) =>
          row.editRow(row.columnId, key, e.target.value, errorText)
        }
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
  };
const Cell = ({ row, column }) => (
  <div style={{ paddingTop: row.editMode ? 12 : 0 }}>
    {row[column.accessor]}
  </div>
);
const NumericEditableCell = ({ row, column: { accessor: key } }) => {
  const errorText =
    checkRequired(row[key]) ||
    checkNumeric(row[key]) ||
    checkCharacterLength(row[key], key, row.minLength, row.maxLength);
  return row.editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      onChange={(e) =>
        row.editRow(row.columnId, key, e.target.value, errorText)
      }
      error={errorText ? true : false}
      helperText={errorText}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};
const EditableCell = ({ row, column: { accessor: key } }) => {
  const errorText =
    checkRequired(row[key]) ||
    checkAlphaNumeric(row[key], key) ||
    checkFormat(row[key], key, row.dataType);
  return row.editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      inputProps={{
        maxLength:
          row.selectedDataset?.fileType === "SAS" && key === "columnName"
            ? 32
            : null,
      }}
      onChange={(e) =>
        row.editRow(row.columnId, key, e.target.value, errorText)
      }
      error={errorText ? true : false}
      helperText={errorText}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};
const columns = [
  {
    header: "",
    accessor: "columnId",
    customCell: Cell,
  },
  {
    header: "Variable Label",
    accessor: "variableLabel",
    customCell: EditableCell,
    filterFunction: createStringSearchFilter("variableLabel"),
    filterComponent: TextFieldFilter,
  },
  {
    header: "Column Name/Designator",
    accessor: "columnName",
    customCell: EditableCell,
  },
  {
    header: "Position",
    accessor: "position",
    customCell: NumericEditableCell,
  },
  {
    header: "Format",
    accessor: "format",
    customCell: EditableCell,
  },
  {
    header: "Data Type",
    accessor: "dataType",
    customCell: makeEditableSelectCell(["Alphanumeric", "Numeric", "Date"]),
  },
  {
    header: "Primary?",
    accessor: "primary",
    customCell: makeEditableSelectCell(["Yes", "No"]),
  },
  {
    header: "Unique?",
    accessor: "unique",
    customCell: makeEditableSelectCell(["Yes", "No"]),
  },
  {
    header: "Required?",
    accessor: "required",
    customCell: makeEditableSelectCell(["Yes", "No"]),
  },
  {
    header: "Min length",
    accessor: "minLength",
    customCell: NumericEditableCell,
  },
  {
    header: "Max length",
    accessor: "maxLength",
    customCell: NumericEditableCell,
  },
  {
    header: "List of values",
    accessor: "values",
    customCell: EditableCell,
  },
  {
    accessor: "action",
    customCell: ActionCell,
    align: "right",
  },
];
const DatasetTable = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const dataSets = useSelector((state) => state.dataSets);
  const { selectedDataset } = dataSets;
  const { numberOfRows, dataOrigin, formattedData, locationType } = props;
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
  const [rows, setRows] = useState(initialRows);
  const [editedRows, setEditedRows] = useState([]);
  const [editByRow, setEditByRow] = useState([]);
  const [rowErr, setRowErr] = useState({});
  const [showOverWrite, setShowOverWrite] = useState(false);
  const editMode = editedRows.length > 0;

  const CustomHeader = ({ onCancel, onSave, onEditAll }) => (
    <div>
      <Grid container alignItems="center">
        {onEditAll && (
          <>
            <Button size="small" style={{ marginRight: 8 }} onClick={onCancel}>
              Cancel All
            </Button>
            <Button size="small" variant="primary" onClick={onSave}>
              Save All
            </Button>
          </>
        )}
        <Tooltip title="Add rows" disableFocusListener>
          <IconMenuButton id="actions-1" menuItems={addMenuItems} size="small">
            <Plus />
          </IconMenuButton>
        </Tooltip>
        <Tooltip title="Edit all" disableFocusListener>
          <IconButton color="primary" size="small">
            <Pencil />
          </IconButton>
        </Tooltip>
        {(locationType?.toLowerCase() === "sftp" ||
          locationType?.toLowerCase() === "ftps") && (
          <Tooltip title="Import dataset column settings" disableFocusListener>
            <IconButton color="primary" size="small">
              <Upload />
            </IconButton>
          </Tooltip>
        )}
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

  useEffect(() => {
    if (dataOrigin === "fileUpload") {
      setRows([...formattedData]);
    }
    console.log("dataOrigin", dataOrigin, formattedData, rows);
  }, [dataOrigin]);

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

  const editRow = (columnId, key, value, errorTxt) => {
    setEditedRows((rws) =>
      rws.map((row) =>
        row.columnId === columnId ? { ...row, [key]: value } : row
      )
    );
    setRowErr((err) => ({ ...err, [key]: errorTxt }));
  };

  const hideOverWrite = () => {
    console.log("close overwrite");
  };

  const handleOverWrite = () => {
    console.log("handle overwrite");
  };

  // const showProtocolNotMatching = () => {
  //   messageContext.showErrorMessage(
  //     `Protocol # ‘${}’ in file does not match protocol number ‘${dashboard.selectedCard.protocolnumber}’ for this data flow. Please make sure these match and try again`
  //   );
  // };

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
            selectedDataset,
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
      <Modal
        open={showOverWrite}
        variant="warning"
        title="Overwritte set column attributes"
        onClose={hideOverWrite}
        message="The existing data set column attributes will be overwritten. Continue?"
        buttonProps={[
          { label: "Cancel", onClick: hideOverWrite },
          { label: "Ok", onClick: handleOverWrite },
        ]}
        id="overWrite"
      />
    </div>
  );
};

export default DatasetTable;
