/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
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
import "./DataFlow.scss";
import DataFlowForm from "./DataFlowForm";
import {
  getVendorsData,
  updateSelectedLocation,
  getServiceOwnersData,
  changeFormFieldData,
  hideErrorMessage,
  getLocationByType,
} from "../../store/actions/DataFlowAction";

import { ReactComponent as DataPackageIcon } from "../../components/Icons/datapackage.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
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

const onSubmit = (values) => {
  setTimeout(() => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(values, null, 2));
  }, 400);
};

const breadcrumbItems = [
  { href: "/dashboard" },
  {
    title: "Data Flow Settings",
    href: "#",
  },
];

const DataFlow = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const dataFlowData = useSelector((state) => state.dataFlow);
  const { selectedLocation, loading, createTriggered, error } = dataFlowData;
  const [locType, setLocType] = useState("SFTP");
  const [modalLocType, setModalLocType] = useState("SFTP");
  const pullVendorandLocation = () => {
    dispatch(getVendorsData());
    dispatch(getLocationByType(locType));
    dispatch(getServiceOwnersData());
  };
  useEffect(() => {
    pullVendorandLocation();
  }, []);

  useEffect(() => {
    if (modalLocType === locType) {
      dispatch(getLocationByType(locType));
    }
  }, [createTriggered]);

  const changeLocationData = (value) => {
    const locationsRec = dataFlowData.locations?.records ?? [];
    const location = locationsRec?.find(
      // eslint-disable-next-line eqeqeq
      (loc) => value == loc.src_loc_id
    );
    dispatch(updateSelectedLocation(location));
  };
  const changeFormField = (value, field) => {
    dispatch(changeFormFieldData(value, field));
  };
  const changeLocationType = (value) => {
    dispatch(getLocationByType(value));
    setLocType(value);
  };
  const modalLocationType = (value) => {
    setModalLocType(value);
  };
  const closeForm = async () => {
    await dispatch(reset("DataFlowForm"));
    history.push("/dashboard");
  };

  const submitForm = () => {
    dispatch(submit("DataFlowForm"));
  };

  return (
    <div className={classes.root}>
      <PageHeader />
      <CssBaseline />
      {loading && <Loader />}
      {error && (
        <Banner
          variant="error"
          open={true}
          onClose={() => dispatch(hideErrorMessage())}
          style={{ zIndex: 9999, top: "15%" }}
          message={error}
        />
      )}
      <div className={classes.toolbar} />
      <Leftbar />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <div className="content">
          <div className={classes.contentHeader}>
            <Header
              close={closeForm}
              submit={submitForm()}
              breadcrumbItems={breadcrumbItems}
              headerTitle="Virologicclinic-IIBR12-001-Other"
              icon={<DataPackageIcon className={classes.contentIcon} />}
              datasetsCount={6}
            />
          </div>
          <Divider />
          <div className={classes.formSection}>
            <DataFlowForm
              onSubmit={onSubmit}
              changeLocationData={changeLocationData}
              changeFormField={changeFormField}
              changeLocationType={changeLocationType}
              modalLocationType={modalLocationType}
              userName={selectedLocation?.usr_nm}
              password={selectedLocation?.pswd}
              connLink={selectedLocation?.cnn_url}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataFlow;
