import React, { lazy, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submit, reset } from "redux-form";
import Banner from "apollo-react/components/Banner";
// import Typography from "apollo-react/components/Typography";
// import Tab from "apollo-react/components/Tab";
// import Tabs from "apollo-react/components/Tabs";
import Panel from "apollo-react/components/Panel/Panel";
import PageHeader from "../../components/DataFlow/PageHeader";
import Header from "../../components/DataFlow/Header";
import LeftPanel from "../../components/DataFlow/LeftPanel/LeftPanel";
import "./Dataset.scss";
import { ReactComponent as DatasetsIcon } from "../../components/Icons/dataset.svg";
import {
  hideErrorMessage,
  getDataKindData,
  saveDatasetData,
  updateDatasetData,
  getDataSetDetail,
  getDatasetColumns,
} from "../../store/actions/DataSetsAction";
import { getDataFlowDetail } from "../../store/actions/DataFlowAction";
// import SettingsTab from "./SettingsTab";
import DataSetsForm from "./DataSetsForm";
import DataSetsFormSQL from "./DataSetsFormSQL";
import ColumnsTab from "./ColumnsTab/ColumnsTab";
import VLCTab from "./VLCTab";
// const SettingsTab = lazy(() => import("./SettingsTab"));
// const ColumnsTab = lazy(() => import("./ColumnsTab/ColumnsTab"));
// const VLCTab = lazy(() => import("./VLCTab"));

const tabs = ["Settings", "Dataset Columns", "VLC"];

const Dataset = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [value, setValue] = useState(0);
  const [locationType, setLocationType] = useState(null);

  const dispatch = useDispatch();
  const history = useHistory();
  const dataSets = useSelector((state) => state.dataSets);
  const packageData = useSelector((state) => state.dataPackage);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { optedDataPackages } = packageData;
  const { loading, error, sucessMsg, createTriggered, selectedDataset } =
    dataSets;
  const { dataFlowdetail } = dataFlow;

  const styles = {
    rightPanel: {
      maxWidth: isPanelOpen ? "calc(100vw - 466px)" : "calc(100vw - 42px)",
      width: isPanelOpen ? "calc(100vw - 464px)" : "calc(100vw - 40px)",
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
    console.log(selectedDataset, "selectedDataset");
    if (createTriggered) {
      setValue(1);
    }
  }, [createTriggered]);

  useEffect(() => {
    if (Object.keys(optedDataPackages).length === 0) {
      history.push("/dataflow-management");
    }
    dispatch(getDataKindData());
    if (optedDataPackages?.dataflowid) {
      dispatch(getDataFlowDetail(optedDataPackages?.dataflowid));
    }
    if (optedDataPackages?.datasetid) {
      dispatch(getDataSetDetail(optedDataPackages?.datasetid));
      dispatch(getDatasetColumns(optedDataPackages?.datasetid));
    }
  }, []);

  useEffect(() => {
    if (optedDataPackages?.dataflowid) {
      dispatch(getDataFlowDetail(optedDataPackages?.dataflowid));
    }
    if (optedDataPackages?.datasetid) {
      dispatch(getDataSetDetail(optedDataPackages?.datasetid));
      dispatch(getDatasetColumns(optedDataPackages?.datasetid));
    }
  }, [optedDataPackages]);

  useEffect(() => {
    if (dataFlowdetail?.loc_typ) {
      setLocationType(dataFlowdetail?.loc_typ);
    }
  }, [dataFlowdetail]);

  const breadcrumbItems = [
    { href: "#" },
    {
      title: optedDataPackages.dataflowid ?? "Dataflow Name",
    },
    {
      title: optedDataPackages.datapackageid ?? "Datapackage Name",
    },
    {
      title: optedDataPackages.datasetid ?? "Create Dataset",
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
        datapackageid: optedDataPackages?.datapackageid,
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

  return (
    <>
      <PageHeader height={64} />
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
        <Panel className={classes.rightPanel} width="100%" hideButton>
          <main className={classes.content}>
            <div className={classes.contentHeader}>
              <Header
                close={() => closeForm()}
                breadcrumbItems={breadcrumbItems || []}
                submit={() => submitForm()}
                tabs={tabs}
                headerTitle="Dataset name"
                tabValue={value}
                selectedDataset={selectedDataset}
                icon={<DatasetsIcon className={classes.contentIcon} />}
                handleChangeTab={handleChangeTab}
              />
            </div>

            <div style={{ padding: 20, marginTop: 20 }}>
              {value === 0 &&
                (locationType?.toLowerCase() === "sftp" ||
                  locationType?.toLowerCase() === "ftps") && (
                  <DataSetsForm onSubmit={onSubmit} />
                )}
              {value === 0 &&
                locationType?.toLowerCase() !== "sftp" &&
                locationType?.toLowerCase() !== "ftps" && (
                  <DataSetsFormSQL onSubmit={onSubmit} />
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
