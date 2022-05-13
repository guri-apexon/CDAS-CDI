/* eslint-disable no-constant-condition */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-script-url */
import React, { useState, useContext, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submit, reset } from "redux-form";
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
  getDataKindData,
  saveDatasetData,
  updateDatasetData,
  getDataSetDetail,
  getDatasetColumns,
  resetFTP,
  resetJDBC,
} from "../../store/actions/DataSetsAction";
import { updatePanel } from "../../store/actions/DataPackageAction";
import { getDataFlowDetail } from "../../store/actions/DataFlowAction";
import { getUserInfo, isSftp } from "../../utils";
import DataSetsForm from "./DataSetsForm";
import DataSetsFormSQL from "./DataSetsFormSQL";
// import JDBCForm from "./JDBCForm";
import ColumnsTab from "./ColumnsTab/ColumnsTab";
import VLCTab from "./VLCTab";

const dataSettabs = ["Settings", "Dataset Columns", "VLC"];
const userInfo = getUserInfo();

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
  const params = useParams();
  const messageContext = useContext(MessageContext);
  const history = useHistory();
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const packageData = useSelector((state) => state.dataPackage);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { selectedDSDetails } = packageData;
  const {
    selectedCard,
    selectedDataFlow: { dataFlowId: dfId },
  } = dashboard;
  const {
    datapackageid: dpId,
    datapackageName,
    datasetName,
    fromWhere,
  } = selectedDSDetails;
  const {
    loading,
    error,
    sucessMsg,
    isDatasetCreated,
    dsCreatedSuccessfully,
    selectedDataset,
    formDataSQL,
    isDatasetFetched,
  } = dataSets;
  const datasetid = params.datasetId;
  const { prot_id: studyId } = selectedCard;
  const {
    dataFlowdetail,
    dsProdLock,
    dsTestLock,
    dsTestProdLock,
    isDatasetCreation,
  } = dataFlow;
  const { name, loctyp, testflag, srclocid } = dataFlowdetail;
  const { datasetid: dsId } = selectedDataset;
  const { isCustomSQL, tableName } = formDataSQL;

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
    if (v === 1) {
      dispatch(getDatasetColumns(datasetid));
    }
  };

  const getDataSetType = (type) => {
    if (type === "SFTP" || type === "FTPS") {
      return "sftp";
    }
    return "jdbc";
  };

  useEffect(() => {
    if (dfId === "") {
      history.push("/dashboard");
    }
    dispatch(getDataKindData());
    if (fromWhere === "IngestionProperties") {
      if (selectedDSDetails.dataflowid) {
        dispatch(getDataFlowDetail(selectedDSDetails.dataflowid));
      } else {
        history.push("/dashboard");
      }
    }
  }, []);

  useEffect(() => {
    setValue(0);
    setColumnsActive(false);
  }, [params]);

  useEffect(() => {
    if (datasetid === null || datasetid === "new") {
      dispatch(resetFTP());
      dispatch(resetJDBC());
    } else {
      dispatch(getDataSetDetail(datasetid, dfId, dpId));
      dispatch(getDatasetColumns(datasetid));
    }
  }, [datasetid, dsCreatedSuccessfully]);

  useEffect(() => {
    if (isDatasetCreated && isDatasetCreation) {
      messageContext.showSuccessMessage("Dataset was saved successfully");
      history.push(`/dashboard/dataset/${dsId}`);
      dispatch(updatePanel());
    }
  }, [isDatasetCreated, isDatasetCreation]);

  useEffect(() => {
    if (loctyp) {
      setLocationType(getDataSetType(loctyp));
    }
  }, [loctyp]);

  useEffect(() => {
    if (dsCreatedSuccessfully) {
      setTimeout(() => {
        if (isSftp(loctyp)) {
          setValue(1);
          setColumnsActive(true);
        } else if (isCustomSQL === "No") {
          setColumnsActive(true);
          setValue(1);
        } else {
          setColumnsActive(false);
        }
      }, 2000);
    }
  }, [dsCreatedSuccessfully, loctyp, isCustomSQL]);

  useEffect(() => {
    setTimeout(() => {
      if (isSftp(locationType)) {
        setColumnsActive(true);
      } else if (isCustomSQL === "No") {
        setColumnsActive(true);
      } else {
        setColumnsActive(false);
      }
    }, 2000);
  }, [isDatasetFetched, locationType]);

  const goToDataflow = () => {
    if (dfId) {
      history.push(`/dashboard/dataflow-management/${dfId}`);
    }
  };

  const gotoDataPackage = () => {
    if (dpId) {
      history.push("/dashboard/data-packages");
    }
  };

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: name ?? "Dataflow Name",
      onClick: goToDataflow,
    },
    {
      href: "javascript:void(0)",
      title: datapackageName || "No Package",
      onClick: gotoDataPackage,
    },
    {
      href: "#",
      title: datasetName ?? "Create Dataset",
    },
  ];

  const jdbcRef = useRef();

  const submitForm = () => {
    if (isSftp(locationType)) {
      dispatch(submit("DataSetsForm"));
    } else {
      dispatch(submit("DataSetsFormSQL"));
      // jdbcRef.current.handleSubmit();
    }
  };

  const onSubmit = (formValue) => {
    // eslint-disable-next-line consistent-return
    setTimeout(() => {
      const data = {
        ...formValue,
        dpId,
        userId: userInfo.userId,
        locationType: getDataSetType(loctyp),
        testFlag: testflag,
        dfId,
        studyId,
      };
      console.log("formValue", formValue);
      if (formValue?.sQLQuery?.includes("*")) {
        messageContext.showErrorMessage(
          `Please remove * from query to proceed.`
        );
        return false;
      }
      if (data.datasetid) {
        dispatch(updateDatasetData(data));
      } else {
        dispatch(saveDatasetData(data));
      }
    }, 400);
  };

  const closeForm = async () => {
    if (isSftp(locationType)) {
      await dispatch(reset("DataSetsForm"));
    } else {
      await dispatch(reset("DataSetsFormSQL"));
      // jdbcRef.current.handleCancel();
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

  return (
    <>
      {error && messageContext.showErrorMessage(error)}
      {sucessMsg && messageContext.showSuccessMessage(sucessMsg)}

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
                  {datasetName ?? selectedDataset.datasetName ?? "Dataset name"}
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
                        disabled={
                          (!columnsActive && tab === "Dataset Columns") ||
                          (!columnsActive && tab === "VLC")
                        }
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
                  {isSftp(locationType) ? (
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
                //   dpId={dpId}
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
                  dfId={dfId}
                  dpId={dpId}
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
