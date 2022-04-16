/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/button-has-type */
import React, { useState, useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
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
import { deleteCD } from "../../../services/ApiServices";
import {
  getUserInfo,
  checkHeaders,
  formatData,
  isSftp,
} from "../../../utils/index";
import { allowedTypes } from "../../../constants";

const maxSize = 150000;

export default function DSColumnTable({
  numberOfRows,
  dataOrigin,
  formattedData,
  locationType,
  dfId,
  dpId,
}) {
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const dashboard = useSelector((state) => state.dashboard);
  const { selectedCard } = dashboard;
  const { protocolnumber } = selectedCard;
  const dataSets = useSelector((state) => state.dataSets);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { selectedDataset } = dataSets;
  const {
    type: fileType,
    datasetid: dsId,
    headerrownumber,
    headerRowNumber,
    customsql,
    customsql_yn: customQuery,
    tbl_nm: tableName,
  } = selectedDataset;
  const { dsProdLock, dsTestLock } = dataFlow;
  const initialRows = Array.from({ length: numberOfRows }, (i, index) => ({
    uniqueId: `u${index}`,
    columnId: index + 1,
    variableLabel: "",
    columnName: "",
    position: "",
    format: "",
    dataType: "",
    primaryKey: "No",
    unique: "No",
    required: "No",
    minLength: "",
    maxLength: "",
    values: "",
    isInitLoad: true,
    isHavingError: false,
    isHavingColumnName: false,
    isHavingDataType: false,
  }));

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [editedRows, setEditedRows] = useState(initialRows);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [importedData, setImportedData] = useState([]);
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [showOverWrite, setShowOverWrite] = useState(false);
  const [showViewLOVs, setShowViewLOVs] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditAll, setIsEditAll] = useState(false);
  const [isEditLOVs, setIsEditLOVs] = useState(false);
  const [isMultiAdd, setIsMultiAdd] = useState(false);
  const [pkDisabled, setPkDisabled] = useState(false);
  const [isColumnMandatory, setIsColumnMandatory] = useState(false);
  const [newRows, setNewRows] = useState("");
  const [disableSaveAll, setDisableSaveAll] = useState(true);
  const [moreColumns, setMoreColumns] = useState([...columns]);
  const [selectedCN, setSelectedCN] = useState([]);
  const userInfo = getUserInfo();

  useEffect(() => {
    const initRows = initialRows.map((e) => e.uniqueId);
    if (dataOrigin === "manually") {
      setSelectedRows([...initRows]);
      setEditedRows(initialRows);
    } else if (dataOrigin === "fromDB") {
      setRows(formattedData);
      setEditedRows(formattedData);
      // setDisableSaveAll(false);
    } else {
      const forImport = formattedData.map((e) => e.uniqueId);
      setSelectedRows(forImport);
      setEditedRows(formattedData);
      setDisableSaveAll(false);
    }
  }, []);

  useEffect(() => {
    if (!isSftp(locationType)) {
      if (dsTestLock || dsProdLock) {
        setPkDisabled(true);
      } else {
        setPkDisabled(false);
      }
    } else if (dsProdLock) {
      setPkDisabled(true);
    } else {
      setPkDisabled(false);
    }
  }, [locationType, dsTestLock, dsProdLock]);

  useEffect(() => {
    if (rows.length) {
      setFilteredRows(rows);
    }
  }, [rows]);

  useEffect(() => {
    const allColumnNames = editedRows.map((e) => e.isHavingColumnName);
    const allDataTypes = editedRows.map((e) => e.isHavingDataType);
    if (
      allColumnNames.every((e) => e === true) &&
      allDataTypes.every((e) => e === true)
    ) {
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

  const handleSaveLOV = async () => {
    if (selectedRow.dbColumnId) {
      const newQuery = "";
      dispatch(
        updateDatasetColumns(
          [{ ...selectedRow }],
          dsId,
          dfId,
          dpId,
          userInfo.userId,
          customQuery === "No",
          newQuery
        )
      );
      // updateLOV({
      //   userId: userInfo.userId,
      //   columnId: selectedRow.dbColumnId,
      //   dsId,
      //   dpId,
      //   dfId,
      //   lov: selectedRow.values,
      // });
    }
  };

  // const handleNoHeaders = () => {
  //   messageContext.showErrorMessage(
  //     `Import is not available for files with no header row.`
  //   );
  //   handleDelete();
  // };

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
      setShowOverWrite(false);
      const correctHeader = checkHeaders(importedData);
      if (correctHeader) {
        const newData = formatData(importedData, protocolnumber);
        // eslint-disable-next-line no-unused-expressions
        if (newData.length > 0) {
          const initRows = newData.map((e) => e.uniqueId);
          setRows([...newData]);
          setEditedRows([...newData]);
          setSelectedRows([...initRows]);
        } else {
          messageContext.showErrorMessage(
            `Protocol Number in file does not match protocol number ‘${protocolnumber}’ for this data flow. Please make sure these match and try again`
          );
          hideOverWrite();
        }
      } else {
        messageContext.showErrorMessage(
          `The Selected File Does Not Match the Template`
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
        rw?.position?.toString().includes(value) ||
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
          primaryKey: "No",
          unique: "No",
          required: "No",
          minLength: "",
          maxLength: "",
          values: "",
          isInitLoad: true,
          isHavingError: false,
          isHavingColumnName: false,
          isHavingDataType: false,
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
        primaryKey: "No",
        unique: "No",
        required: "No",
        minLength: "",
        maxLength: "",
        values: "",
        isInitLoad: true,
        isHavingError: false,
        isHavingColumnName: false,
        isHavingDataType: false,
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
    if (isSftp(locationType)) {
      if (headerrownumber > 0 || headerRowNumber > 0) {
        const data = allColumns.map((e) => {
          if (e.accessor === "position") {
            e.hidden = true;
          }
          return e;
        });
        setMoreColumns(data);
      } else {
        setMoreColumns(allColumns);
      }
    } else {
      const data = allColumns.map((e) => {
        if (e.accessor === "position") {
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

  const toFindDuplicates = (arry) => {
    arry.some((element, index) => {
      return arry.indexOf(element) !== index;
    });
    return false;
  };

  const onSaveAll = async () => {
    const removeSpaces = await editedRows
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

    if (!toFindDuplicates(removeSpaces)) {
      setRows([...removeSpaces]);
      setSelectedRows([]);
      setEditedRows(rows);
      const existingCD = await removeSpaces.filter((e) => e.dbColumnId);
      const newCD = await removeSpaces.filter((e) => !e.dbColumnId);
      let newQuery = "";
      if (customQuery === "No") {
        const columnList = removeSpaces.map((e) => e.columnName).join(", ");
        const wherePart = customsql?.indexOf("where");
        if (wherePart) {
          newQuery = `Select ${columnList} from ${tableName} ${customsql.slice(
            wherePart
          )}`;
        }
      }

      if (newCD && newCD.length > 0) {
        dispatch(
          createDatasetColumns(
            newCD,
            dsId,
            dfId,
            dpId,
            userInfo.userId,
            customQuery === "No",
            newQuery
          )
        );
      }

      if (existingCD && existingCD.length > 0) {
        dispatch(
          updateDatasetColumns(
            existingCD,
            dsId,
            dfId,
            dpId,
            userInfo.userId,
            customQuery === "No",
            newQuery
          )
        );
      }
    }
  };

  const onCancelAll = () => {
    setSelectedRows([]);
    setEditedRows([...rows]);
  };

  const onRowCancel = (uniqueId) => {
    const removeRow = selectedRows.filter((e) => e !== uniqueId);
    const removeEdited = editedRows.filter((e) => e.uniqueId !== uniqueId);
    setEditedRows(removeEdited);
    setSelectedRows([...removeRow]);
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

    let newQuery = "";
    if (customQuery === "No") {
      const selectedList = [...selectedCN, editedRowData?.columnName];
      setSelectedCN(selectedList);
      const splitted = customsql.split("where");
      newQuery = `Select ${selectedList.join(
        ", "
      )} from ${tableName} where ${splitted[1].trim()}`;
    }

    if (editedRowData?.dbColumnId) {
      dispatch(
        updateDatasetColumns(
          [editedRowData],
          dsId,
          dfId,
          dpId,
          userInfo.userId,
          customQuery === "No",
          newQuery
        )
      );
    } else {
      dispatch(
        createDatasetColumns(
          [editedRowData],
          dsId,
          dfId,
          dpId,
          userInfo.userId,
          customQuery === "No",
          newQuery
        )
      );
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
      if (isInDB.dbColumnId !== ("" || undefined || null)) {
        await deleteCD(isInDB.dbColumnId, dsId, dpId, dfId, false, "");
      }
    }
    setRows(rows.filter((row) => row.uniqueId !== uniqueId));
    setEditedRows(editedRows.filter((row) => row.uniqueId !== uniqueId));
  };

  const editRow = (uniqueId, key, value, errorTxt) => {
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
            return {
              ...row,
              [key]: value,
              isHavingColumnName: false,
            };
          }
          if (key === "dataType") {
            if (value.length >= 1) {
              return {
                ...row,
                [key]: value,
                isHavingDataType: true,
              };
            }
            return {
              ...row,
              [key]: value,
              isHavingDataType: false,
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
            dsTestLock,
            dsProdLock,
            locationType,
            pkDisabled,
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
            dsTestLock,
            dsProdLock,
            changeHandler,
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
                { label: "Save", onClick: handleSaveLOV },
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
