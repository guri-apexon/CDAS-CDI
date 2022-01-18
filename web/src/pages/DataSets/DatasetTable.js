/* eslint-disable react/button-has-type */
import React, { useState, useContext, useEffect } from "react";
import * as XLSX from "xlsx";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import Table, { createStringSearchFilter } from "apollo-react/components/Table";
import MenuItem from "apollo-react/components/MenuItem";
import TextField from "apollo-react/components/TextField";
import Link from "apollo-react/components/Link";
import Modal from "apollo-react/components/Modal";
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
import { MessageContext } from "../../components/MessageProvider";

import {
  checkNumeric,
  checkAlphaNumeric,
  checkRequired,
  checkFormat,
  checkRequiredValue,
  checkCharacterLength,
} from "../../components/FormComponents/validators";
import { createDatasetColumns } from "../../store/actions/DataSetsAction";

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
  const [showViewLOVs, setShowViewLOVs] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const editMode = editedRows.length > 0;
  const [isEditAll, setIsEditAll] = useState(false);
  const [isEditLOVs, setIsEditLOVs] = useState(false);
  const [isMultiAdd, setIsMultiAdd] = useState(false);
  const [newRows, setNewRows] = useState(null);

  const handleViewLOV = (row) => {
    setShowViewLOVs(true);
    setSelectedRow(row);
  };

  const hideViewLOVs = () => {
    setShowViewLOVs(false);
    setIsEditLOVs(false);
    setSelectedRow(null);
  };

  const LinkCell = ({ row }) => {
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <Link onClick={() => handleViewLOV(row)}>View LOVs</Link>;
  };

  const ActionCell = ({ row }) => {
    const {
      columnId,
      onRowEdit,
      onRowSave,
      onCancel,
      onDelete,
      editMode: eMode,
    } = row;

    return editMode || eMode ? (
      <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
        <Button size="small" style={{ marginRight: 8 }} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="primary"
          onClick={() => onRowSave(columnId)}
        >
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
    setRows((rw) => [
      ...rw,
      {
        columnId: rw.length + 1,
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
      },
    ]);
    setEditByRow([rows.length + 1]);
  };

  const addMultipleRows = () => {
    setIsMultiAdd(true);
  };

  const cancelMulti = () => {
    setIsMultiAdd(false);
  };

  const addMulti = () => {
    setIsMultiAdd(false);
    if (parseInt(newRows, 10) > 0) {
      const multiRows = Array.from(
        { length: parseInt(newRows, 10) },
        (i, index) => ({
          columnId: rows.length + index + 1,
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
        })
      );
      setRows((rw) => [...rw, ...multiRows]);
      const rowsId = Array(parseInt(newRows, 10))
        .fill(null)
        .map((_, i) => rows.length + i + 1);
      setEditByRow([...rowsId]);
    }
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
      accessor: "action",
      customCell: ActionCell,
      align: "right",
    },
  ];

  const columnsToAdd = [
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
      header: "",
      accessor: "columnId",
      customCell: LinkCell,
    },
  ];

  const moreColumns = [
    ...columns.map((column) => ({ ...column })).slice(0, -1),
    ...columnsToAdd.map((column) => ({ ...column })),
    columns.slice(-1)[0],
  ];

  const CustomHeader = ({ onCancelAll, onSaveAll, onEditAll }) => (
    <div>
      <Grid container alignItems="center">
        {isEditAll && (
          <>
            <Button
              size="small"
              style={{ marginRight: 8 }}
              onClick={onCancelAll}
            >
              Cancel All
            </Button>
            <Button size="small" variant="primary" onClick={onSaveAll}>
              Save All
            </Button>
          </>
        )}
        {!isEditAll && !isMultiAdd && (
          <>
            <Tooltip title="Add rows" disableFocusListener>
              <IconMenuButton
                id="actions-1"
                menuItems={addMenuItems}
                size="small"
              >
                <Plus />
              </IconMenuButton>
            </Tooltip>
            <Tooltip title="Edit all" disableFocusListener>
              <IconButton color="primary" size="small">
                <Pencil onClick={onEditAll} />
              </IconButton>
            </Tooltip>
          </>
        )}
        {isMultiAdd && (
          <>
            <TextField
              placeholder="# of rows"
              onChange={(e) => setNewRows(e.target.value)}
              defaultValue={newRows}
              size="small"
            />
            <Button
              size="small"
              style={{ marginRight: 8, width: 50 }}
              onClick={cancelMulti}
            >
              Cancel
            </Button>
            <Button size="small" variant="primary" onClick={addMulti}>
              Add
            </Button>
          </>
        )}
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
    } else {
      // eslint-disable-next-line no-lonely-if
      if (formattedData.length > 0) {
        // setEditedRows([...formattedData]);
        setRows([...formattedData]);
      } else {
        setIsEditAll(true);
        setEditedRows(initialRows);
      }
    }
  }, [dataOrigin]);

  const onEditAll = () => {
    setEditedRows(rows);
    setIsEditAll(true);
  };

  const onSaveAll = () => {
    setRows(editedRows);
    setEditedRows(rows);
    dispatch(createDatasetColumns(editedRows, selectedDataset?.datasetid));
  };

  const onCancelAll = () => {
    setEditedRows([]);
    setIsEditAll(false);
  };

  const onCancel = () => {
    setEditByRow([]);
  };

  const onRowEdit = (columnId) => {
    setEditByRow([columnId]);
  };

  const onDelete = (columnId) => {
    setRows(rows.filter((row) => row.columnId !== columnId));
  };

  const editRow = (columnId, key, value, errorTxt) => {
    console.log(columnId, "ColumdIn");
    setEditedRows((rws) =>
      rws.map((row) =>
        row.columnId === columnId ? { ...row, [key]: value } : row
      )
    );
    // setRowErr((err) => ({ ...err, [key]: errorTxt }));
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
  console.log(editByRow, "editByRow");
  const getTableData = React.useMemo(
    () => (
      <>
        <Table
          title="Dataset Column Settings"
          subtitle={`${
            rows.length > 1
              ? `${rows.length} dataset columns`
              : `${rows.length} dataset columns`
          }`}
          columns={moreColumns}
          rowId="columnId"
          hasScroll={true}
          rows={(editMode ? editedRows : rows).map((row) => ({
            ...row,
            onDelete,
            editRow,
            editMode: editMode || editByRow?.includes(row.columnId),
            selectedDataset,
            onCancel,
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
          headerProps={{
            onSaveAll,
            onCancelAll,
            onEditAll,
            editMode,
            cancelMulti,
            addMulti,
          }}
        />
      </>
    ),
    [moreColumns, editMode, editedRows, rows]
  );

  return (
    <div>
      <div className={classes.section}>{getTableData}</div>
      <Modal
        open={showViewLOVs}
        scroll="paper"
        title="List of Values"
        onClose={hideViewLOVs}
        message={
          isEditLOVs ? (
            <>
              <TextField />
            </>
          ) : (
            `testing`
            // ${selectedRow && selectedRow.values}
          )
        }
        buttonProps={
          isEditLOVs
            ? [
                { label: "Save", onClick: hideViewLOVs },
                { label: "Cancel", onClick: () => setIsEditLOVs(false) },
              ]
            : [
                { label: "Edit", onClick: () => setIsEditLOVs(true) },
                { label: "Ok", onClick: hideViewLOVs },
              ]
        }
        id="overWrite"
      />
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
