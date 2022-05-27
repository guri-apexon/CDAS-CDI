/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/button-has-type */
import React, { useState, useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import Table from "apollo-react/components/Table";
import TextField from "apollo-react/components/TextField";
import Link from "apollo-react/components/Link";
import Modal from "apollo-react/components/Modal";
import _ from "lodash";

import { MessageContext } from "../../../../../components/Providers/MessageProvider";
import { CustomHeader, columns } from "./DSCTableHelper";
import { downloadTemplate } from "../../../../../utils/downloadData";
import {
  checkHeaders,
  convertFileData,
  isSftp,
  columnObj,
  getInitColumnObj,
} from "../../../../../utils/index";
import { allowedTypes } from "../../../../../constants";
import { validateRow } from "../../../../../components/FormComponents/validators";

const maxSize = 150000;

export default function DSColumnTable({
  dataOrigin,
  formattedData,
  locationType,
  headerValue,
}) {
  const messageContext = useContext(MessageContext);
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const { selectedCard } = dashboard;
  const { protocolnumber } = selectedCard;
  const { selectedDataset, previewSQL } = dataSets;
  const {
    fileType,
    datasetid,
    headerrownumber,
    headerRowNumber,
    customsql,
    customsql_yn: customQuery,
    tbl_nm: tableName,
  } = selectedDataset;

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [editedBackup, setEditedBackup] = useState([]);
  const [editedRows, setEditedRows] = useState([
    { uniqueId: `u0`, ...columnObj },
  ]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [editedCount, setEditedCount] = useState(0);
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [showOverWrite, setShowOverWrite] = useState(false);
  const [showViewLOVs, setShowViewLOVs] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditAll, setIsEditAll] = useState(false);
  const [isEditLOVs, setIsEditLOVs] = useState(false);
  const [isMultiAdd, setIsMultiAdd] = useState(false);
  const [newRows, setNewRows] = useState("");
  const [disableSaveAll, setDisableSaveAll] = useState(true);
  const [moreColumns, setMoreColumns] = useState([...columns]);
  const [importedData, setImportedData] = useState([]);
  const [noOfValues, setNoOfvalues] = useState("No");
  const initColumnObj = getInitColumnObj();

  const setInitRow = () => {
    setRows([{ uniqueId: 1, ...initColumnObj }]);
  };
  const updateRowsInDf = () => {
    messageContext?.setDataflow({ columnDefinition: rows });
  };
  const changeValuesTitle = (newValues) => {
    const noOf = newValues?.split("~")?.filter(Boolean)?.length || "No";
    setNoOfvalues(noOf);
  };
  const handleViewLOV = (row) => {
    setShowViewLOVs(true);
    changeValuesTitle(row.values);
    setSelectedRow(row);
  };

  const inputFile = useRef(null);

  const changeHandler = () => {
    inputFile.current.click();
  };

  const handleFileUpdate = (event) => {
    const file = event.target.files[0];
    if (
      allowedTypes.length &&
      !allowedTypes.filter((type) => file.type.includes(type)).length
    ) {
      file.errorMessage = `${
        file.name.split(".")[file.name.split(".").length - 1]
      } format is not supported`;
    } else if (maxSize && file.size > maxSize) {
      file.errorMessage = `File is too large (max is ${maxSize} bytes)`;
    }

    setSelectedFile(file);
    setIsFilePicked(true);
    setShowOverWrite(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const readedData = XLSX.read(data, { type: "binary" });
      const wsname = readedData.SheetNames[0];
      const ws = readedData.Sheets[wsname];
      const dataParse = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setImportedData(dataParse);
    };
    reader.readAsBinaryString(file);
  };

  const hideOverWrite = () => {
    setShowOverWrite(false);
    setIsFilePicked(false);
    setSelectedFile(null);
    setImportedData([]);
  };

  const handleOverWrite = () => {
    if (isFilePicked && importedData.length > 1) {
      // console.log(importedData);
      setShowOverWrite(false);
      const correctHeader = checkHeaders(importedData);
      if (correctHeader) {
        const newData = convertFileData(importedData, protocolnumber);
        // eslint-disable-next-line no-unused-expressions
        if (newData.length > 0) {
          // const initRows = newData.map((e) => e.uniqueId);
          setRows([...newData]);
          // setEditedRows([...newData]);
          // setSelectedRows([...initRows]);
        } else {
          messageContext.showErrorMessage(
            `Protocol number in file does not match protocol number ‘${protocolnumber}’ for this data flow. Please make sure these match and try again`
          );
          hideOverWrite();
        }
      } else {
        messageContext.showErrorMessage(
          `The selected file does not match the template`
        );
        hideOverWrite();
      }
    } else {
      setSelectedFile(null);
      setIsFilePicked(false);
      setShowOverWrite(false);
      messageContext.showErrorMessage(
        "File not picked correctly please try again"
      );
    }
  };

  const onChangeLOV = (e) => {
    const newValues = e.target.value;
    setSelectedRow({ ...selectedRow, values: newValues });
    changeValuesTitle(newValues);
  };

  const hideViewLOVs = () => {
    setShowViewLOVs(false);
    setIsEditLOVs(false);
    setSelectedRow(null);
  };

  const handleSaveLOV = () => {
    const newData = [{ ...selectedRow }]
      .map((e) => {
        e.values = e.values.toString().trim();
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

    const removeExistingRowData = rows.filter(
      (e) => e.uniqueId !== selectedRow.uniqueId
    );

    const newRowData = _.orderBy(
      [...removeExistingRowData, ...newData],
      ["uniqueId"],
      ["asc"]
    );
    setRows([...newRowData]);
    hideViewLOVs();
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
        rw?.primaryKey?.toLowerCase().includes(value) ||
        rw?.unique?.toLowerCase().includes(value) ||
        rw?.required?.toLowerCase().includes(value) ||
        rw?.minLength?.toString().includes(value) ||
        rw?.maxLength?.toString().includes(value) ||
        rw?.values?.toLowerCase().includes(value)
      );
    });
    setFilteredRows([...filteredRowsTemp]);
  };

  const getNewRows = (count = 1) => {
    const maxIndex = Math.max(...rows.map((o) => o.uniqueId), 0);
    const data = Array.from({ length: count }, (i, index) => ({
      uniqueId: maxIndex + index + 1,
      ...initColumnObj,
    }));
    return data;
  };
  const addSingleRow = () => {
    if (rows.length < 500) {
      const singleRow = getNewRows();
      setRows([...rows, ...singleRow]);
    } else {
      messageContext.showErrorMessage(`Not allowed more than 500 columns`);
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
      const multiRows = getNewRows(newRows);
      setRows([...rows, ...multiRows]);
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
      messageContext.showErrorMessage(`Not allowed more than 500 columns`);
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
      disabled: true,
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

  const toggleEditMode = (cancel) => {
    setRows((prevRows) => {
      let data;
      if (cancel) {
        if (cancel === "Single" && editedBackup?.length) {
          data = prevRows.map((x, i) =>
            x.uniqueId === editedBackup[0].uniqueId
              ? { ...x, ...editedBackup[0] }
              : x
          );
        } else {
          data = (editedBackup.length > 1 ? editedBackup : prevRows).filter(
            (e) => e.isSaved
          );
        }
      } else {
        data = prevRows;
      }
      return data.map((r) => ({
        ...r,
        isEditMode: cancel ? false : true,
      }));
    });
    setEditedBackup([]);
  };
  const getEditedRows = () => {
    return rows.filter((x) => x.isEditMode);
  };
  const onEditAll = () => {
    if (rows.length > 0) {
      toggleEditMode();
      setEditedBackup([...rows]);
    } else {
      messageContext.showErrorMessage(
        `No data in table, please add data and try again`
      );
    }
  };

  const onSaveAll = async () => {
    const formattedColumnData = getEditedRows()
      .map((e) => {
        const d = {
          ...e,
          values: e.values.toString().trim(),
          columnName: e.columnName.toString().trim(),
        };
        return d;
      })
      .map((e) => {
        const hasAtFirst = e.values.charAt(0) === "~";
        const hasAtLast = e.values.charAt(e.values.length - 1) === "~";
        if (hasAtFirst) {
          e.values = e.values.substring(1);
        }
        if (hasAtLast) {
          e.values = e.values.slice(0, -1);
        }
        return e;
      });

    const columnNames = formattedColumnData.map((e) =>
      e.columnName.toLowerCase()
    );

    if (formattedColumnData.length !== _.uniq(columnNames).length) {
      messageContext.showErrorMessage(
        "Column name should be unique for a dataset"
      );
      return false;
    }
    setRows((prevRows) =>
      prevRows.map((x) => ({ ...x, isEditMode: false, isSaved: true }))
    );
  };

  const onCancelAll = () => {
    toggleEditMode("All");
  };

  const onRowCancel = (row) => {
    if (row.isSaved) {
      toggleEditMode("Single");
    } else {
      setRows((prevRows) =>
        prevRows.filter((e) => e.uniqueId !== row.uniqueId)
      );
    }
  };

  const formatSave = (inArray) => {
    const formatted = inArray;
    return formatted;
  };

  // const generateColumn = (arr) => {
  //   const cName = arr.map((e) => e.columnName).join(", ");
  // };

  const onRowSave = async (uniqueId) => {
    const editedRowData = _.filter(
      getEditedRows(),
      (e) => e.uniqueId === uniqueId
    )
      .map((e) => {
        const d = {
          ...e,
          isSaved: true,
          values: e.values.toString().trim(),
          columnName: e.columnName.toString().trim(),
          isEditMode: false,
        };
        return d;
      })
      .map((e) => {
        const hasAtFirst = e.values.charAt(0) === "~";
        const hasAtLast = e.values.charAt(e.values.length - 1) === "~";
        if (hasAtFirst) {
          e.values = e.values.substring(1);
        }
        if (hasAtLast) {
          e.values = e.values.slice(0, -1);
        }
        return e;
      })
      .find((e) => e.uniqueId === uniqueId);

    if (
      rows.some(
        (r) =>
          r.columnName.toLowerCase() ===
            editedRowData.columnName.toLowerCase() &&
          r.uniqueId !== editedRowData.uniqueId
      )
    ) {
      messageContext.showErrorMessage(
        "Column name should be unique for a dataset"
      );
      return false;
    }

    // const removeRow = selectedRows.filter((e) => e !== uniqueId);
    // const removeEdited = editedRows.filter((e) => e.uniqueId !== uniqueId);
    const removeExistingRowData = rows.filter((e) => e.uniqueId !== uniqueId);
    setRows([...removeExistingRowData, editedRowData]);
  };

  const onRowEdit = (row) => {
    console.log("row", row);
    setEditedBackup([{ ...row }]);
    setRows((prevRows) =>
      prevRows.map((e) => {
        return { ...e, isEditMode: e.uniqueId === row.uniqueId };
      })
    );
  };

  const onRowDelete = async (uniqueId) => {
    setRows((prevRows) => prevRows.filter((e) => e.uniqueId !== uniqueId));
  };

  const haveHeader = parseInt(headerValue, 10) > 0;

  // const showColumnNameRequried = () => {
  //   messageContext.showErrorMessage("Column name Should be there");
  // };

  const editRow = (uniqueId, key, value) => {
    setRows((rws) =>
      rws.map((row) => {
        if (row.uniqueId === uniqueId) {
          const data = {
            ...row,
            [key]: value,
            isInitLoad: Boolean(key === "variableLabel"),
          };
          return {
            ...data,
          };
        }
        return row;
      })
    );
  };

  useEffect(() => {
    const editedlength = getEditedRows().length;
    setEditedCount(editedlength);
    if (editedlength && rows.some((row) => !validateRow(row))) {
      setDisableSaveAll(true);
    } else {
      setDisableSaveAll(false);
    }
    if (rows.every((x) => !x.isEditMode)) {
      updateRowsInDf();
    }
    // setFilteredRows(rows);
  }, [rows]);

  // useEffect(() => {
  //   if (selectedRows.length > 0) {
  //     setIsEditAll(true);
  //     setEditMode(true);
  //   } else {
  //     setIsEditAll(false);
  //     setEditMode(false);
  //   }
  // }, [selectedRows]);

  useEffect(() => {
    if (isSftp(locationType)) {
      if (haveHeader) {
        setMoreColumns(allColumns);
      } else {
        const data = allColumns.map((e) => {
          if (e.accessor === "position") {
            e.hidden = false;
          }
          return e;
        });
        setMoreColumns(data);
      }
    } else {
      setMoreColumns(allColumns);
    }
    const formatRows = formattedData.map((e) => e.uniqueId);
    if (dataOrigin === "fileUpload") {
      setRows([...formattedData]);
    } else if (dataOrigin === "fromDB") {
      setRows([...formattedData]);
    } else if (dataOrigin === "manually") {
      setInitRow();
    }
    if (previewSQL?.length) {
      addMulti(previewSQL);
    }
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <input
          type="file"
          id="file"
          ref={inputFile}
          onChange={handleFileUpdate}
          style={{ display: "none" }}
        />
        <Table
          title="Dataset Column Settings"
          subtitle={`${
            rows.length > 1
              ? `${rows.length} dataset columns`
              : `${rows.length} dataset column`
          }`}
          columns={moreColumns}
          initialSortedColumn="uniqueId"
          initialSortOrder="asc"
          rowId="uniqueId"
          hasScroll={true}
          rows={rows.map((row, i) => ({
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
            locationType,
            haveHeader,
            editedCount,
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
            changeHandler,
            haveHeader,
            editedCount,
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
            <div className="lov-count">{`${noOfValues} of Values`}</div>
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
                    minWidth={340}
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
                { label: "Save", onClick: handleSaveLOV },
                { label: "Cancel", onClick: hideViewLOVs },
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
