/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-nested-ternary */
import React, { useState, useContext, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import FileUpload from "apollo-react/components/FileUpload";
import Card from "apollo-react/components/Card";
import Radio from "apollo-react/components/Radio";
import Link from "apollo-react/components/Link";
import Button from "apollo-react/components/Button";
import { MessageContext } from "../../../../../components/Providers/MessageProvider";
import { allowedTypes } from "../../../../../constants";
import DSColumnTable from "./DSColumnTable";

import { downloadTemplate } from "../../../../../utils/downloadData";
import { checkHeaders, formatData, isSftp } from "../../../../../utils/index";
import Progress from "../../../../../components/Common/Progress/Progress";

const ColumnsTab = ({
  locationType,
  headerValue,
  columnFunc,
  myForm,
  moveNext,
}) => {
  // const history = useHistory();
  const messageContext = useContext(MessageContext);
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const { datasetColumns, sqlColumns } = dataSets;
  const [selectedFile, setSelectedFile] = useState();
  const [selectedMethod, setSelectedMethod] = useState();
  const [showColumns, setShowColumns] = useState(false);
  const [isImportReady, setIsImportReady] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [formattedData, setFormattedData] = useState([]);
  const [disableUpload, setDisableUpload] = useState(false);
  const { selectedCard } = dashboard;
  const { protocolnumber } = selectedCard;
  const [loading, setLoading] = useState(false);

  const maxSize = 150000;

  const getUniqueId = () => {
    return Math.random().toString(36).slice(2);
  };

  const handleUpload = (selected) => {
    setTimeout(() => {
      // custom validations
      const files = selected.map((file) => {
        file.loading = false;
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
        return file;
      });

      setSelectedFile([...files]);
      const f = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const readedData = XLSX.read(data, { type: "binary" });
        const wsname = readedData.SheetNames[0];
        const ws = readedData.Sheets[wsname];
        const dataParse = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (dataParse[0]?.length) {
          setImportedData(dataParse);
        } else {
          messageContext.showErrorMessage(
            `The selected file does not match the template`
          );
          setSelectedFile([]);
        }
      };
      reader.readAsBinaryString(f);
    }, 1000);
  };

  const formatDBColumns = (datacolumns) => {
    const newData =
      datacolumns.length > 1
        ? datacolumns.map((column, i) => {
            const newObj = {
              dbColumnId: column.columnid,
              uniqueId: getUniqueId(),
              index: i,
              variableLabel: column.variable || "",
              columnName: column.name || "",
              position: column.position || "",
              format: column.format || "",
              dataType: column.datatype || "",
              primaryKey: column.primaryKey ? "Yes" : "No",
              unique: column.unique === 1 ? "Yes" : "No",
              required: column.required === 1 ? "Yes" : "No",
              minLength:
                column.charactermin || column.charactermin === 0
                  ? column.charactermin
                  : "",
              maxLength:
                column.charactermax || column.charactermax === 0
                  ? column.charactermax
                  : "",
              values: column.lov || "",
              isInitLoad: true,
              isHavingColumnName: true,
            };
            return newObj;
          })
        : [];
    setFormattedData([...newData]);
    setLoading(false);
  };

  const formatJDBCColumns = (arr) => {
    const newData =
      arr.length > 0
        ? arr.map((column, i) => {
            const newObj = {
              dbColumnId: column.columnid || "",
              uniqueId: getUniqueId(),
              index: i,
              variableLabel: column.varable || "",
              columnName: column.columnName || "",
              format: column.format || "",
              dataType: column.dataType || "",
              primaryKey: column.primaryKey ? "Yes" : "No",
              unique: column.unique === true ? "Yes" : "No",
              required: column.required === true ? "Yes" : "No",
              minLength: column.charactermin || "",
              maxLength: column.charactermax || "",
              position: 0,
              values: column.lov || "",
              isInitLoad: true,
              isHavingColumnName: true,
            };
            return newObj;
          })
        : [];
    setFormattedData([...newData]);
    setLoading(false);
  };

  const handleDelete = () => {
    setSelectedFile([]);
    setImportedData([]);
    setFormattedData([]);
    setIsImportReady(false);
  };
  const showImportProtErr = () => {
    messageContext.showErrorMessage(
      `Protocol number in file does not match protocol number ‘${protocolnumber}’ for this data flow. Please make sure these match and try again`
    );
    handleDelete();
  };

  useEffect(() => {
    if (importedData.length > 1) {
      const correctHeader = checkHeaders(importedData);
      if (correctHeader) {
        const newData = formatData(importedData, protocolnumber);
        if (newData.some((x) => x.columnName === "")) {
          messageContext.showErrorMessage(
            `Please fill column name in each row`
          );
          handleDelete();
          return false;
        }
        // eslint-disable-next-line no-unused-expressions
        if (newData.length > 0) {
          setFormattedData(newData);
          setIsImportReady(true);
        } else {
          showImportProtErr();
        }
      } else {
        messageContext.showErrorMessage(
          `The selected file does not match the template`
        );
        handleDelete();
      }
    } else if (importedData.length === 1) {
      showImportProtErr();
    }
  }, [importedData]);

  useEffect(() => {
    if (!isSftp(locationType)) {
      if (datasetColumns.length > 0) {
        formatDBColumns(datasetColumns);
        setSelectedMethod("fromDB");
      } else if (sqlColumns.length > 0) {
        formatJDBCColumns(sqlColumns);
        setSelectedMethod("fromDB");
      }
      setShowColumns(true);
    } else {
      setShowColumns(false);
      setLoading(false);
    }
  }, [datasetColumns, sqlColumns]);

  useEffect(() => {
    columnFunc.current = () => {
      if (
        selectedMethod === "manually" ||
        (selectedMethod === "fileUpload" && isImportReady)
      ) {
        setShowColumns(true);
        moveNext();
      } else {
        if (selectedMethod === "fileUpload" && !isImportReady) {
          messageContext.showErrorMessage(`Please upload file to continue`);
          return false;
        }
        messageContext.showErrorMessage(`Please select one option to continue`);
      }
    };
  }, [selectedMethod, isImportReady]);
  useEffect(() => {
    if (headerValue.toString() === "0" || headerValue === "") {
      messageContext.showErrorMessage(
        `Import is not available for files with no header row.`
      );
      setDisableUpload(true);
    }
    if (isSftp(locationType)) {
      const cdRows = messageContext?.dataflowObj?.columnDefinition;
      if (cdRows?.length) {
        setFormattedData([...cdRows]);
        setSelectedMethod("fromDB2");
        setShowColumns(true);
        moveNext();
      }
    }
  }, []);
  const handleChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  return (
    <>
      {loading && <Progress />}
      {!showColumns && (
        <div className="tab colums-tab">
          <p className="title">Configure Dataset Column Settings</p>
          <p className="sub-title">Select an option</p>
          <div className="cards-box">
            <Card
              style={{ maxWidth: 320, height: 300 }}
              className={
                selectedMethod === "fileUpload" ? "active card" : "card"
              }
            >
              <Radio
                value="fileUpload"
                disabled={disableUpload}
                label="Upload dataset column settings"
                onClick={handleChange}
                checked={selectedMethod === "fileUpload"}
              />
              <Link disabled={disableUpload} onClick={downloadTemplate}>
                Download Excel Template
              </Link>
              <div className="upload-box">
                <FileUpload
                  disabled={disableUpload}
                  value={selectedFile}
                  onUpload={handleUpload}
                  onFileDelete={handleDelete}
                  maxItems={1}
                />
              </div>
            </Card>
            <Card
              style={{ maxWidth: 320, height: 300, width: 320 }}
              className={selectedMethod === "manually" ? "active card" : "card"}
            >
              <Radio
                value="manually"
                label="Create manually"
                onClick={handleChange}
                checked={selectedMethod === "manually"}
              />
            </Card>
          </div>
          <div style={{ display: "flex", justifyContent: "end" }}>
            {/* <Button
              variant="primary"
              style={{ marginRight: 10, float: "right" }}
              onClick={() => setShowColumns(true)}
              disabled={
                !(
                  selectedMethod === "manually" ||
                  (selectedMethod === "fileUpload" && isImportReady)
                )
              }
            >
              Create
            </Button> */}
          </div>
        </div>
      )}
      {showColumns && !loading && (
        <DSColumnTable
          formattedData={formattedData}
          dataOrigin={selectedMethod}
          locationType={locationType}
          headerValue={headerValue}
          myForm={myForm}
          existRows={messageContext?.dataflowObj?.columnDefinition}
        />
      )}
    </>
  );
};

export default ColumnsTab;
