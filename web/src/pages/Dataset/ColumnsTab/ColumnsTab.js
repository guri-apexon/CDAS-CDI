/* eslint-disable no-constant-condition */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-nested-ternary */
import React, { useState, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import FileUpload from "apollo-react/components/FileUpload";
import Card from "apollo-react/components/Card";
import Radio from "apollo-react/components/Radio";
import Link from "apollo-react/components/Link";

import Button from "apollo-react/components/Button";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { allowedTypes } from "../../../constants";
import DSColumnTable from "./DSColumnTable";

import { getSQLColumns } from "../../../store/actions/DataSetsAction";

import { downloadTemplate } from "../../../utils/downloadData";
import { checkHeaders, formatData, isSftp } from "../../../utils/index";

const ColumnsTab = ({ locationType, dfId, dpId }) => {
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { dsProdLock, dsTestLock } = dataFlow;
  const { selectedDataset, datasetColumns, sqlColumns } = dataSets;
  const { tbl_nm: tableName, customsql_yn: customQuery } = selectedDataset;
  const [selectedFile, setSelectedFile] = useState();
  const [selectedMethod, setSelectedMethod] = useState();
  const [showColumns, setShowColumns] = useState(false);
  const [isImportReady, setIsImportReady] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [formattedData, setFormattedData] = useState([]);
  const { selectedCard } = dashboard;
  const { protocolnumber } = selectedCard;
  const numberOfRows = 1;

  const maxSize = 150000;

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
        setImportedData(dataParse);
      };
      reader.readAsBinaryString(f);
    }, 1000);
  };

  const formatDBColumns = (datacolumns) => {
    const newData =
      datacolumns.length > 0
        ? datacolumns.map((column, i) => {
            const newObj = {
              columnId: i + 1,
              dbColumnId: column.columnid,
              uniqueId: `u${i}`,
              variableLabel: column.variable || "",
              columnName: column.name || "",
              position: column.position || "",
              format: column.format || "",
              dataType: column.datatype || "",
              primary: column.primarykey === 1 ? "Yes" : "No",
              unique: column.unique === 1 ? "Yes" : "No",
              required: column.required === 1 ? "Yes" : "No",
              minLength: column.charactermin || "",
              maxLength: column.charactermax || "",
              values: column.lov || "",
              isInitLoad: true,
              isHavingError: false,
              isHavingColumnName: true,
            };
            return newObj;
          })
        : [];
    setFormattedData([...newData]);
  };

  const formatJDBCColumns = (arr) => {
    const newData =
      arr.length > 0
        ? arr.map((column, i) => {
            const newObj = {
              columnId: i + 1,
              dbColumnId: column.columnid || "",
              uniqueId: `u${i}`,
              variableLabel: column.varable || "",
              columnName: column.columnName || "",
              format: column.format || "",
              dataType: column.dataType || "",
              primary: column.primarykey === 1 ? "Yes" : "No",
              unique: column.unique === 1 ? "Yes" : "No",
              required: column.required === 1 ? "Yes" : "No",
              minLength: column.charactermin || "",
              maxLength: column.charactermax || "",
              values: column.lov || "",
              isInitLoad: true,
              isHavingError: false,
              isHavingColumnName: true,
            };
            return newObj;
          })
        : [];
    setFormattedData([...newData]);
    setSelectedMethod("fromDB");
  };

  const handleDelete = () => {
    setSelectedFile([]);
    setImportedData([]);
    setFormattedData([]);
    setIsImportReady(false);
  };

  // const handleNoHeaders = () => {
  //   messageContext.showErrorMessage(
  //     `Import is not available for files with no header row.`
  //   );
  //   handleDelete();
  // };

  useEffect(() => {
    if (importedData.length > 1) {
      const correctHeader = checkHeaders(importedData);
      if (correctHeader) {
        const newData = formatData(importedData, protocolnumber);
        // eslint-disable-next-line no-unused-expressions
        if (newData.length > 1) {
          setFormattedData(newData);
          setIsImportReady(true);
        } else {
          messageContext.showErrorMessage(
            `Protocol Number in file does not match protocol number ‘${protocolnumber}’ for this data flow. Please make sure these match and try again`
          );
          handleDelete();
        }
      } else {
        messageContext.showErrorMessage(
          `The Selected File Does Not Match the Template`
        );
        handleDelete();
      }
    }
  }, [importedData]);

  useEffect(() => {
    if (datasetColumns.length > 0) {
      setShowColumns(true);
      formatDBColumns(datasetColumns);
      setSelectedMethod("fromDB");
    }
  }, [datasetColumns]);

  useEffect(() => {
    if (!isSftp(locationType)) {
      setShowColumns(true);
      if (customQuery) {
        dispatch(getSQLColumns(tableName));
      }
    }
  }, [locationType]);

  useEffect(() => {
    formatJDBCColumns(sqlColumns);
  }, [sqlColumns]);

  const handleChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  const showTable = React.useMemo(() => {
    return (
      <>
        <DSColumnTable
          numberOfRows={numberOfRows}
          formattedData={formattedData}
          dataOrigin={selectedMethod}
          locationType={locationType}
          dfId={dfId}
          dpId={dpId}
        />
      </>
    );
  }, [showColumns]);

  return (
    <>
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
              <div className={dsTestLock || dsProdLock ? "disable-card" : ""}>
                <Radio
                  value="fileUpload"
                  label="Upload dataset column settings"
                  onClick={handleChange}
                  checked={selectedMethod === "fileUpload"}
                />
                <Link onClick={downloadTemplate}>Download Excel Template</Link>
                <div className="upload-box">
                  <FileUpload
                    value={selectedFile}
                    onUpload={handleUpload}
                    onFileDelete={handleDelete}
                    maxItems={1}
                  />
                </div>
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
            <Button
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
            </Button>
          </div>
        </div>
      )}
      {showColumns && <>{showTable}</>}
    </>
  );
};

export default ColumnsTab;
