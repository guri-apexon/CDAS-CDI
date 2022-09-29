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
import Modal from "apollo-react/components/Modal/Modal";
import Banner from "apollo-react/components/Banner";
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
  getVLCData,
  setDataSetColumnCount,
} from "../../store/actions/DataSetsAction";
import {
  updatePanel,
  redirectToDataSet,
  selectDataPackage,
} from "../../store/actions/DataPackageAction";
import { SelectedDataflow } from "../../store/actions/DashboardAction";

import {
  getDataFlowDetail,
  updateDSState,
} from "../../store/actions/DataFlowAction";
import { checkFormChanges, getUserInfo, isSftp } from "../../utils";
import DataSetsForm from "./DataSetsForm";
import DataSetsFormSQL from "./DataSetsFormSQL";
// import JDBCForm from "./JDBCForm";
import ColumnsTab from "./ColumnsTab/ColumnsTab";
import VLCTab from "./VLCTab";
import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../components/Common/usePermission";
import SaveChangesModal from "../../components/DataFlow/SaveChangesModal";
import { formComponentActive } from "../../store/actions/AlertActions";

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
  const [openModal, setopenModal] = useState(false);
  const [checkDatasetColumnsExist, setDatasetColumnsExist] = useState(true);
  const [showSaveChangeModal, setShowSaveChangeModal] = useState(true);
  const [tempTabValue, setTempTabValue] = useState(0);
  const [manualTriggerToggle, setManualTriggerToggle] = useState(false);
  const [shouldTriggerRedirect, setShouldTriggerRedirect] = useState(true);
  const [columnsEditMode, setColumnsEditMode] = useState(false);

  // Save Change Master Flag
  const SAVE_CHANGE_MODAL_FLAG =
    process.env.REACT_APP_SAVE_CHANGE_MODAL_FLAG === "true"
      ? true
      : false || false;

  const dispatch = useDispatch();
  const params = useParams();
  const messageContext = useContext(MessageContext);
  const history = useHistory();
  const dataSets = useSelector((state) => state.dataSets);
  const packageData = useSelector((state) => state.dataPackage);
  const dashboardData = useSelector((state) => state.dashboard);

  const {
    dataFlowdetail: { name, loctyp, testflag, srclocid },
    dsProdLock,
    dsTestLock,
    dsTestProdLock,
    isDatasetCreation,
    versionFreezed,
  } = useSelector((state) => state.dataFlow);
  const {
    selectedCard,
    selectedDataFlow: { dataFlowId: dfId },
  } = useSelector((state) => state.dashboard);
  const form = useSelector((state) => state.form);
  const { prot_id: studyId } = selectedCard;

  const { canUpdate: canUpdateDataFlow, canCreate: CanCreateDataFlow } =
    useStudyPermission(
      Categories.CONFIGURATION,
      Features.DATA_FLOW_CONFIGURATION,
      studyId
    );

  const { selectedDSDetails } = packageData;
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
    VLCData,
    datasetColumns,
    dataSetRowCount,
    previewedSql,
    datasetUpdated,
  } = dataSets;

  const datasetid = params.datasetId;
  const createMode = datasetid === "new";
  const { datasetid: dsId } = selectedDataset;
  const { isCustomSQL, tableName } = formDataSQL;

  const dataSettabs = [
    "Settings",
    "Dataset Columns",
    ...(datasetid !== "new" && VLCData?.length ? ["VLC"] : []),
  ];

  const useStyles = makeStyles(styles);
  const classes = useStyles();

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleOpen = () => {
    setIsPanelOpen(true);
  };

  // Set form to active set for alert box configuration
  useEffect(() => {
    if (SAVE_CHANGE_MODAL_FLAG) {
      const isAnyChange =
        form?.DataSetsForm?.anyTouched ||
        form?.DataSetsFormSQL?.anyTouched ||
        false;
      if (isAnyChange) {
        dispatch(formComponentActive());
      }
    }
  }, [form]);

  const handleChangeTab = (event, v) => {
    if (SAVE_CHANGE_MODAL_FLAG) {
      setManualTriggerToggle(true);
      setTempTabValue(v);

      // check if there is any changes within form and set toggle for modal
      let isAnyChange = false;
      if (isSftp(locationType)) {
        isAnyChange = checkFormChanges(form, form?.DataSetsForm) || false;
      } else {
        isAnyChange = checkFormChanges(form, form?.DataSetsFormSQL) || false;
      }
      if (isAnyChange) {
        setManualTriggerToggle(true);
      }
      // set toggle in case of column tab and changes within columns
      if (v === 0 && dataSetRowCount > 0) {
        setManualTriggerToggle(true);
      }
      // if there is no change in data then proceed forward
      if ((v !== 0 && !isAnyChange) || (v === 0 && dataSetRowCount === 0)) {
        setValue(v);
        if (datasetid !== "new" && datasetid !== null) {
          dispatch(getDatasetColumns(datasetid));
        }
        setManualTriggerToggle(false);
      }
    } else {
      setValue(v);
      if (datasetid !== "new" && datasetid !== null) {
        dispatch(getDatasetColumns(datasetid));
      }
    }
  };

  // logic to run after user click discard changes on save modal
  const handlePostDiscardChange = () => {
    setValue(tempTabValue);
    if (datasetid !== "new" && datasetid !== null) {
      dispatch(getDatasetColumns(datasetid));
    }
    setManualTriggerToggle(false);
  };

  // logic to run after user click continue editing changes on save modal
  const handlePostContinue = () => {
    setManualTriggerToggle(false);
  };

  const handleManualChecker = (isAnyChange) => {
    if (value === 1 && dataSetRowCount > 0) {
      return true;
    }
    return isAnyChange;
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
    setDatasetColumnsExist(datasetColumns.length ? true : false);
  }, []);

  useEffect(() => {
    setDatasetColumnsExist(datasetColumns.length ? true : false);
  }, [datasetColumns.length]);

  useEffect(() => {
    setValue(0);
    //   setColumnsActive(false);
    if (createMode || !(!createMode && isDatasetCreated && isDatasetCreation)) {
      dispatch(resetJDBC());
    }
  }, [params]);

  useEffect(() => {
    if (datasetid === null || datasetid === "new") {
      dispatch(resetFTP());
    } else {
      dispatch(getDataSetDetail(datasetid, dfId, dpId));
      if (isSftp(locationType)) dispatch(getDatasetColumns(datasetid));
      dispatch(getVLCData(datasetid));
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
    if (datasetUpdated && isCustomSQL?.toLowerCase() === "no") {
      setColumnsActive(true);
      setValue(1);
      console.log("datasetUpdated", datasetUpdated);
    }
  }, [datasetUpdated]);

  useEffect(() => {
    if (dsCreatedSuccessfully) {
      setShouldTriggerRedirect(false);
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
        setShouldTriggerRedirect(true);
      }, 2000);
    }
    return () => {
      setShouldTriggerRedirect(true);
    };
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
    const selectedPackage = packageData?.packagesList?.find(
      (e) => e?.datapackageid === selectedDSDetails?.datapackageid
    );
    dispatch(selectDataPackage(selectedPackage));
    history.push("/dashboard/data-packages");
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
    setShouldTriggerRedirect(false);
    // eslint-disable-next-line consistent-return
    setTimeout(() => {
      setShouldTriggerRedirect(false);
      const data = {
        ...formValue,
        dpId,
        userId: userInfo.userId,
        locationType: getDataSetType(loctyp),
        testFlag: testflag,
        dfId,
        studyId,
        versionFreezed,
      };
      // if (formValue.tableName && Array.isArray(formValue.tableName)) {
      //   // eslint-disable-next-line prefer-destructuring
      //   data.tableName = formValue.tableName[0];
      // }
      if (formValue?.sQLQuery?.includes("*")) {
        messageContext.showErrorMessage(
          `Please remove * from query to proceed.`
        );
        return false;
      }
      if (
        createMode &&
        formValue?.isCustomSQL?.toLowerCase() === "yes" &&
        !previewedSql
      ) {
        dispatch(hideErrorMessage());
        messageContext.showErrorMessage("Please hit previewSql to proceed");
        return false;
      }
      if (data.datasetid) {
        if (
          datasetColumns.every((x) => x.primarykey !== 1) &&
          formValue.loadType === "Incremental"
        ) {
          messageContext.showErrorMessage(
            `Load type cannot be changed to incremental because no primaryKey is defined for the dataset.`
          );
          return false;
        }
        if (
          !isSftp(locationType) &&
          formValue?.isCustomSQL?.toLowerCase() === "yes"
        ) {
          if (data?.dataType) {
            delete data.dataType;
          }
          dispatch(resetJDBC(["sqlColumns", "datasetColumns"]));
        }
        dispatch(updateDatasetData(data));
      } else {
        dispatch(saveDatasetData(data));
        const selectedDataFlow = {
          ...dashboardData.selectedDataFlow,
          dataSets: (dashboardData.selectedDataFlow?.dataSets || 0) + 1,
        };
        dispatch(SelectedDataflow(selectedDataFlow));
      }

      if (!isSftp(locationType))
        setColumnsEditMode(createMode || formValue.tableName !== tableName);
    }, 400);
  };

  const closeForm = async () => {
    if (isSftp(locationType)) {
      await dispatch(reset("DataSetsForm"));
    } else {
      await dispatch(reset("DataSetsFormSQL"));
      // jdbcRef.current.handleCancel();
    }
    setShowSaveChangeModal(false);
    history.push("/dashboard");
    setShowSaveChangeModal(true);
  };

  useEffect(() => {
    setTimeout(() => {
      dispatch(hideErrorMessage());
    }, 7500);
  }, [error, sucessMsg]);

  useEffect(() => {
    if (sucessMsg && !error && selectedDataset) {
      dispatch(updatePanel());
    }
  }, [sucessMsg, error, selectedDataset]);

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
              {/* Save Changes Modal */}
              {showSaveChangeModal && (
                <SaveChangesModal
                  isManualTrigger={true}
                  manualCheckerFlag={true}
                  handleManualChecker={handleManualChecker}
                  manualTriggerToggle={manualTriggerToggle}
                  handlePostManualContinue={handlePostContinue}
                  handlePostManualDiscardChange={handlePostDiscardChange}
                  shouldTriggerOnRedirect={shouldTriggerRedirect}
                />
              )}
              <Modal
                open={openModal}
                variant="warning"
                onClose={() => setopenModal(false)}
                title="Lose your work?"
                message="All unsaved changes will be lost."
                buttonProps={[
                  {
                    label: "Keep editing",
                    onClick: () => setopenModal(false),
                  },
                  {
                    variant: "primary",
                    label: "Leave without saving",
                    onClick: () => {
                      setopenModal(false);
                      closeForm();
                    },
                  },
                ]}
                id="success"
              />
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
                        // disabled={
                        //   (!columnsActive && tab === "Dataset Columns") ||
                        //   (!columnsActive && tab === "VLC")
                        // }
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
                        onClick: () => setopenModal(true),
                        disabled: !canUpdateDataFlow,
                      },
                      {
                        label: "Save",
                        onClick: () => submitForm(),
                        disabled: !canUpdateDataFlow,
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
                      testLock={dsTestLock}
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
                  createMode={createMode}
                  columnsEditMode={columnsEditMode}
                  setDatasetColumnsExist={(disableSave) =>
                    setDatasetColumnsExist(disableSave)
                  }
                  selectedDataset={selectedDataset}
                />
              )}
              {datasetid !== "new" && value === 2 && !!VLCData?.length && (
                <VLCTab />
              )}
            </div>
          </main>
        </Panel>
      </div>
    </>
  );
};

export default Dataset;
