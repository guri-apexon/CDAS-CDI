/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
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
import DataSetsFormSQL from "./DataSetsFormSQL";
import ColumnsTab from "./ColumnsTab";
import VLCTab from "./VLCTab";
import "./DataSets.scss";
import {
  getDataKindData,
  hideErrorMessage,
  saveDatasetData,
  updateDatasetData,
  getDataSetDetail,
  getDatasetColumns,
} from "../../store/actions/DataSetsAction";

import { getDataFlowDetail } from "../../store/actions/DataFlowAction";

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
  const dataFlow = useSelector((state) => state.dataFlow);
  const { optedDataPackages } = packageData;
  const { loading, error, sucessMsg, createTriggered, selectedDataset } =
    dataSets;
  const { dataFlowdetail } = dataFlow;
  const [tabValue, setTabValue] = useState(0);
  const [locationType, setLocationType] = useState(null);
  const tabs = ["Settings", "Dataset Columns", "VLC"];

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
    setLocationType(dataFlowdetail?.loc_typ);
    console.log(dataFlowdetail);
  }, [dataFlowdetail]);

  useEffect(() => {
    console.log(selectedDataset, "selectedDataset");
    if (createTriggered) {
      setTabValue(1);
    }
  }, [createTriggered]);

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

  const handleChangeTab = (event, value) => {
    setTabValue(value);
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
          message={error || sucessMsg}
        />
      )}
      <div className={classes.toolbar} />
      <Leftbar />
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
            {tabValue === 0 &&
              (locationType?.toLowerCase() === "sftp" ||
                locationType?.toLowerCase() === "ftps") && (
                <DataSetsForm onSubmit={onSubmit} />
              )}
            {tabValue === 0 &&
              locationType?.toLowerCase() !== "sftp" &&
              locationType?.toLowerCase() !== "ftps" && (
                <DataSetsFormSQL onSubmit={onSubmit} />
              )}
            {tabValue === 1 && <ColumnsTab locationType={locationType} />}
            {tabValue === 2 && <VLCTab />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataSets;
