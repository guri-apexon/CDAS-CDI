/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import * as XLSX from "xlsx";
import FileUpload from "apollo-react/components/FileUpload";
import Card from "apollo-react/components/Card";
import Radio from "apollo-react/components/Radio";
import Link from "apollo-react/components/Link";
import { useHistory } from "react-router-dom";
import TextField from "apollo-react/components/TextField";
import Button from "apollo-react/components/Button";
import DatasetTable from "./DatasetTable";

const ColumnsTab = () => {
  const history = useHistory();
  const [selectedFile, setSelectedFile] = useState();
  const [selectedMethod, setSelectedMethod] = useState();
  const [numberOfRows, setNumberOfRows] = useState(null);
  const [showColumns, setShowColumns] = useState(false);

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
          console.log("fileType", file.type);
          file.errorMessage = `${
            file.name.split(".")[file.name.split(".").length - 1]
          } format is not supported`;
        } else if (maxSize && file.size > maxSize) {
          file.errorMessage = `File is too large (max is ${maxSize} bytes)`;
        }
        return file;
      });

      setSelectedFile([...files]);
    }, 1000);
  };

  const handleDelete = (file) => {
    setSelectedFile([]);
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
            <Card style={{ maxWidth: 320, height: 300 }} className="card">
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
            <Card style={{ maxWidth: 320, height: 300 }} className="card">
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
            >
              Create
            </Button>
          </div>
        </>
      )}
      {showColumns && <DatasetTable numberOfRows={numberOfRows || 1} />}
    </div>
  );
};

export default ColumnsTab;
