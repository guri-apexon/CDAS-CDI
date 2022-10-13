import React from "react";
import MenuItem from "apollo-react/components/MenuItem";
import Select from "apollo-react/components/Select";
import { TextField } from "apollo-react/components/TextField/TextField";
import { Button } from "apollo-react/components/Button/Button";
import { IconButton } from "apollo-react/components/IconButton/IconButton";
import Grid from "apollo-react/components/Grid";
import Divider from "apollo-react/components/Divider";
import { Search } from "apollo-react/components/Search/Search";
import { IconMenuButton } from "apollo-react/components/IconMenuButton/IconMenuButton";
import { Tooltip } from "apollo-react/components/Tooltip/Tooltip";
import Upload from "apollo-react-icons/Upload";
import Filter from "apollo-react-icons/Filter";
import Trash from "apollo-react-icons/Trash";
import Pencil from "apollo-react-icons/Pencil";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import {
  createStringSearchFilter,
  createSelectFilterComponent,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";

import { ReactComponent as Plus } from "../../../components/Icons/roundPlusBlue.svg";
import {
  TextFieldFilter,
  createStringArraySearchFilter,
  isSftp,
} from "../../../utils/index";

import {
  checkNumeric,
  checkAlphaNumeric,
  checkRequired,
  checkFormat,
  checkCharacterLength,
  validateRow,
  isVlcTildSaparated,
} from "../../../components/FormComponents/validators";

import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../../components/Common/usePermission";

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
    return row.isEditMode ? (
      <Select
        size="small"
        fullWidth
        canDeselect={false}
        value={row[key]}
        onChange={(e) => row.editRow(row.uniqueId, key, e.target.value)}
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

export const editablePrimarySelectCell =
  (options) =>
  ({ row, column: { accessor: key } }) => {
    return row.isEditMode ? (
      <Select
        size="small"
        disabled={row.isDFSynced}
        fullWidth
        canDeselect={false}
        value={row[key]}
        error={row.errorPrimary}
        onChange={(e) => row.editRow(row.uniqueId, key, e.target.value)}
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

export const DataTypeEditableSelectCell =
  (options) =>
  ({ row, column: { accessor: key } }) => {
    const errorText = checkRequired(row[key], key);
    return row.isEditMode ? (
      <Select
        size="small"
        fullWidth
        canDeselect={false}
        value={row[key]}
        error={!row.isInitLoad && !row.isFormatLoad && errorText}
        helperText={!row.isInitLoad && !row.isFormatLoad ? errorText : ""}
        onChange={(e) => row.editRow(row.uniqueId, key, e.target.value)}
        {...fieldStyles}
        disabled={row.customSqlNo}
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

export const editableSelectCell =
  (options) =>
  ({ row, column: { accessor: key } }) => {
    return row.isEditMode ? (
      <Select
        size="small"
        fullWidth
        canDeselect={false}
        value={row[key]}
        onChange={(e) => row.editRow(row.uniqueId, key, e.target.value)}
        {...fieldStyles}
        // disabled={row.pkDisabled}
        disabled={!row.isSftpDf && row.isDFSynced}
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
  return row.isEditMode ? (
    <TextField
      size="small"
      fullWidth
      defaultValue={row[key]}
      onChange={(e) =>
        !e.target.value.includes(".") &&
        row.editRow(row.uniqueId, key, e.target.value)
      }
      error={!row.isInitLoad && errorText}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStylesNo}
    />
  ) : (
    row[key]
  );
};

export const PositionEditableCell = ({ row, column: { accessor: key } }) => {
  const { isEditMode, haveHeader } = row;
  let errorText;
  if (!haveHeader) {
    errorText = checkRequired(row[key]) || checkNumeric(row[key], true);
  } else {
    errorText = checkNumeric(row[key]);
  }

  return isEditMode ? (
    <TextField
      size="small"
      fullWidth
      defaultValue={row[key]}
      onChange={(e) => row.editRow(row.uniqueId, key, e.target.value)}
      disabled={row.dsProdLock}
      error={!row.isInitLoad && errorText}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStylesNo}
    />
  ) : (
    row[key]
  );
};

export const ColumnNameCell = ({ row, column: { accessor: key } }) => {
  const { isEditMode, haveHeader, primaryKey, customSqlNo } = row;
  let errorText;
  if (haveHeader) {
    errorText = checkRequired(row[key]);
    // || checkAlphaNumeric(row[key]);
  } else {
    errorText = false;
    // checkAlphaNumeric(row[key]);
  }

  return isEditMode ? (
    <TextField
      size="small"
      fullWidth
      defaultValue={row[key]}
      inputProps={{
        maxLength: row.fileType === "SAS" ? 32 : null,
      }}
      onChange={(e) => row.editRow(row.uniqueId, key, e.target.value)}
      error={!row.isInitLoad && errorText ? true : false}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStyles}
      disabled={customSqlNo || (primaryKey === "Yes" && row.dsProdLock)}
    />
  ) : (
    row[key]
  );
};

export const FormatCell = ({ row, column: { accessor: key } }) => {
  const { isEditMode } = row;
  const errorText = checkFormat(row[key], key, row.dataType);
  return isEditMode ? (
    <TextField
      size="small"
      fullWidth
      defaultValue={row[key]}
      onChange={(e) => row.editRow(row.uniqueId, key, e.target.value)}
      error={!row.isInitLoad && errorText}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};

export const EditableCell = ({ row, column: { accessor: key } }) => {
  const { isEditMode, customSqlNo } = row;
  const errorText = checkAlphaNumeric(row[key], key);
  return isEditMode ? (
    <TextField
      size="small"
      fullWidth
      defaultValue={row[key]}
      onChange={(e) => row.editRow(row.uniqueId, key, e.target.value)}
      error={!row.isInitLoad && errorText}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStyles}
      disabled={customSqlNo}
    />
  ) : (
    row[key]
  );
};

export const ValuesEditableCell = ({ row, column: { accessor: key } }) => {
  const { isEditMode } = row;
  // const errorText = checkAlphaNumeric(row[key], key);
  const errorText =
    row[key] && !isVlcTildSaparated(row[key])
      ? "LOV must be separated by a tilde “~”"
      : false;
  return isEditMode ? (
    <TextField
      size="small"
      fullWidth
      defaultValue={row[key]}
      onChange={(e) => row.editRow(row.uniqueId, key, e.target.value)}
      error={!row.isInitLoad && errorText ? true : false}
      helperText={!row.isInitLoad ? errorText : ""}
      {...fieldStyles}
    />
  ) : (
    row[key]
  );
};

export const Cell = ({ row, column }) => (
  <div style={{ paddingTop: row.isEditMode ? 12 : 0 }}>
    {row[column.accessor]}
  </div>
);

export const ActionCell = ({ row }) => {
  const {
    uniqueId,
    onRowEdit,
    onRowCancel,
    onRowDelete,
    isEditMode: eMode,
    onRowSave,
    editedCount,
    canUpdateDataFlow,
  } = row;
  if (editedCount > 1) {
    return null;
  }

  return eMode ? (
    <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
      <Button
        size="small"
        style={{ marginRight: 8 }}
        onClick={() => onRowCancel(row)}
      >
        Cancel
      </Button>
      <Button
        size="small"
        variant="primary"
        onClick={() => onRowSave(uniqueId)}
        disabled={!validateRow(row) || !canUpdateDataFlow}
      >
        Save
      </Button>
    </div>
  ) : (
    <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>
      <IconButton
        size="small"
        disabled={!canUpdateDataFlow}
        onClick={() => onRowEdit(row)}
      >
        <Pencil />
      </IconButton>
      <IconButton
        size="small"
        disabled={!canUpdateDataFlow}
        onClick={() => onRowDelete(uniqueId)}
      >
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
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("variableLabel"),
    filterComponent: TextFieldFilter,
  },
  {
    header: "Column Name/Designator",
    accessor: "columnName",
    customCell: ColumnNameCell,
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("columnName"),
    filterComponent: TextFieldFilter,
  },
  {
    header: "Position",
    accessor: "position",
    customCell: PositionEditableCell,
    sortFunction: compareNumbers,
    filterFunction: createStringSearchFilter("position"),
    filterComponent: TextFieldFilter,
    hidden: true,
  },
  {
    header: "Format",
    accessor: "format",
    customCell: FormatCell,
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("format"),
    filterComponent: TextFieldFilter,
  },
  {
    header: "Data Type",
    accessor: "dataType",
    customCell: DataTypeEditableSelectCell(["Alphanumeric", "Numeric", "Date"]),
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("dataType"),
    filterComponent: createSelectFilterComponent(
      ["Alphanumeric", "Numeric", "Date"],
      {
        size: "small",
        multiple: true,
      }
    ),
  },
  {
    header: "Primary Key?",
    accessor: "primaryKey",
    customCell: editablePrimarySelectCell(["Yes", "No"]),
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("primaryKey"),
    filterComponent: createSelectFilterComponent(["Yes", "No"], {
      size: "small",
      multiple: true,
    }),
  },
  {
    header: "Unique?",
    accessor: "unique",
    customCell: makeEditableSelectCell(["Yes", "No"]),
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("unique"),
    filterComponent: createSelectFilterComponent(["Yes", "No"], {
      size: "small",
      multiple: true,
    }),
  },
  {
    header: "Required?",
    accessor: "required",
    customCell: editableSelectCell(["Yes", "No"]),
    sortFunction: compareStrings,
    filterFunction: createStringArraySearchFilter("required"),
    filterComponent: createSelectFilterComponent(["Yes", "No"], {
      size: "small",
      multiple: true,
    }),
  },
  {
    header: "Min length",
    accessor: "minLength",
    customCell: NumericEditableCell,
    sortFunction: compareNumbers,
    filterFunction: createStringSearchFilter("minLength"),
    filterComponent: TextFieldFilter,
  },
  {
    header: "Max length",
    accessor: "maxLength",
    customCell: NumericEditableCell,
    sortFunction: compareNumbers,
    filterFunction: createStringSearchFilter("maxLength"),
    filterComponent: TextFieldFilter,
  },
  {
    header: "List of values",
    accessor: "values",
    customCell: ValuesEditableCell,
    sortFunction: compareStrings,
    filterFunction: createStringSearchFilter("values"),
    filterComponent: TextFieldFilter,
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
  dsTestLock,
  dsProdLock,
  toggleFilters,
  changeHandler,
  haveHeader,
  editedCount,
  protId,
}) => {
  const { canUpdate: canUpdateDataFlow, canCreate: CanCreateDataFlow } =
    useStudyPermission(
      Categories.CONFIGURATION,
      Features.DATA_FLOW_CONFIGURATION,
      protId
    );
  return (
    <div>
      <Grid container alignItems="center">
        {editedCount > 1 && (
          <>
            <Button
              size="small"
              style={{ marginRight: 8 }}
              onClick={onCancelAll}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="primary"
              onClick={onSaveAll}
              disabled={disableSaveAll || !canUpdateDataFlow}
            >
              Save All
            </Button>
          </>
        )}
        {!isMultiAdd && (
          <>
            {isSftp(locationType) && (
              <Tooltip
                title={!editedCount && "Add columns"}
                disableFocusListener
              >
                <IconMenuButton
                  id="actions-1"
                  menuItems={addMenuItems}
                  size="small"
                  disabled={editedCount}
                >
                  <Plus />
                </IconMenuButton>
              </Tooltip>
            )}
            <Tooltip title={!editedCount && "Edit all"} disableFocusListener>
              <IconButton
                color="primary"
                size="small"
                disabled={editedCount || !canUpdateDataFlow}
              >
                <Pencil onClick={onEditAll} />
              </IconButton>
            </Tooltip>
          </>
        )}
        {isMultiAdd && (
          <>
            <TextField
              placeholder="# of columns"
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
            <Button
              size="small"
              variant="primary"
              disabled={!canUpdateDataFlow}
              onClick={addMulti}
            >
              Add
            </Button>
          </>
        )}
        {isSftp(locationType) && (
          <Tooltip
            title={
              (!editedCount || !dsProdLock || !dsTestLock || haveHeader) &&
              "Import dataset column settings"
            }
            disableFocusListener
          >
            <IconButton
              color="primary"
              size="small"
              disabled={
                editedCount ||
                dsProdLock ||
                dsTestLock ||
                !haveHeader ||
                !canUpdateDataFlow
              }
              onClick={changeHandler}
            >
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
          disabled={editedCount}
        />
        <Button
          size="small"
          variant="secondary"
          icon={Filter}
          // disabled={editedCount}
          onClick={toggleFilters}
        >
          Filter
        </Button>
        <IconMenuButton
          disabled={editedCount}
          id="actions-2"
          menuItems={menuItems}
          size="small"
        >
          <EllipsisVertical />
        </IconMenuButton>
      </Grid>
    </div>
  );
};
