import React from "react";
import MenuItem from "apollo-react/components/MenuItem";
import Select from "apollo-react/components/Select";
import TextField from "apollo-react/components/TextField";
import Trash from "apollo-react-icons/Trash";
import Pencil from "apollo-react-icons/Pencil";
import Button from "apollo-react/components/Button";
import IconButton from "apollo-react/components/IconButton";
import Grid from "apollo-react/components/Grid";
import Upload from "apollo-react-icons/Upload";
import Filter from "apollo-react-icons/Filter";
import Divider from "apollo-react/components/Divider";
import Search from "apollo-react/components/Search";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import Tooltip from "apollo-react/components/Tooltip";
import {
  createStringSearchFilter,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";

import { ReactComponent as Plus } from "../../../components/Icons/roundPlusBlue.svg";
import { TextFieldFilter } from "../../../utils/index";

import {
  checkNumeric,
  checkAlphaNumeric,
  checkRequired,
  checkFormat,
  checkRequiredValue,
  checkCharacterLength,
} from "../../../components/FormComponents/validators";

const fieldStyles = {
  style: {
    marginTop: 3,
    marginLeft: -8,
  },
};

const fieldStylesNo = {
  style: {
    marginTop: 3,
    marginLeft: -8,
    maxWidth: 85,
  },
};

export const makeEditableSelectCell =
  (options) =>
  ({ row, column: { accessor: key } }) => {
    const errorText = checkRequiredValue(row[key], key, row.primary);
    return row.editMode ? (
      <Select
        size="small"
        fullWidth
        canDeselect={false}
        value={row[key]}
        error={!row.isInitLoad && errorText ? true : false}
        helperText={!row.isInitLoad ? errorText : ""}
        onChange={(e) =>
          row.editRow(row.uniqueId, key, e.target.value, errorText)
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

export const NumericEditableCell = ({ row, column: { accessor: key } }) => {
  const errorText =
    checkNumeric(row[key]) ||
    checkCharacterLength(row[key], key, row.minLength, row.maxLength);
  return row.editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      onChange={(e) =>
        row.editRow(row.uniqueId, key, e.target.value, errorText)
      }
      error={!row.isInitLoad && errorText ? true : false}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStylesNo}
    />
  ) : (
    row[key]
  );
};

export const ColumnNameCell = ({ row, column: { accessor: key } }) => {
  const { editMode } = row;
  const errorText = checkRequired(row[key]);
  return editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      inputProps={{
        maxLength: row.fileType === "SAS" && key === "columnName" ? 32 : null,
      }}
      onChange={(e) =>
        row.editRow(row.uniqueId, key, e.target.value, errorText)
      }
      error={!row.isInitLoad && errorText ? true : false}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};

export const FormatCell = ({ row, column: { accessor: key } }) => {
  const { editMode } = row;
  const errorText = checkFormat(row[key], key, row.dataType);
  return editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      onChange={(e) =>
        row.editRow(row.uniqueId, key, e.target.value, errorText)
      }
      error={!row.isInitLoad && errorText ? true : false}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};

export const EditableCell = ({ row, column: { accessor: key } }) => {
  const { editMode } = row;
  const errorText = checkAlphaNumeric(row[key], key);
  return editMode ? (
    <TextField
      size="small"
      fullWidth
      value={row[key]}
      onChange={(e) =>
        row.editRow(row.uniqueId, key, e.target.value, errorText)
      }
      error={!row.isInitLoad && errorText ? true : false}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};

export const Cell = ({ row, column }) => (
  <div style={{ paddingTop: row.editMode ? 12 : 0 }}>
    {row[column.accessor]}
  </div>
);

export const ActionCell = ({ row }) => {
  const {
    uniqueId,
    onRowEdit,
    onRowCancel,
    onRowDelete,
    editMode: eMode,
    isHavingColumnName,
    onRowSave,
  } = row;

  return eMode ? (
    <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
      <Button
        size="small"
        style={{ marginRight: 8 }}
        onClick={() => onRowCancel(uniqueId)}
      >
        Cancel
      </Button>
      <Button
        size="small"
        variant="primary"
        onClick={() => onRowSave(uniqueId)}
        disabled={!isHavingColumnName}
      >
        Save
      </Button>
    </div>
  ) : (
    <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
      <IconButton size="small" onClick={() => onRowEdit(uniqueId)}>
        <Pencil />
      </IconButton>
      <IconButton size="small" onClick={() => onRowDelete(uniqueId)}>
        <Trash />
      </IconButton>
    </div>
  );
};

export const columns = [
  {
    header: "",
    accessor: "columnNo",
    customCell: Cell,
  },
  {
    accessor: "uniqueId",
    hidden: true,
    sortFunction: compareNumbers,
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
    customCell: ColumnNameCell,
    sortFunction: compareStrings,
  },
  {
    header: "Position",
    accessor: "position",
    customCell: EditableCell,
  },
  {
    header: "Format",
    accessor: "format",
    customCell: FormatCell,
  },
  {
    header: "Data Type",
    accessor: "dataType",
    customCell: makeEditableSelectCell(["Alphanumeric", "Numeric", "Date"]),
    sortFunction: compareStrings,
  },
  {
    header: "Primary?",
    accessor: "primary",
    customCell: makeEditableSelectCell(["Yes", "No"]),
    sortFunction: compareStrings,
  },
  {
    header: "Unique?",
    accessor: "unique",
    customCell: makeEditableSelectCell(["Yes", "No"]),
    sortFunction: compareStrings,
  },
  {
    header: "Required?",
    accessor: "required",
    customCell: makeEditableSelectCell(["Yes", "No"]),
    sortFunction: compareStrings,
  },
  {
    header: "Min length",
    accessor: "minLength",
    customCell: NumericEditableCell,
    sortFunction: compareNumbers,
  },
  {
    header: "Max length",
    accessor: "maxLength",
    customCell: NumericEditableCell,
    sortFunction: compareNumbers,
  },
  {
    header: "List of values",
    accessor: "values",
    customCell: EditableCell,
    sortFunction: compareStrings,
  },
  {
    accessor: "action",
    customCell: ActionCell,
    align: "right",
  },
];

export const CustomHeader = ({
  onCancelAll,
  onSaveAll,
  onEditAll,
  isEditAll,
  addMenuItems,
  menuItems,
  searchValue,
  searchRows,
  locationType,
  isMultiAdd,
  addNewRows,
  addMulti,
  cancelMulti,
  newRows,
  disableSaveAll,
}) => (
  <div>
    <Grid container alignItems="center">
      {isEditAll && (
        <>
          <Button size="small" style={{ marginRight: 8 }} onClick={onCancelAll}>
            Cancel All
          </Button>
          <Button
            size="small"
            variant="primary"
            onClick={onSaveAll}
            disabled={disableSaveAll}
          >
            Save All
          </Button>
        </>
      )}
      {!isMultiAdd && (
        <>
          <Tooltip title={!isEditAll && "Add rows"} disableFocusListener>
            <IconMenuButton
              id="actions-1"
              menuItems={addMenuItems}
              size="small"
              disabled={isEditAll}
            >
              <Plus />
            </IconMenuButton>
          </Tooltip>
          <Tooltip title={!isEditAll && "Edit all"} disableFocusListener>
            <IconButton color="primary" size="small" disabled={isEditAll}>
              <Pencil onClick={onEditAll} />
            </IconButton>
          </Tooltip>
        </>
      )}
      {isMultiAdd && (
        <>
          <TextField
            placeholder="# of rows"
            type="number"
            min="1"
            max="499"
            style={{ margin: "-5px 16px 0px 0px" }}
            onChange={(e) => addNewRows(e.target.value)}
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
        <Tooltip
          title={!isEditAll && "Import dataset column settings"}
          disableFocusListener
        >
          <IconButton color="primary" size="small" disabled={isEditAll}>
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
        style={{ margin: "-5px 16px 0px 0px" }}
        onChange={searchRows}
        value={searchValue}
        disabled={isEditAll}
      />
      <Button
        size="small"
        variant="secondary"
        icon={Filter}
        disabled={isEditAll}
      >
        Filter
      </Button>
      <IconMenuButton
        disabled={isEditAll}
        id="actions-2"
        menuItems={menuItems}
        size="small"
      >
        <EllipsisVertical />
      </IconMenuButton>
    </Grid>
  </div>
);
