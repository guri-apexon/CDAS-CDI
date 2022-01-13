/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { useDispatch, useSelector } from "react-redux";
import { submit, reset } from "redux-form";
import Loader from "apollo-react/components/Loader";
import Banner from "apollo-react/components/Banner";
import Divider from "apollo-react/components/Divider";
import PageHeader from "../../components/DataFlow/PageHeader";
import Leftbar from "../../components/DataFlow/LeftBar";
import Header from "../../components/DataFlow/Header";
import DataSetsForm from "./DataSetsForm";
import ColumnsTab from "./ColumnsTab";
import VLCTab from "./VLCTab";
import "./DataSets.scss";
import {
  getDataKindData,
  hideErrorMessage,
  saveDatasetData,
} from "../../store/actions/DataSetsAction";

import { ReactComponent as DatasetsIcon } from "../../components/Icons/dataset.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
  },
  contentIcon: {
    color: "#595959",
  },
  contentHeader: {
    paddingTop: 11,
    padding: "16px 25px",
    backgroundColor: "#ffffff",
  },
  formSection: {
    display: "block",
    margin: "22px 15px",
  },
}));

const DataSets = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const dataSets = useSelector((state) => state.dataSets);
  const packageData = useSelector((state) => state.dataPackage);
  const { optedDataPackages } = packageData;
  const { loading, error, sucessMsg, createTriggered, selectedDataset } =
    dataSets;
  const [tabValue, setTabValue] = React.useState(0);
  const tabs = ["Settings", "Dataset Columns", "VLC"];

  useEffect(() => {
    if (Object.keys(optedDataPackages).length === 0) {
      history.push("/dataflow-management");
    }
    dispatch(getDataKindData());
  }, []);

  useEffect(() => {
    console.log(selectedDataset, "selectedDataset");
    if (createTriggered) {
      setTabValue(1);
    }
  }, [createTriggered]);

  const closeForm = async () => {
    await dispatch(reset("DataSetsForm"));
    history.push("/dashboard");
  };

  const submitForm = () => {
    dispatch(submit("DataSetsForm"));
  };

  const handleChangeTab = (event, value) => {
    setTabValue(value);
  };

  const onSubmit = (values) => {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(values, null, 2));
      dispatch(saveDatasetData(values));
    }, 400);
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
  return (
    <div className={classes.root}>
      <PageHeader />
      <CssBaseline />
      {loading && <Loader />}
      {(error || sucessMsg) && (
        <Banner
          variant={sucessMsg ? "success" : "error"}
          open={true}
          onClose={() => dispatch(hideErrorMessage())}
          style={{ zIndex: 9999, top: "5%" }}
          message={error}
        />
      )}
      <div className={classes.toolbar} />
      {/* <Leftbar /> */}
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <div className="content">
          <div className={classes.contentHeader}>
            <Header
              close={() => closeForm()}
              breadcrumbItems={breadcrumbItems || []}
              submit={() => submitForm()}
              tabs={tabs}
              headerTitle="Dataset name"
              tabValue={tabValue}
              selectedDataset={selectedDataset}
              icon={<DatasetsIcon className={classes.contentIcon} />}
              handleChangeTab={handleChangeTab}
            />
          </div>
          <Divider />
          <div className={classes.formSection}>
            {tabValue === 0 && <DataSetsForm onSubmit={onSubmit} />}
            {tabValue === 1 && <ColumnsTab />}
            {tabValue === 2 && <VLCTab />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataSets;
