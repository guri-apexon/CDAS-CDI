import React, { lazy, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import Typography from "apollo-react/components/Typography";
// import Tab from "apollo-react/components/Tab";
// import Tabs from "apollo-react/components/Tabs";
import Panel from "apollo-react/components/Panel/Panel";
import PageHeader from "../../components/DataFlow/PageHeader";
import Header from "../../components/DataFlow/Header";
import LeftPanel from "../../components/DataFlow/LeftPanel/LeftPanel";
import "./Dataset.scss";
import { ReactComponent as DatasetsIcon } from "../../components/Icons/dataset.svg";
import SettingsTab from "./SettingsTab";
import ColumnsTab from "./ColumnsTab/ColumnsTab";
import VLCTab from "./VLCTab";
// const SettingsTab = lazy(() => import("./SettingsTab"));
// const ColumnsTab = lazy(() => import("./ColumnsTab/ColumnsTab"));
// const VLCTab = lazy(() => import("./VLCTab"));

const tabs = ["Settings", "Dataset Columns", "VLC"];

const Dataset = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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

  const breadcrumbItems = [
    { href: "#" },
    {
      title: optedDataPackages.dataflowid ?? "Dataflow Name",
    },
    {
      title: optedDataPackages.datapackageid ?? "Datapackage Name",
    },
    {
      title: "Create Dataset",
    },
  ];

  const submitForm = () => {
    if (
      locationType?.toLowerCase() === "sftp" ||
      locationType?.toLowerCase() === "ftps"
    ) {
      // dispatch(submit("DataSetsForm"));
    } else {
      // dispatch(submit("DataSetsFormSQL"));
    }
  };

  const closeForm = async () => {
    if (
      locationType?.toLowerCase() === "sftp" ||
      locationType?.toLowerCase() === "ftps"
    ) {
      // await dispatch(reset("DataSetsForm"));
    } else {
      // await dispatch(reset("DataSetsFormSQL"));
    }
    history.push("/dashboard");
  };

  return (
    <>
      <PageHeader height={64} />
      <div className="pageRoot">
        <Panel
          onClose={handleClose}
          onOpen={handleOpen}
          open={isPanelOpen}
          width={446}
        >
          <LeftPanel />
        </Panel>
        <Panel className={classes.rightPanel} width="100%" hideButton>
          <main className={classes.content}>
            <div className={classes.contentHeader}>
              {/* <Typography
                className={classes.contentTitle}
                variant="title1"
                gutterBottom
              >
                Ingestion Dashboard
              </Typography>
              <Tabs value={value} onChange={handleChangeTab} truncate>
                <Tab label="Settings" />
                <Tab label="Dataset Columns" />
                <Tab label="VLC" />
              </Tabs> */}
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

            <div style={{ padding: 20 }}>
              {value === 0 && <SettingsTab locationType={locationType} />}
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
