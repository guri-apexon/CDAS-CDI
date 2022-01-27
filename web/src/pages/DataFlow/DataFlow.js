/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { useDispatch, useSelector, connect } from "react-redux";
import { submit, reset, getFormValues } from "redux-form";
import Loader from "apollo-react/components/Loader";
import { values } from "lodash";
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
  addDataFlow,
} from "../../store/actions/DataFlowAction";
import { toast } from "../../utils";
import { ReactComponent as DataPackageIcon } from "../../components/Icons/datapackage.svg";
import { MessageContext } from "../../components/MessageProvider";

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

const onSubmit = () => {
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

const DataFlow = ({ FormValues, dashboard }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const dataFlowData = useSelector((state) => state.dataFlow);
  const { selectedLocation, loading, createTriggered, error } = dataFlowData;
  const [locType, setLocType] = useState("SFTP");
  const [modalLocType, setModalLocType] = useState("SFTP");
  const messageContext = useContext(MessageContext);

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

  const submitForm = async () => {
    const protId = dashboard.selectedCard.prot_id;
    console.log("FormValues?", FormValues);
    console.log("protId", protId);
    if (
      FormValues.vendor &&
      FormValues.locationName &&
      FormValues.firstFileDate &&
      FormValues.serviceOwnerValue &&
      FormValues.description !== "" &&
      protId !== ""
    ) {
      const payload = {
        vendorID: FormValues.vendor[0],
        locationName: FormValues.locationName[0],
        dataStructure: FormValues.dataStructure,
        connectionType: FormValues.dataflowType,
        testFlag: FormValues.dataflowType === "test" ? "true" : "false",
        prodFlag: FormValues.dataflowType === "production" ? "true" : "false",
        description: FormValues.description,
        firstFileDate: FormValues.firstFileDate,
        locationType: FormValues.locationType,
        serviceOwnerValue: FormValues.serviceOwnerValue[0].label,
        protocolNumberStandard: protId,
        externalSystemName: "CDI",
      };
      await dispatch(addDataFlow(payload));
      history.push("/dashboard");
    } else {
      messageContext.showErrorMessage("Please fill all fields to proceed");
    }
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
              submit={submitForm}
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

// export default DataFlow;

export default connect((state) => ({
  FormValues: getFormValues("DataFlowForm")(state),
  dashboard: state.dashboard,
}))(DataFlow);
