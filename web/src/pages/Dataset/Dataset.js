/* eslint-disable no-nested-ternary */
/* eslint-disable no-script-url */
import React, { useState, useContext, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submit, reset } from "redux-form";
import Banner from "apollo-react/components/Banner";
import Panel from "apollo-react/components/Panel/Panel";
// import Header from "./Header";
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
} from "../../store/actions/DataSetsAction";
import { getDataFlowDetail } from "../../store/actions/DataFlowAction";
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
  const [locationType, setLocationType] = useState("sftp");
  const [columnsActive, setColumnsActive] = useState(false);
  const [customSql, setCustomSql] = useState("no");
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const history = useHistory();
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const packageData = useSelector((state) => state.dataPackage);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { selectedDSDetails } = packageData;
  const { selectedDFId } = dashboard;
  const { datasetid } = selectedDSDetails;
  const { loading, error, sucessMsg, isDatasetCreated, selectedDataset } =
    dataSets;
  const { dataFlowdetail } = dataFlow;
  const { datasetId } = useParams();

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
    if (type?.toLowerCase() === "sftp" || type?.toLowerCase() === "ftps") {
      return "sftp";
    }
    return "jdbc";
  };

  const onChangeSql = (val) => {
    setColumnsActive(val === "No");
    setCustomSql(val);
  };

  useEffect(() => {
    if (!datasetId) {
      dispatch(reset("DataSetsForm"));
      dispatch(reset("DataSetsFormSQL"));
    }
  }, [datasetId]);

  useEffect(() => {
    console.log(selectedDataset, "selectedDataset");
    if (isDatasetCreated) {
      setValue(1);
    }
  }, [isDatasetCreated]);

  useEffect(() => {
    if (selectedDFId === "") {
      history.push("/dashboard");
    }
    dispatch(getDataKindData());
  }, []);

  useEffect(() => {
    if (selectedDFId) {
      dispatch(getDataFlowDetail(selectedDFId));
    }
  }, [selectedDFId]);

  useEffect(() => {
    if (datasetid) {
      dispatch(getDataSetDetail(datasetid));
      dispatch(getDatasetColumns(datasetid));
    }
  }, [datasetid]);

  useEffect(() => {
    if (dataFlowdetail?.loc_typ) {
      setLocationType(dataFlowdetail?.loc_typ);
      if (getDataSetType(dataFlowdetail?.loc_typ) === "sftp") {
        setColumnsActive(true);
      }
    }
  }, [dataFlowdetail]);

  const goToDataflow = () => {
    if (selectedDSDetails.dataflowid) {
      history.push("/dataflow-management");
    }
    history.push("/dataflow-management");
  };

  const goToPackage = () => {
    if (selectedDSDetails.dataflowid) {
      history.push("/dataflow-management");
    }
    history.push("/dataflow-management");
  };

  const gotoDataflow = () => {
    if (selectedDSDetails.dataflowid) {
      history.push("/data-packages");
    }
    history.push("/data-packages");
  };

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: selectedDSDetails.dataflowid ?? "Dataflow Name",
      onClick: goToDataflow,
    },
    {
      href: "javascript:void(0)",
      title: selectedDSDetails.datapackageName ?? "Datapackage Name",
      onClick: gotoDataflow,
    },
    {
      href: "#",
      title: selectedDSDetails.datasetName ?? "Create Dataset",
    },
  ];

  const submitForm = () => {
    if (
      locationType?.toLowerCase() === "sftp" ||
      locationType?.toLowerCase() === "ftps"
    ) {
      dispatch(submit("DataSetsForm"));
    } else {
      dispatch(submit("DataSetsFormSQL"));
    }
  };

  const onSubmit = (formValue) => {
    setTimeout(() => {
      const data = {
        ...formValue,
        datapackageid: selectedDSDetails?.datapackageid,
      };
      if (data.datasetid) {
        dispatch(updateDatasetData(data));
      } else {
        dispatch(saveDatasetData(data));
      }
    }, 400);
  };

  const closeForm = async () => {
    if (
      locationType?.toLowerCase() === "sftp" ||
      locationType?.toLowerCase() === "ftps"
    ) {
      await dispatch(reset("DataSetsForm"));
    } else {
      await dispatch(reset("DataSetsFormSQL"));
    }
    history.push("/dashboard");
  };

  const getLeftPanel = React.useMemo(
    () => (
      <>
        <LeftPanel />
      </>
    ),
    []
  );

  const locationChange = () => {
    messageContext.showErrorMessage(
      `No Tables Returned. Pls reach out to admins`
    );
  };

  const queryCompilationError = () => {
    messageContext.showErrorMessage(
      `Query Compilation Error, check query syntax.`
    );
  };

  const noRecordsFound = () => {
    messageContext.showErrorMessage(`No records found.`);
  };

  return (
    <>
      {/* <PageHeader height={64} /> */}
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
                  {selectedDSDetails.datasetName
                    ? selectedDSDetails.datasetName
                    : selectedDataset.datasetName
                    ? selectedDataset.datasetName
                    : "Dataset name"}
                </Typography>
              </div>
              {/* {datasetsCount && (
                <Typography className={classes.contentSubTitle}>
                  {`${props.datasetsCount} datasets`}
                </Typography>
              )} */}
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
                  // <JDBCForm />
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
