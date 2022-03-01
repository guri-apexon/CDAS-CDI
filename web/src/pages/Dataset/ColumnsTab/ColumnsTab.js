/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-nested-ternary */
import React, { useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import FileUpload from "apollo-react/components/FileUpload";
import Card from "apollo-react/components/Card";
import Radio from "apollo-react/components/Radio";
import Link from "apollo-react/components/Link";
// import { useHistory } from "react-router-dom";
// import Pencil from "apollo-react-icons/Pencil";
// import TextField from "apollo-react/components/TextField";
import Button from "apollo-react/components/Button";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { allowedTypes } from "../../../constants";
import DSColumnTable from "./DSColumnTable";

import { downloadTemplate } from "../../../utils/downloadData";
import { checkHeaders, formatData } from "../../../utils/index";

// const DSColumnTable = lazy(() => import("./DSColumnTable"));

const ColumnsTab = ({ locationType }) => {
  // const history = useHistory();
  const messageContext = useContext(MessageContext);
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const { datasetColumns } = dataSets;
  const [selectedFile, setSelectedFile] = useState();
  const [selectedMethod, setSelectedMethod] = useState();
  const [showColumns, setShowColumns] = useState(false);
  const [isImportReady, setIsImportReady] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [formattedData, setFormattedData] = useState([]);
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
      datacolumns.length > 1
        ? datacolumns.map((column, i) => {
            const newObj = {
              columnId: i + 1,
              dbColumnId: column.columnid,
              variableLabel: column.VARIABLE || "",
              columnName: column.name || "",
              position: column.position || "",
              format: column.FORMAT || "",
              dataType: column.datatype || "",
              primary: column.primarykey === 1 ? "Yes" : "No",
              unique: column.UNIQUE === 1 ? "Yes" : "No",
              required: column.required === 1 ? "Yes" : "No",
              minLength: column.charactermin || "",
              maxLength: column.charactermax || "",
              values: column.lov || "",
              isInitLoad: true,
              isHavingError: false,
            };
            return newObj;
          })
        : [];
    setFormattedData([...newData]);
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
        const newData = formatData(
          importedData,
          dashboard?.selectedCard?.protocolnumber
        );
        // eslint-disable-next-line no-unused-expressions
        newData.length > 1
          ? (setFormattedData(newData), setIsImportReady(true))
          : (messageContext.showErrorMessage(
              `Protocol Number in file does not match protocol number ‘${dashboard?.selectedCard?.protocolnumber}’ for this data flow. Please make sure these match and try again`
            ),
            handleDelete());
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
    if (
      locationType?.toLowerCase() !== "sftp" &&
      locationType?.toLowerCase() !== "ftps"
    ) {
      setShowColumns(true);
      console.log("inside if", locationType);
    }
    // console.log(locationType);
  }, [locationType]);

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
