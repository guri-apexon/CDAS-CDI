/* eslint-disable consistent-return */
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
  columnObj,
  getInitColumnObj,
} from "../../../utils/index";
import { allowedTypes } from "../../../constants";
import { validateRow } from "../../../components/FormComponents/validators";

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

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [editedRows, setEditedRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [importedData, setImportedData] = useState([]);
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [showOverWrite, setShowOverWrite] = useState(false);
  const [showViewLOVs, setShowViewLOVs] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [noOfValues, setNoOfvalues] = useState("No");
  const [isEditAll, setIsEditAll] = useState(false);
  const [isEditLOVs, setIsEditLOVs] = useState(false);
  const [isMultiAdd, setIsMultiAdd] = useState(false);
  const [pkDisabled, setPkDisabled] = useState(false);
  const [newRows, setNewRows] = useState("");
  const [disableSaveAll, setDisableSaveAll] = useState(true);
  const [moreColumns, setMoreColumns] = useState([...columns]);
  const [selectedCN, setSelectedCN] = useState([]);
  const userInfo = getUserInfo();
  const initColumnObj = getInitColumnObj();

  const setInitRow = () => {
    setRows([{ uniqueId: `u0`, initColumnObj }]);
  };
  useEffect(() => {
    console.log("dataOrigin", dataOrigin, formattedData);
    if (dataOrigin === "manually") {
      // setSelectedRows([`u0`]);
      // setEditedRows([{ uniqueId: `u0`, ...columnObj }]);
      setInitRow();
    } else if (dataOrigin === "fromDB") {
      setRows(formattedData);
      // setEditedRows(formattedData);
      // setDisableSaveAll(false);
    } else {
      setRows(formattedData);
      // setSelectedRows(forImport);
      // setEditedRows(formattedData);
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

  // useEffect(() => {
  //   if (rows.length === datasetColumns) {
  //     const updatingId = rows.map((e) => {
  //       const matchingData = datasetColumns.find(
  //         (d) => d.columnName === e.columnName
  //       );
  //       if (matchingData?.columnid) {
  //         e.dbColumnId = matchingData.columnid;
  //         e.values = matchingData.lov;
  //       }
  //       return e;
  //     });
  //     setRows([...updatingId]);
  //   }
  // }, [datasetColumns]);

  // useEffect(() => {
  //   if (
  //     rows
  //       .filter((x) => x.isEditMode)
  //       .map((row) => validateRow(row))
  //       .every((e) => e === true)
  //   ) {
  //     setDisableSaveAll(false);
  //   } else {
  //     setDisableSaveAll(true);
  //   }
  // }, [rows]);

  // useEffect(() => {
  //   console.log("selectedRows", selectedRows);
  //   // if (selectedRows.length > 0) {
  //   //   setIsEditAll(true);
  //   //   setEditMode(true);
  //   // } else {
  //   //   setIsEditAll(false);
  //   //   setEditMode(false);
  //   // }
  // }, [selectedRows]);

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
          setRows([...newData?.data]);
          // const initRows = newData?.data?.map((e) => e.uniqueId);
          // setEditedRows([...newData?.data]);
          // setSelectedRows([...initRows]);
        }
      } else {
        messageContext.showErrorMessage(
          `The Selected file does not match the template`
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

  const handleSaveLOV = async () => {
    if (selectedRow.dbColumnId) {
      const newQuery = "";
      const removeExistingRowData = rows.filter(
        (e) => e.uniqueId !== selectedRow.uniqueId
      );
      const editedRowData = [{ ...selectedRow }]
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
          editedRowData,
          dsId,
          dfId,
          dpId,
          userInfo.userId,
          isCustomSQL === "No",
          newQuery
        )
      );

      const newData = _.orderBy(
        [...removeExistingRowData, ...editedRowData],
        ["uniqueId"],
        ["asc"]
      );

      setRows([...newData]);
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
  const getNewRows = (count = 1) => {
    const maxIndex = Math.max(...rows.map((o) => o.uniqueId), 0);
    const data = Array.from({ length: count }, (i, index) => ({
      uniqueId: maxIndex + index,
      initColumnObj,
    }));
    return data;
  };
  const addSingleRow = () => {
    if (rows.length < 500) {
      const singleRow = getNewRows();
      setRows([...rows, singleRow]);
      // setSelectedRows([...selectedRows, `u${rows.length}`]);
      // setEditedRows([...rows, ...singleRow]);
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
      // const moreRows = multiRows.map((e) => e.uniqueId);
      // setSelectedRows([...moreRows]);
      // setEditedRows([...editedRows, ...multiRows]);
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
      messageContext.showErrorMessage(`Not allowed more than 500 Columns`);
    }
  };

  const menuItems = [
    {
      text: "Download template",
      onClick: downloadTemplate,
      disabled: !haveHeader,
    },
    {
      text: "Download table",
      disabled: true,
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
  const toggleEditMode = (edit) => {
    setRows((prevRows) =>
      prevRows.map((r) => ({
        ...r,
        isEditMode: edit ? true : false,
      }))
    );
  };

  const onEditAll = () => {
    if (rows.length > 0) {
      // const allRows = rows.map((e) => e.uniqueId);
      toggleEditMode(true);
      // setEditedRows(rows);
      // setSelectedRows([...allRows]);
      setIsEditAll(true);
    } else {
      messageContext.showErrorMessage(
        `No data in table, please add data and try again`
      );
    }
  };
  const getEditedRows = () => {
    return rows.filter((x) => x.isEditMode);
  };
  const onSaveAll = async () => {
    setDisableSaveAll(true);
    const formattedColumnData = _.map(getEditedRows(), (e) => {
      const d = {
        ...e,
        isSaved: true,
        values: e.values.trim(),
        columnName: e.columnName.trim(),
        isEditMode: false,
      };
      return d;
    }).map((e) => {
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

    const existingCD = formattedColumnData.filter((e) => e.dbColumnId);
    const newCD = formattedColumnData.filter((e) => !e.dbColumnId);

    let newQuery = "";
    if (isCustomSQL === "No") {
      const columnList = formattedColumnData
        .map((e) => e.columnName)
        .join(", ");
      const wherePart = customsql?.indexOf("where");
      if (wherePart) {
        newQuery = `Select ${columnList} from ${tableName} ${customsql.slice(
          wherePart
        )}`;
      }
    }

    // setSelectedRows([]);
    const newData = _.orderBy([...formattedColumnData], ["uniqueId"], ["asc"]);
    // setEditedRows([...newData]);
    setRows([...newData]);

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
      dispatch(
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

    dispatch(getDatasetColumns(dsId));
  };

  const onRowSave = async (uniqueId) => {
    const editedRowData = _.filter(
      getEditedRows(),
      (e) => e.uniqueId === uniqueId
    )
      .map((e) => {
        const d = {
          ...e,
          isSaved: true,
          values: e.values.trim(),
          columnName: e.columnName.trim(),
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
    } else {
      // const removeRow = selectedRows.filter((e) => e !== uniqueId);
      // const removeEdited = editedRows.filter((e) => e.uniqueId !== uniqueId);
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
      }

      // const newData = _.orderBy(
      //   [...removeExistingRowData, editedRowData],
      //   ["uniqueId"],
      //   ["asc"]
      // );

      setRows([...removeExistingRowData, editedRowData]);
      // setEditedRows([...removeEdited]);
      // setSelectedRows([...removeRow]);
    }
    // await dispatch(getDatasetColumns(dsId));
  };

  const onCancelAll = () => {
    // setSelectedRows([]);
    // setEditedRows([...rows]);
    toggleEditMode();
    setIsEditAll(false);
    setEditMode(false);
  };

  const onRowCancel = (uniqueId) => {
    // const removeRow = selectedRows.filter((e) => e !== uniqueId);
    const editedColumns = getEditedRows();
    const alreadyInDb = editedColumns.find((e) => e.dbColumnId);
    if (alreadyInDb) {
      toggleEditMode();
    } else {
      setRows((prevRows) => prevRows.filter((e) => e.uniqueId !== uniqueId));
    }
    // if (!editedData?.isSaved) {
    //   const removeEdited = editedRows.filter((e) => e.uniqueId !== uniqueId);
    //   setEditedRows(removeEdited);
    // }
    // setSelectedRows([...removeRow]);
  };

  const onRowEdit = (uniqueId) => {
    setRows((prevRows) =>
      prevRows.map((e) => {
        if (e.uniqueId === uniqueId) {
          return { ...e, isEditMode: true };
        }
        return e;
      })
    );
    // setSelectedRows([...selectedRows, uniqueId]);
    // setEditedRows(rows);
  };

  const onRowDelete = async (uniqueId) => {
    const isInDB = rows.find((row) => row.uniqueId === uniqueId);
    if (isInDB) {
      if (isInDB.dbColumnId !== ("" || undefined || null)) {
        await deleteCD(isInDB.dbColumnId, dsId, dpId, dfId, false, "");
      }
    }
    setRows((prevRows) => prevRows.filter((e) => e.uniqueId !== uniqueId));
    // setEditedRows([...newData]);
  };

  const editRow = (uniqueId, key, value) => {
    setRows((rws) =>
      rws.map((row) => {
        if (row.uniqueId === uniqueId) {
          const data = {
            ...row,
            [key]: value,
            isInitLoad: Boolean(key === "variableLabel"),
          };
          // if (
          //   (key === "columnName" && haveHeader) ||
          //   (!haveHeader && key === "position")
          // ) {
          //   return {
          //     ...data,
          //     isHavingColumnName: Boolean(value.length >= 1),
          //   };
          // }
          return {
            ...data,
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
            // editMode: selectedRows?.includes(row.uniqueId),
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
            rowInEditMode: editedRows,
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
