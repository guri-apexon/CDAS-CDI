/* eslint-disable no-nested-ternary */
/* eslint-disable no-script-url */
import React, { useState, useContext, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submit, reset } from "redux-form";
import Banner from "apollo-react/components/Banner";
import Panel from "apollo-react/components/Panel/Panel";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import Typography from "apollo-react/components/Typography";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import { ReactComponent as DatasetsIcon } from "../../components/Icons/dataset.svg";
import LeftPanel from "../../components/Dataset/LeftPanel/LeftPanel";
import { MessageContext } from "../../components/Providers/MessageProvider";
import "./Dataset.scss";
import {
  hideErrorMessage,
  getDataKindData,
  saveDatasetData,
  updateDatasetData,
  getDataSetDetail,
  getDatasetColumns,
  resetFTP,
  resetJDBC,
} from "../../store/actions/DataSetsAction";
import DataSetsForm from "./DataSetsForm";
import DataSetsFormSQL from "./DataSetsFormSQL";
// import JDBCForm from "./JDBCForm";
import ColumnsTab from "./ColumnsTab/ColumnsTab";
import VLCTab from "./VLCTab";

const dataSettabs = ["Settings", "Dataset Columns", "VLC"];

const styles = {
  rightPanel: {
    maxWidth: "calc(100vw - 466px)",
    width: "calc(100vw - 464px)",
  },
  rightPanelExtended: {
    maxWidth: "calc(100vw - 42px)",
    width: "calc(100vw - 40px)",
  },
  content: {
    flexGrow: 1,
    background: "#f6f7fb",
    minHeight: "calc(100vh - 125px)",
  },
  contentHeader: {
    paddingTop: 11,
    padding: "16px 25px 0px 25px",
    backgroundColor: "#ffffff",
  },
  contentTitle: {
    padding: "20px 0px",
    fontSize: 20,
    lineHeight: "22px",
    fontWeight: 500,
  },
  breadcrumbs: {
    marginBottom: 16,
    paddingLeft: 0,
  },
  contentSubTitle: {
    color: "#000000",
    fontSize: "14px",
    paddingLeft: 11,
    letterSpacing: 0,
    lineHeight: "24px",
  },
  cIcon: {
    color: "#595959",
  },
  cTitle: {
    color: "#000000",
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: 0,
    lineHeight: "24px",
    marginLeft: "8px",
    marginBottom: "8px",
  },
};

const Dataset = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [value, setValue] = useState(0);
  const [locationType, setLocationType] = useState("jdbc");
  const [columnsActive, setColumnsActive] = useState(false);
  const [customSql, setCustomSql] = useState("No");
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const history = useHistory();
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const packageData = useSelector((state) => state.dataPackage);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { selectedDSDetails } = packageData;
  const { selectedDFId } = dashboard;
  const { datapackageid, datapackageName, datasetid, datasetName } =
    selectedDSDetails;
  const { loading, error, sucessMsg, isDatasetCreated, selectedDataset } =
    dataSets;
  const { dataFlowdetail } = dataFlow;
  const { name: dataflowName } = dataFlowdetail;

  const useStyles = makeStyles(styles);
  const classes = useStyles();

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleOpen = () => {
    setIsPanelOpen(true);
  };

  const handleChangeTab = (event, v) => {
    setValue(v);
  };
  const getDataSetType = (type) => {
    if (type?.toLowerCase() === ("sftp" || "ftps")) {
      return "sftp";
    }
    return "jdbc";
  };

  const onChangeSql = (val) => setCustomSql(val);

  useEffect(() => {
    if (selectedDFId === "") {
      history.push("/dashboard");
    }
    dispatch(getDataKindData());
  }, []);

  useEffect(() => {
    if (datasetid === null) {
      dispatch(resetFTP());
      dispatch(resetJDBC());
      console.log("working");
    } else {
      dispatch(getDataSetDetail(datasetid));
      dispatch(getDatasetColumns(datasetid));
    }
  }, [datasetid]);

  useEffect(() => {
    if (isDatasetCreated) {
      if (dataFlowdetail?.loctyp === ("sftp" || "ftps") || customSql === "No") {
        setValue(1);
      }
      setColumnsActive(customSql === "No");
    }
  }, [isDatasetCreated]);

  useEffect(() => {
    if (dataFlowdetail?.loctyp) {
      setLocationType(dataFlowdetail?.loctyp);
      if (getDataSetType(dataFlowdetail?.loctyp) === ("sftp" || "ftps")) {
        setColumnsActive(true);
      }
    }
  }, [dataFlowdetail]);

  const goToDataflow = () => {
    if (selectedDFId) {
      history.push(`/dashboard/dataflow-management/${selectedDFId}`);
    }
  };

  const gotoDataPackage = () => {
    if (datapackageid) {
      history.push("/dashboard/data-packages");
    }
  };

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: dataflowName ?? "Dataflow Name",
      onClick: goToDataflow,
    },
    {
      href: "javascript:void(0)",
      title: datapackageName ?? "Datapackage Name",
      onClick: gotoDataPackage,
    },
    {
      href: "#",
      title: datasetName ?? "Create Dataset",
    },
  ];

  const jdbcRef = useRef();

  const submitForm = () => {
    if (locationType?.toLowerCase() === ("sftp" || "ftps")) {
      dispatch(submit("DataSetsForm"));
    } else {
      dispatch(submit("DataSetsFormSQL"));
      // jdbcRef.current.handleSubmit();
    }
  };

  const onSubmit = (formValue) => {
    setTimeout(() => {
      const data = {
        ...formValue,
        datapackageid,
        dfTestFlag: dataFlowdetail.testflag,
      };
      if (data.datasetid) {
        dispatch(updateDatasetData(data));
      } else {
        dispatch(saveDatasetData(data));
      }
    }, 400);
  };

  const closeForm = async () => {
    if (locationType?.toLowerCase() === ("sftp" || "ftps")) {
      await dispatch(reset("DataSetsForm"));
    } else {
      jdbcRef.current.handleCancel();
    }
    history.push("/dashboard");
  };

  const getLeftPanel = React.useMemo(
    () => (
      <>
        <LeftPanel dataflowSource={dataFlowdetail} />
      </>
    ),
    [dataFlowdetail]
  );

  return (
    <>
      {(error || sucessMsg) && (
        <Banner
          variant={sucessMsg ? "success" : "error"}
          open={true}
          onClose={() => dispatch(hideErrorMessage())}
          style={{ zIndex: 9999, top: "5%" }}
          message={error || sucessMsg}
        />
      )}
      <div className="pageRoot">
        <Panel
          onClose={handleClose}
          onOpen={handleOpen}
          open={isPanelOpen}
          width={446}
        >
          {getLeftPanel}
        </Panel>
        <Panel
          className={
            isPanelOpen ? classes.rightPanel : classes.rightPanelExtended
          }
          width="100%"
          hideButton
        >
          <main className={classes.content}>
            <div className={classes.contentHeader}>
              <BreadcrumbsUI
                className={classes.breadcrumbs}
                id="dataaset-breadcrumb"
                items={breadcrumbItems}
              />
              <div style={{ display: "flex", paddingLeft: 11 }}>
                <DatasetsIcon />
                <Typography className={classes.cTitle}>
                  {datasetName
                    ? datasetName
                    : selectedDataset.datasetName
                    ? selectedDataset.datasetName
                    : "Dataset name"}
                </Typography>
              </div>
              {(!value || value === 0) && (
                <ButtonGroup
                  alignItems="right"
                  buttonProps={[
                    {
                      label: "Cancel",
                      onClick: () => closeForm(),
                    },
                    {
                      label: "Save",
                      onClick: () => submitForm(),
                    },
                  ]}
                />
              )}
              {dataSettabs && (
                <Tabs
                  value={value}
                  onChange={handleChangeTab}
                  size="small"
                  style={{ marginBottom: "-19px" }}
                  truncate
                >
                  {dataSettabs.map((tab) => (
                    <Tab
                      label={tab}
                      disabled={!columnsActive && tab === "Dataset Columns"}
                    />
                  ))}
                </Tabs>
              )}
            </div>

            <div style={{ padding: 20, marginTop: 20 }}>
              {value === 0 &&
                (locationType?.toLowerCase() === "sftp" ||
                  locationType?.toLowerCase() === "ftps") && (
                  <DataSetsForm loading={loading} onSubmit={onSubmit} />
                )}
              {value === 0 &&
                locationType?.toLowerCase() !== "sftp" &&
                locationType?.toLowerCase() !== "ftps" && (
                  <DataSetsFormSQL
                    onChange={onChangeSql}
                    defaultFields={{
                      sql: customSql,
                    }}
                    loading={loading}
                    onSubmit={onSubmit}
                  />
                  // <JDBCForm
                  //   datapackageid={datapackageid}
                  //   dataflowid={selectedDFId}
                  //   datasetId={datasetid}
                  //   isDatasetCreated={isDatasetCreated}
                  //   selectedDataset={selectedDataset}
                  //   dfTestFlag={dataFlowdetail.testflag}
                  //   onChangeSql={onChangeSql}
                  //   ref={jdbcRef}
                  // />
                )}
              {value === 1 && <ColumnsTab locationType={locationType} />}
              {value === 2 && <VLCTab />}
            </div>
          </main>
        </Panel>
      </div>
    </>
  );
};

export default Dataset;
