/* eslint-disable no-script-url */
import React, { useState, useContext, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submit, reset } from "redux-form";
import Banner from "apollo-react/components/Banner";
import Panel from "apollo-react/components/Panel/Panel";
import Header from "./Header";
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
  contentIcon: {
    color: "#595959",
  },
};

const Dataset = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [value, setValue] = useState(0);
  const [locationType, setLocationType] = useState("sftp");
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const history = useHistory();
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const packageData = useSelector((state) => state.dataPackage);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { selectedDSDetails } = packageData;
  const { selectedDFId } = dashboard;
  const { dataflowid, datasetid } = selectedDSDetails;
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
              <Header
                close={() => closeForm()}
                breadcrumbItems={breadcrumbItems || []}
                submit={() => submitForm()}
                tabs={dataSettabs}
                headerTitle={selectedDSDetails.datasetName ?? "Dataset name"}
                tabValue={value}
                selectedDataset={selectedDataset}
                handleChangeTab={handleChangeTab}
              />
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
                  <DataSetsFormSQL loading={loading} onSubmit={onSubmit} />
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
