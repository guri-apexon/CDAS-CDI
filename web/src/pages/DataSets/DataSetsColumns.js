/* eslint-disable react/button-has-type */
import React, { useState } from "react";
import * as XLSX from "xlsx";

const DataSetsColumns = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [fileUploaded, setFileUploaded] = useState();

  const changeHandler = (event) => {
    event.preventDefault();
    setSelectedFile(event.target.files[0]);
    // const f = event.target.files[0];
    setIsFilePicked(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const readedData = XLSX.read(data, { type: "binary" });
      const wsname = readedData.SheetNames[0];
      const ws = readedData.Sheets[wsname];
      const dataParse = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setFileUploaded(dataParse);
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleSubmission = () => {};
  return (
    <div className="dataset-table">
      <input type="file" name="file" onChange={changeHandler} />
      {isFilePicked ? (
        <div>
          <p>
            {selectedFile.name}
            {selectedFile.size}
            {selectedFile.type}
          </p>
          <p>
            lastModifiedDate:
            {selectedFile.lastModifiedDate.toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p>Select a file to show details</p>
      )}
      <div>
        <button onClick={handleSubmission}>Submit</button>
      </div>
    </div>
  );
};

export default DataSetsColumns;
