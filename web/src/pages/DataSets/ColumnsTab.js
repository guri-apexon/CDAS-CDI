/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import FileUpload from "apollo-react/components/FileUpload";
import Card from "apollo-react/components/Card";
import Radio from "apollo-react/components/Radio";
import Link from "apollo-react/components/Link";
import { useHistory } from "react-router-dom";
import TextField from "apollo-react/components/TextField";
import Button from "apollo-react/components/Button";
import { MessageContext } from "../../components/MessageProvider";
import DatasetTable from "./DatasetTable";

const ColumnsTab = ({ locationType }) => {
  const history = useHistory();
  const messageContext = useContext(MessageContext);
  const dataSets = useSelector((state) => state.dataSets);
  const { datasetColumns } = dataSets;
  const [selectedFile, setSelectedFile] = useState();
  const [selectedMethod, setSelectedMethod] = useState();
  const [numberOfRows, setNumberOfRows] = useState(null);
  const [showColumns, setShowColumns] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [formattedData, setFormattedData] = useState([]);

  const allowedTypes = [
    "xlsx",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "csv",
  ];
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
            };
            return newObj;
          })
        : [];
    setFormattedData([...newData]);
  };

  const formatData = () => {
    // console.log("data", importedData, formattedData);
    const data = importedData.slice(1);
    const newData =
      data.length > 1
        ? data.map((e, i) => {
            const newObj = {
              columnId: i + 1,
              variableLabel: e[1] || "",
              columnName: e[2] || "",
              position: "",
              format: e[3] || "",
              dataType: e[4] || "",
              primary: e[5] || "",
              unique: e[6] || "",
              required: e[7] || "",
              minLength: e[8] || "",
              maxLength: e[9] || "",
              values: e[10] || "",
            };
            return newObj;
          })
        : [];
    setFormattedData([...newData]);
  };

  // const handleNoHeaders = () => {
  //   messageContext.showErrorMessage(
  //     `Import is not available for files with no header row.`
  //   );
  // };

  useEffect(() => {
    if (importedData.length > 2) {
      formatData();
    }
  }, [importedData]);

  useEffect(() => {
    if (datasetColumns.length > 0) {
      setShowColumns(true);
      formatDBColumns(datasetColumns);
    } else {
      setShowColumns(false);
    }
  }, [datasetColumns]);

  const handleDelete = () => {
    setSelectedFile([]);
    setImportedData([]);
    setFormattedData([]);
  };

  const handleChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  const handleSubmission = () => {};
  return (
    <div className="tab colums-tab">
      {!showColumns && (
        <>
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
              <Link onClick={() => console.log("link clicked")}>
                Download Excel Template
              </Link>
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
              style={{ maxWidth: 320, height: 300 }}
              className={selectedMethod === "manually" ? "active card" : "card"}
            >
              <Radio
                value="manually"
                label="Create manually"
                onClick={handleChange}
                checked={selectedMethod === "manually"}
              />
              <TextField
                label="Number of rows"
                onChange={(e) => setNumberOfRows(e.target.value)}
                defaultValue={numberOfRows}
              />
            </Card>
          </div>
          <div style={{ display: "flex", justifyContent: "end" }}>
            <Button
              variant="primary"
              style={{ marginRight: 10, float: "right" }}
              onClick={() => setShowColumns(true)}
              disabled={
                selectedMethod !== "manually" &&
                !showColumns &&
                selectedMethod !== "fileUpload" &&
                !showColumns
              }
            >
              Create
            </Button>
          </div>
        </>
      )}
      {showColumns && (
        <DatasetTable
          numberOfRows={numberOfRows || 1}
          formattedData={formattedData}
          dataOrigin={selectedMethod}
          locationType={locationType}
        />
      )}
    </div>
  );
};

export default ColumnsTab;
