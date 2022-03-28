/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/button-has-type */
import React, { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "apollo-react/components/Table";
import TextField from "apollo-react/components/TextField";
import Link from "apollo-react/components/Link";
import Modal from "apollo-react/components/Modal";

import { MessageContext } from "../../../components/Providers/MessageProvider";
import { CustomHeader, columns } from "./DSCTableHelper";
import { downloadTemplate } from "../../../utils/downloadData";
import {
  createDatasetColumns,
  updateDatasetColumns,
} from "../../../store/actions/DataSetsAction";
import { deleteCD, updateLOV } from "../../../services/ApiServices";
import { getUserInfo } from "../../../utils/index";

export default function DSColumnTable({
  numberOfRows,
  dataOrigin,
  formattedData,
  locationType,
  testLock,
  prodLock,
}) {
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const dataSets = useSelector((state) => state.dataSets);
  const { selectedDataset } = dataSets;
  const { fileType, datasetid, headerrownumber, headerRowNumber } =
    selectedDataset;

  const initialRows = Array.from({ length: numberOfRows }, (i, index) => ({
    uniqueId: `u${index}`,
    columnId: index + 1,
    variableLabel: "",
    columnName: "",
    position: "",
    format: "",
    dataType: "",
    primary: "No",
    unique: "No",
    required: "No",
    minLength: "",
    maxLength: "",
    values: "",
    isInitLoad: true,
    isHavingError: false,
    isHavingColumnName: false,
  }));

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [editedRows, setEditedRows] = useState(initialRows);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showOverWrite, setShowOverWrite] = useState(false);
  const [showViewLOVs, setShowViewLOVs] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditAll, setIsEditAll] = useState(false);
  const [isEditLOVs, setIsEditLOVs] = useState(false);
  const [isMultiAdd, setIsMultiAdd] = useState(false);
  const [newRows, setNewRows] = useState("");
  const [disableSaveAll, setDisableSaveAll] = useState(true);
  const [moreColumns, setMoreColumns] = useState([...columns]);
  const userInfo = getUserInfo();

  useEffect(() => {
    const initRows = initialRows.map((e) => e.uniqueId);
    if (dataOrigin === "manually") {
      setSelectedRows([...initRows]);
      setEditedRows(initialRows);
    } else {
      setEditedRows(formattedData);
      setRows(formattedData);
    }
  }, []);

  useEffect(() => {
    if (rows.length) {
      setFilteredRows(rows);
    }
  }, [rows]);

  useEffect(() => {
    const allColumns = editedRows.map((e) => e.isHavingColumnName);
    if (allColumns.every((e) => e === true)) {
      setDisableSaveAll(false);
    } else {
      setDisableSaveAll(true);
    }
  }, [editedRows]);

  useEffect(() => {
    if (selectedRows.length > 0) {
      setIsEditAll(true);
      setEditMode(true);
    } else {
      setIsEditAll(false);
      setEditMode(false);
    }
  }, [selectedRows]);

  const handleViewLOV = (row) => {
    setShowViewLOVs(true);
    setSelectedRow(row);
  };

  const handleSaveLOV = () => {
    if (selectedRow.dbColumnId) {
      updateLOV({
        userId: userInfo.userId,
        columnId: selectedRow.dbColumnId,
        dsId: datasetid,
        dpId: "",
        dfId: "",
        lov: selectedRow.values,
      });
    }
  };

  const onChangeLOV = (e) => {
    const newValues = e.target.value;
    setSelectedRow({ ...selectedRow, values: newValues });
  };

  const hideViewLOVs = () => {
    setShowViewLOVs(false);
    setIsEditLOVs(false);
    setSelectedRow(null);
  };

  const LinkCell = ({ row }) => {
    if (row.editMode) {
      return <></>;
    }
    return <Link onClick={() => handleViewLOV(row)}>View LOVs</Link>;
  };

  const searchRows = (e) => {
    // eslint-disable-next-line prefer-destructuring
    setSearchValue(e.target.value);
    const value = e.target.value?.toLowerCase();
    const filteredRowsTemp = rows?.filter((rw) => {
      return (
        rw?.variableLabel?.toLowerCase().includes(value) ||
        rw?.columnName?.toLowerCase().includes(value) ||
        rw?.position?.toLowerCase().includes(value) ||
        rw?.format?.toLowerCase().includes(value) ||
        rw?.dataType?.toLowerCase().includes(value) ||
        rw?.primary?.toLowerCase().includes(value) ||
        rw?.unique?.toLowerCase().includes(value) ||
        rw?.required?.toLowerCase().includes(value) ||
        rw?.minLength?.toString().includes(value) ||
        rw?.maxLength?.toString().includes(value) ||
        rw?.values?.toLowerCase().includes(value)
      );
    });
    // console.log(filteredRowsTemp, "filteredRowsTemp");
    setFilteredRows([...filteredRowsTemp]);
  };

  const addSingleRow = () => {
    if (rows.length < 500) {
      const singleRow = [
        {
          uniqueId: `u${rows.length}`,
          columnId: rows.length + 1,
          variableLabel: "",
          columnName: "",
          position: "",
          format: "",
          dataType: "",
          primary: "No",
          unique: "No",
          required: "No",
          minLength: "",
          maxLength: "",
          values: "",
          isInitLoad: true,
          isHavingError: false,
          isHavingColumnName: false,
        },
      ];
      setSelectedRows([...selectedRows, `u${rows.length}`]);
      setEditedRows([...rows, ...singleRow]);
    } else {
      messageContext.showErrorMessage(`Not Allowed More than 500 Columns`);
    }
  };

  const addMultipleRows = () => {
    setIsMultiAdd(true);
  };

  const cancelMulti = () => {
    setIsMultiAdd(false);
    setNewRows("");
  };

  const addMulti = () => {
    setIsMultiAdd(false);
    if (newRows > 0) {
      const multiRows = Array.from({ length: newRows }, (i, index) => ({
        uniqueId: `u${rows.length + index}`,
        columnId: rows.length + index + 1,
        variableLabel: "",
        columnName: "",
        position: "",
        format: "",
        dataType: "",
        primary: "No",
        unique: "No",
        required: "No",
        minLength: "",
        maxLength: "",
        values: "",
        isInitLoad: true,
        isHavingError: false,
        isHavingColumnName: false,
      }));
      const moreRows = multiRows.map((e) => e.uniqueId);
      setSelectedRows([...moreRows]);
      setEditedRows([...editedRows, ...multiRows]);
      setNewRows("");
    }
  };

  const downloadTable = () => {
    console.log("Download Table");
  };

  const addNewRows = (value) => {
    const total = parseInt(rows.length, 10) + parseInt(value, 10);
    if (total < 500) {
      setNewRows(parseInt(value, 10));
    } else if (total) {
      messageContext.showErrorMessage(`Not Allowed More than 500 Columns`);
    }
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
      text: "Add 1 column definition",
      onClick: addSingleRow,
    },
    {
      text: "Add multiple column definitions",
      onClick: addMultipleRows,
    },
  ];

  const columnsToAdd = [
    {
      header: "",
      accessor: "uniqueId",
      customCell: LinkCell,
    },
  ];

  const allColumns = [
    ...columns.map((column) => ({ ...column })).slice(0, -1),
    ...columnsToAdd.map((column) => ({ ...column })),
    columns.slice(-1)[0],
  ];

  useEffect(() => {
    if (headerrownumber > 0 || headerRowNumber > 0) {
      const data = allColumns.map((e) => {
        if (e.accessor === "position") {
          e.hidden = true;
        }
        return e;
      });
      setMoreColumns(data);
    } else {
      const data = allColumns.map((e) => {
        if (e.accessor === "columnName") {
          e.hidden = true;
        }
        return e;
      });
      setMoreColumns(data);
    }
  }, []);

  const onEditAll = () => {
    if (rows.length > 0) {
      const allRows = rows.map((e) => e.uniqueId);
      setEditedRows(rows);
      setSelectedRows([...allRows]);
      setIsEditAll(true);
    } else {
      messageContext.showErrorMessage(
        `No Data In Table, Please Add Data and try again`
      );
    }
  };

  const onSaveAll = () => {
    const removeSpaces = editedRows
      .map((e) => {
        e.values = e.values.trim();
        e.columnName = e.columnName.trim();
        return e;
      })
      .map((e) => {
        const isFirst = e.values.charAt(0) === "~";
        const isLast = e.values.charAt(e.values.length - 1) === "~";
        if (isFirst) {
          e.values = e.values.substring(1);
        }
        if (isLast) {
          e.values = e.values.slice(0, -1);
        }
        return e;
      });
    // console.log("save all edited, rows", editedRows, rows);
    setRows([...removeSpaces]);
    setSelectedRows([]);
    setEditedRows(rows);
    dispatch(createDatasetColumns(rows, datasetid));
  };

  const onCancelAll = () => {
    setSelectedRows([]);
    setEditedRows([...rows]);
  };

  const onRowCancel = (uniqueId) => {
    const removeRow = selectedRows.filter((e) => e !== uniqueId);
    const removeEdited = editedRows.filter((e) => e.uniqueId !== uniqueId);
    // console.log("row cancel", uniqueId, removeRow, removeEdited);
    setEditedRows(removeEdited);
    setSelectedRows([...removeRow]);
  };

  const formatSave = (inArray) => {
    const formatted = inArray;
    return formatted;
  };

  const onRowSave = async (uniqueId) => {
    const removeRow = selectedRows.filter((e) => e !== uniqueId);
    const removeEdited = editedRows.filter((e) => e !== uniqueId);
    const editedRowData = editedRows
      .map((e) => {
        e.values = e.values.trim();
        e.columnName = e.columnName.trim();
        return e;
      })
      .map((e) => {
        const isFirst = e.values.charAt(0) === "~";
        const isLast = e.values.charAt(e.values.length - 1) === "~";
        if (isFirst) {
          e.values = e.values.substring(1);
        }
        if (isLast) {
          e.values = e.values.slice(0, -1);
        }
        return e;
      })
      .find((e) => e.uniqueId === uniqueId);
    const removeExistingRowData = rows.filter((e) => e.uniqueId !== uniqueId);
    if (editedRowData?.dbColumnId) {
      dispatch(updateDatasetColumns([editedRowData], datasetid));
    } else {
      dispatch(createDatasetColumns([editedRowData], datasetid));
    }
    setRows([...removeExistingRowData, editedRowData]);
    setEditedRows([...removeEdited]);
    setSelectedRows([...removeRow]);
  };

  const onRowEdit = (uniqueId) => {
    setSelectedRows([...selectedRows, uniqueId]);
    setEditedRows(rows);
  };

  const onRowDelete = async (uniqueId) => {
    const isInDB = rows.find((row) => row.uniqueId === uniqueId);
    if (isInDB) {
      const id = isInDB.dbColumnId;
      await deleteCD(id);
    }
    setRows(rows.filter((row) => row.uniqueId !== uniqueId));
    setEditedRows(editedRows.filter((row) => row.uniqueId !== uniqueId));
  };

  // const showColumnNameRequried = () => {
  //   messageContext.showErrorMessage("Column Name Should be there");
  // };

  const editRow = (uniqueId, key, value, errorTxt) => {
    // console.log(uniqueId, "ColumdId");
    setEditedRows((rws) =>
      rws.map((row) => {
        if (row.uniqueId === uniqueId) {
          if (key === "columnName" || key === "position") {
            if (value.length >= 1) {
              return {
                ...row,
                [key]: value,
                isHavingColumnName: true,
              };
            }
            // showColumnNameRequried();
            return {
              ...row,
              [key]: value,
              isHavingColumnName: false,
            };
          }
          if (row.isInitLoad) {
            return {
              ...row,
              [key]: value,
              isInitLoad: false,
              isHavingError: true,
            };
          }

          return {
            ...row,
            [key]: value,
          };
        }
        return row;
      })
    );
  };

  const hideOverWrite = () => {
    setShowViewLOVs(false);
  };

  const handleOverWrite = () => {
    console.log("handle overwrite");
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        {console.log(
          "data",
          rows,
          editedRows,
          formattedData,
          dataOrigin,
          moreColumns
        )}
        <Table
          title="Dataset Column Settings"
          subtitle={`${
            rows.length > 1
              ? `${editedRows.length} dataset columns`
              : `${editedRows.length} dataset column`
          }`}
          columns={moreColumns}
          initialSortedColumn="uniqueId"
          initialSortOrder="asc"
          rowId="uniqueId"
          hasScroll={true}
          rows={(editMode ? editedRows : filteredRows).map((row, i) => ({
            ...row,
            onRowDelete,
            editRow,
            onRowSave,
            columnNo: parseInt(i, 10) + parseInt(1, 10),
            editMode: selectedRows?.includes(row.uniqueId),
            fileType,
            isEditAll,
            onRowCancel,
            onRowEdit,
            testLock,
            prodLock,
            locationType,
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
            onCancelAll,
            onSaveAll,
            onEditAll,
            isEditAll,
            editMode,
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
            testLock,
            prodLock,
          }}
        />
      </div>
      <Modal
        open={showViewLOVs}
        scroll="paper"
        title={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <>
            <div className="lov-title">List of Values</div>
            <div className="lov-count">No of Values</div>
          </>
        }
        onClose={hideViewLOVs}
        message={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <>
            <div className="lov-modal">
              <div className="lov-quote">
                Values separated by ~ (tilde). Multiple word values placed in
                quotations.
              </div>

              {isEditLOVs ? (
                <div className="lov-edit-mode">
                  <TextField
                    value={selectedRow.values}
                    onChange={(e) => onChangeLOV(e)}
                    sizeAdjustable
                    minWidth={300}
                    minHeight={278}
                  />
                </div>
              ) : (
                <div className="lov-view-mode">
                  {`${selectedRow && selectedRow.values}`}
                </div>
              )}
            </div>
          </>
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
}
