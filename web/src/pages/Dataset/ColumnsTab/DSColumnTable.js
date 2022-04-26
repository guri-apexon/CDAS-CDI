/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/button-has-type */
import React, { useState, useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import _ from "lodash";
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
  getDatasetColumns,
} from "../../../store/actions/DataSetsAction";
import { createColumns, deleteCD } from "../../../services/ApiServices";
import {
  getUserInfo,
  checkHeaders,
  formatDataNew,
  isSftp,
} from "../../../utils/index";
import { allowedTypes } from "../../../constants";

const maxSize = 150000;

export default function DSColumnTable({
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
  const { datasetColumns, selectedDataset, haveHeader } = dataSets;
  const {
    type: fileType,
    datasetid: dsId,
    customsql,
    customsql_yn: isCustomSQL,
    tbl_nm: tableName,
  } = selectedDataset;
  const dataFlow = useSelector((state) => state.dataFlow);
  const { dsProdLock, dsTestLock } = dataFlow;

  const initialRows = [
    {
      uniqueId: `u0`,
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
      isFormatLoad: true,
      isHavingError: false,
      isHavingColumnName: false,
      isHavingDataType: false,
    },
  ];

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
  const [newRows, setNewRows] = useState("");
  const [disableSaveAll, setDisableSaveAll] = useState(true);
  const [moreColumns, setMoreColumns] = useState([...columns]);
  const [selectedCN, setSelectedCN] = useState([]);
  const userInfo = getUserInfo();

  useEffect(() => {
    if (dataOrigin === "manually") {
      setSelectedRows([`u0`]);
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
    if (rows.length === datasetColumns) {
      const updatingId = rows.map((e) => {
        const matchingData = datasetColumns.find(
          (d) => d.columnName === e.columnName
        );
        if (matchingData?.columnid) {
          e.dbColumnId = matchingData.columnid;
          e.values = matchingData.lov;
        }
        return e;
      });
      setRows([...updatingId]);
    }
  }, [datasetColumns]);

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

  const handleOverWrite = async () => {
    if (isFilePicked && importedData.length > 1) {
      setShowOverWrite(false);
      const correctHeader = await checkHeaders(importedData);
      if (correctHeader) {
        const newData = formatDataNew(importedData, protocolnumber);
        // eslint-disable-next-line no-unused-expressions
        if (newData?.headerNotMatching) {
          messageContext.showErrorMessage(
            `Protocol Number in file does not match protocol number ‘${protocolnumber}’ for this data flow. Please make sure these match and try again`
          );
          hideOverWrite();
        } else if (newData?.data?.length === 0) {
          messageContext.showErrorMessage(
            `Please add proper data and try with import`
          );
          hideOverWrite();
        } else if (newData?.data?.length > 0) {
          const initRows = newData?.data?.map((e) => e.uniqueId);
          setRows([...newData?.data]);
          setEditedRows([...newData?.data]);
          setSelectedRows([...initRows]);
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

  const handleSaveLOV = async () => {
    if (selectedRow.dbColumnId) {
      const newQuery = "";
      const removeExistingRowData = rows.filter(
        (e) => e.uniqueId !== selectedRow.uniqueId
      );
      const newData = [{ ...selectedRow }]
        .map((e) => {
          e.values = e.values.trim();
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

      dispatch(
        updateDatasetColumns(
          newData,
          dsId,
          dfId,
          dpId,
          userInfo.userId,
          isCustomSQL === "No",
          newQuery
        )
      );
      setRows([...removeExistingRowData, ...newData]);
    }
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
          isFormatLoad: true,
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
        isFormatLoad: true,
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
      disabled: !haveHeader,
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

  const onSaveAll = async () => {
    const removeSpaces = _.map(editedRows, (e) => {
      e.values = e.values.trim();
      e.columnName = e.columnName.trim();
      return e;
    }).map((e) => {
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
    const columnNames = removeSpaces.map((e) => e.columnName);

    if (removeSpaces.length !== _.uniq(columnNames).length) {
      messageContext.showErrorMessage(
        "Column name should be unique for a dataset"
      );
    } else {
      const existingCD = removeSpaces
        .filter((e) => selectedRows.includes(e.uniqueId))
        .filter((e) => e.dbColumnId);
      const newCD = removeSpaces
        .filter((e) => selectedRows.includes(e.uniqueId))
        .filter((e) => !e.dbColumnId);

      setSelectedRows([]);
      setRows([...removeSpaces]);
      setEditedRows(rows);
      let newQuery = "";
      if (isCustomSQL === "No") {
        const columnList = removeSpaces.map((e) => e.columnName).join(", ");
        const wherePart = customsql?.indexOf("where");
        if (wherePart) {
          newQuery = `Select ${columnList} from ${tableName} ${customsql.slice(
            wherePart
          )}`;
        }
      }

      if (newCD && newCD.length > 0) {
        const created = await createColumns({
          values: newCD,
          dsId,
          dfId,
          dpId,
          userId: userInfo.userId,
          isUpdateQuery: isCustomSQL === "No",
          newQuery,
        });
        if (created?.status) {
          created.data?.forEach((d) => {
            const obj = newCD.find((x) => x.uniqueId === d.frontendUniqueRef);
            if (obj) obj.dbColumnId = d.columnid;
          });
        }
      }

      if (existingCD && existingCD.length > 0) {
        await dispatch(
          updateDatasetColumns(
            existingCD,
            dsId,
            dfId,
            dpId,
            userInfo.userId,
            isCustomSQL === "No",
            newQuery
          )
        );
      }

      await dispatch(getDatasetColumns(dsId));
      // setTimeout(() => {
      //   updatingData();
      // }, 2000);
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
    const editedRowData = _.filter(editedRows, (e) => e.uniqueId === uniqueId)
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

    if (
      rows.some(
        (r) =>
          r.columnName === editedRowData.columnName &&
          r.uniqueId !== editedRowData.uniqueId
      )
    ) {
      messageContext.showErrorMessage(
        "Column name should be unique for a dataset"
      );
    } else {
      const removeRow = selectedRows.filter((e) => e !== uniqueId);
      const removeEdited = editedRows.filter((e) => e.uniqueId !== uniqueId);
      const removeExistingRowData = rows.filter((e) => e.uniqueId !== uniqueId);
      let newQuery = "";
      if (isCustomSQL === "No") {
        const selectedList = [...selectedCN, editedRowData?.columnName];
        setSelectedCN(selectedList);
        const splitted = customsql.split("where");
        newQuery = `Select ${selectedList.join(
          ", "
        )} from ${tableName} where ${splitted[1].trim()}`;
      }

      if (editedRowData?.dbColumnId) {
        await dispatch(
          updateDatasetColumns(
            [editedRowData],
            dsId,
            dfId,
            dpId,
            userInfo.userId,
            isCustomSQL === "No",
            newQuery
          )
        );
      } else {
        const created = await createColumns({
          values: [editedRowData],
          dsId,
          dfId,
          dpId,
          userId: userInfo.userId,
          isUpdateQuery: isCustomSQL === "No",
          newQuery,
        });
        if (created?.status) {
          const createdId = created.data[0]?.columnid;
          if (createdId) {
            editedRowData.dbColumnId = createdId;
          }
        }
        console.log("editedRowData::::", editedRowData);
      }

      setRows([...removeExistingRowData, editedRowData]);
      setEditedRows([...removeEdited]);
      setSelectedRows([...removeRow]);
    }
    await dispatch(getDatasetColumns(dsId));
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
          if (
            (key === "columnName" && haveHeader) ||
            (!haveHeader && key === "position")
          ) {
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
              isInitLoad: false,
            };
          }
          if (key === "dataType") {
            if (value.length >= 1) {
              return {
                ...row,
                [key]: value,
                isHavingDataType: true,
                isInitLoad: false,
              };
            }
            return {
              ...row,
              [key]: value,
              isHavingDataType: false,
              isInitLoad: false,
            };
          }

          if (row.isInitLoad || row.isFormatLoad) {
            if (
              key === "primaryKey" ||
              key === "unique" ||
              key === "required" ||
              key === "minLength" ||
              key === "maxLength" ||
              key === "values" ||
              key === "format" ||
              key === "dataType" ||
              key === "columnName"
            ) {
              return {
                ...row,
                [key]: value,
                isInitLoad: false,
                isHavingError: true,
                isFormatLoad:
                  key === "format" || key === "columnName" ? true : false,
              };
            }
          }

          // if (row.isFormatLoad) {
          //   if (key === "format") {
          //     return {
          //       ...row,
          //       [key]: value,
          //       isInitLoad: false,
          //       isFormatLoad: false,
          //       isHavingError: true,
          //     };
          //   }
          // }

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
            haveHeader,
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
            haveHeader,
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
