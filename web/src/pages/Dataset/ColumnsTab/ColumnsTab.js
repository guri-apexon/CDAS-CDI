/* eslint-disable no-constant-condition */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-nested-ternary */
import React, { useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import FileUpload from "apollo-react/components/FileUpload";
import Card from "apollo-react/components/Card";
import Radio from "apollo-react/components/Radio";
import Link from "apollo-react/components/Link";
import Button from "apollo-react/components/Button";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { allowedTypes } from "../../../constants";
import DSColumnTable from "./DSColumnTable";
import Progress from "../../../components/Common/Progress/Progress";
import { downloadTemplate } from "../../../utils/downloadData";
import {
  checkHeaders,
  formatDataNew,
  isSftp,
  stringToBoolean,
} from "../../../utils/index";

import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../../components/Common/usePermission";

const ColumnsTab = ({
  locationType,
  dfId,
  dpId,
  setDatasetColumnsExist,
  selectedDataset,
  createMode,
  columnsEditMode,
}) => {
  const messageContext = useContext(MessageContext);
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { dsProdLock, dsTestLock, dataFlowdetail } = dataFlow;
  const { datasetColumns, sqlColumns, haveHeader } = dataSets;
  const { selectedCard } = dashboard;
  const { protocolnumber, prot_id: protId } = selectedCard;

  const { canUpdate: canUpdateDataFlow, canCreate: CanCreateDataFlow } =
    useStudyPermission(
      Categories.CONFIGURATION,
      Features.DATA_FLOW_CONFIGURATION,
      protId
    );

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [selectedMethod, setSelectedMethod] = useState();
  const [showColumns, setShowColumns] = useState(false);
  const [isImportReady, setIsImportReady] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [formattedData, setFormattedData] = useState([]);
  // const [isDFSynced, setIsDFSynced] = useState(false);

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

  const getUniqueId = () => {
    return Math.random().toString(36).slice(2);
  };

  const formatDBColumns = (datacolumns) => {
    const newData =
      datacolumns.length > 0
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
              primaryKey: column.primarykey === 1 ? "Yes" : "No",
              unique: column.unique === 1 ? "Yes" : "No",
              required: column.required === 1 ? "Yes" : "No",
              minLength: column.charactermin || "",
              maxLength: column.charactermax || "",
              values: column.lov || "",
              isInitLoad: true,
              isHavingColumnName: true,
              isSaved: true,
              isEditMode: false,
              // isDBSync:
            };
            return newObj;
          })
        : [];
    setFormattedData([...newData]);
  };

  const formatJDBCColumns = (arr, editMode = false) => {
    const newData =
      arr.length > 0
        ? arr.map((column, i) => {
            const newObj = {
              dbColumnId: column.columnid || "",
              uniqueId: getUniqueId(),
              index: i,
              variableLabel: column.varable || column.variable || "",
              columnName: column.columnName || column.name || "",
              format: column.format || "",
              dataType: column.dataType || column.datatype || "",
              primaryKey: stringToBoolean(column.primarykey) ? "Yes" : "No",
              unique: stringToBoolean(column.unique) ? "Yes" : "No",
              required: stringToBoolean(column.required) ? "Yes" : "No",
              minLength: column.charactermin || "",
              maxLength: column.charactermax || "",
              values: column.lov || "",
              isInitLoad: true,
              isHavingColumnName: true,
              isEditMode: editMode,
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

  useEffect(() => {
    if (importedData.length > 1) {
      const correctHeader = checkHeaders(importedData);
      if (correctHeader) {
        const newData = formatDataNew(importedData, protocolnumber);
        if (newData?.headerNotMatching) {
          messageContext.showErrorMessage(
            `Protocol number in file does not match protocol number ‘${protocolnumber}’ for this data flow. Please make sure these match and try again`
          );
          handleDelete();
        } else if (newData?.data?.length === 0) {
          messageContext.showErrorMessage(
            `Please add some proper data and try with import`
          );
          handleDelete();
        } else if (newData?.data?.length > 0) {
          setFormattedData(newData.data);
          setIsImportReady(true);
        }
      } else {
        messageContext.showErrorMessage(
          `The selected file does not match the template`
        );
        handleDelete();
      }
    }
  }, [importedData]);

  useEffect(() => {
    if (!haveHeader) {
      messageContext.showErrorMessage(
        `Import is not available for files with no header row.`
      );
    }
  }, [haveHeader]);

  useEffect(() => {
    if (!isSftp(locationType)) {
      // console.log("JDBC", locationType);
      setShowColumns(true);
      setSelectedMethod("fromAPICall");
      if (datasetColumns.length) {
        formatJDBCColumns(datasetColumns);
      } else if (sqlColumns.length) {
        formatJDBCColumns(sqlColumns, !!columnsEditMode);
      }
    } else if (isSftp(locationType) && datasetColumns.length) {
      // console.log("SFTP", locationType);
      setShowColumns(true);
      formatDBColumns(datasetColumns);
      setSelectedMethod("fromDB");
    }
    console.log({ datasetColumns, sqlColumns }, locationType);
  }, [datasetColumns, sqlColumns]);

  useEffect(() => {
    if (!isSftp(locationType)) {
      setShowColumns(true);
    }
  }, [locationType]);

  // useEffect(() => {
  //   const { isSync, testflag } = dataFlowdetail;
  //   if (isSync === "Y" && testflag === 0) {
  //     setIsDFSynced(true);
  //   }
  // }, [dataFlowdetail]);

  const handleChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  const showTable = React.useMemo(() => {
    return (
      <>
        <DSColumnTable
          formattedData={formattedData}
          dataOrigin={selectedMethod}
          locationType={locationType}
          dfId={dfId}
          dpId={dpId}
          setDatasetColumnsExist={(disableSave) =>
            setDatasetColumnsExist(disableSave)
          }
          selectedDataset={selectedDataset}
        />
      </>
    );
  }, [showColumns, loading, formattedData]);

  return (
    <>
      {loading && <Progress />}
      {!showColumns && !loading && (
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
              <div
                className={
                  dsTestLock || dsProdLock || !haveHeader ? "disable-card" : ""
                }
              >
                <Radio
                  value="fileUpload"
                  label="Upload dataset column settings"
                  onClick={handleChange}
                  disabled={!canUpdateDataFlow}
                  checked={selectedMethod === "fileUpload"}
                />

                <Link onClick={downloadTemplate}>Download Excel Template</Link>

                <div className="upload-box">
                  <FileUpload
                    value={selectedFile}
                    onUpload={handleUpload}
                    onFileDelete={handleDelete}
                    disabled={!canUpdateDataFlow}
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
                disabled={!canUpdateDataFlow}
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
                ) || !canUpdateDataFlow
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
