/* eslint-disable no-constant-condition */
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
import { getUserInfo } from "../../utils";

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
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const history = useHistory();
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const packageData = useSelector((state) => state.dataPackage);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { selectedDSDetails } = packageData;
  const { dfId, selectedCard } = dashboard;
  const { datapackageid, datapackageName, datasetid, datasetName } =
    selectedDSDetails;
  const {
    loading,
    error,
    sucessMsg,
    isDatasetCreated,
    selectedDataset,
    formDataSQL,
  } = dataSets;
  const { prot_id: studyId } = selectedCard;
  const { dataFlowdetail, dsProdLock, dsTestLock, dsTestProdLock } = dataFlow;
  const { name: dataflowName, loctyp, testflag } = dataFlowdetail;
  const { locationType: newLT, customSQLQuery } = selectedDataset;
  const userInfo = getUserInfo();

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

  useEffect(() => {
    if (dfId === "") {
      history.push("/dashboard");
    }
    dispatch(getDataKindData());
  }, []);

  useEffect(() => {
    if (datasetid === null) {
      dispatch(resetFTP());
      dispatch(resetJDBC());
    } else {
      dispatch(getDataSetDetail(datasetid));
      dispatch(getDatasetColumns(datasetid));
    }
  }, [datasetid]);

  useEffect(() => {
    if (isDatasetCreated) {
      if (getDataSetType(loctyp) === ("sftp" || "ftps")) {
        messageContext.showSuccessMessage("Dataset Created Successfully");
        setValue(1);
      } else {
        messageContext.showSuccessMessage("Dataset Created Successfully");
      }
    }
  }, [isDatasetCreated, loctyp]);

  useEffect(() => {
    if (loctyp) {
      setLocationType(getDataSetType(loctyp));
      if (getDataSetType(loctyp) === ("sftp" || "ftps")) {
        setColumnsActive(true);
      }
    }
  }, [loctyp]);

  useEffect(() => {
    if (newLT === "JDBC") {
      if (customSQLQuery === "No") {
        setColumnsActive(true);
      }
    }
    if (formDataSQL?.customSQLQuery === "No") {
      setColumnsActive(true);
    }
  }, [newLT, customSQLQuery, formDataSQL]);

  const goToDataflow = () => {
    if (dfId) {
      history.push(`/dashboard/dataflow-management/${dfId}`);
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
    if (locationType === ("sftp" || "ftps")) {
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
        userId: userInfo.userId,
        testFlag: testflag,
        dfId,
        studyId,
      };
      if (data.datasetid) {
        dispatch(updateDatasetData(data));
      } else {
        dispatch(saveDatasetData(data));
      }
    }, 400);
  };

  const closeForm = async () => {
    if (locationType === ("sftp" || "ftps")) {
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {dataSettabs && (
                  <Tabs
                    value={value}
                    onChange={handleChangeTab}
                    size="small"
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
              </div>
            </div>

            <div style={{ padding: 20 }}>
              {value === 0 && (
                <>
                  {console.log("ltype", locationType)}
                  {locationType === ("sftp" || "ftps") ? (
                    <DataSetsForm
                      loading={loading}
                      onSubmit={onSubmit}
                      prodLock={dsProdLock}
                    />
                  ) : (
                    <DataSetsFormSQL
                      onSubmit={onSubmit}
                      prodLock={dsProdLock}
                      testLock={dsTestLock}
                      testProdLock={dsTestProdLock}
                    />
                  )}
                </>
              )}

              {
                // <JDBCForm
                //   datapackageid={datapackageid}
                //   dataflowid={dfId}
                //   datasetId={datasetid}
                //   isDatasetCreated={isDatasetCreated}
                //   selectedDataset={selectedDataset}
                //   dfTestFlag={testflag}
                //   onChangeSql={onChangeSql}
                //   ref={jdbcRef}
                // />
              }

              {value === 1 && (
                <ColumnsTab
                  locationType={locationType}
                  prodLock={dsProdLock}
                  testLock={dsTestLock}
                />
              )}
              {value === 2 && <VLCTab />}
            </div>
          </main>
        </Panel>
      </div>
    </>
  );
};

export default Dataset;
