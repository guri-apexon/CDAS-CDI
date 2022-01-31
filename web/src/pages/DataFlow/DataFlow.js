/* eslint-disable no-script-url */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Panel from "apollo-react/components/Panel";
import { useDispatch, useSelector } from "react-redux";
import { submit, reset } from "redux-form";
import Loader from "apollo-react/components/Loader";
import Banner from "apollo-react/components/Banner";
import Divider from "apollo-react/components/Divider";
import PageHeader from "../../components/DataFlow/PageHeader";
// import Leftbar from "../../components/DataFlow/LeftBar";
import LeftPanel from "../../components/Dataset/LeftPanel/LeftPanel";
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
  rightPanel: {
    maxWidth: "calc(100vw - 425px)",
    width: "calc(100vw - 425px)",
  },
  rightPanelExtended: {
    maxWidth: "calc(100vw - 42px)",
    width: "calc(100vw - 40px)",
  },
  // necessary for content to be below app bar
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

const DataFlow = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
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

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: "Data Flow Settings",
      onClick: () => history.push("/dataflow-management"),
    },
  ];

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

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleOpen = () => {
    setIsPanelOpen(true);
  };

  return (
    <div className={classes.root}>
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
      {/* <Leftbar /> */}
      <Panel
        onClose={handleClose}
        onOpen={handleOpen}
        open={isPanelOpen}
        width={407}
      >
        <LeftPanel />
      </Panel>
      <Panel
        className={
          isPanelOpen ? classes.rightPanel : classes.rightPanelExtended
        }
        width="100%"
        hideButton
      >
        <main className={classes.content}>
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
      </Panel>
    </div>
  );
};

export default DataFlow;
