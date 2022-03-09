/* eslint-disable no-script-url */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
// import CssBaseline from "@material-ui/core/CssBaseline";
import Panel from "apollo-react/components/Panel";
import { useDispatch, useSelector, connect } from "react-redux";
import { submit, reset, getFormValues } from "redux-form";
import Loader from "apollo-react/components/Loader";
import { values } from "lodash";
import Banner from "apollo-react/components/Banner";
import Divider from "apollo-react/components/Divider";
import LeftPanel from "./LeftPanel";
// eslint-disable-next-line import/no-unresolved
import Header from "./Header";
import "../DataFlow.scss";
import DataFlowForm from "./DataFlowForm";
import {
  getVendorsData,
  updateSelectedLocation,
  getServiceOwnersData,
  changeFormFieldData,
  hideErrorMessage,
  getLocationByType,
  addDataFlow,
} from "../../../store/actions/DataFlowAction";
import DataPackages from "./Datapackage";
import { ReactComponent as DataPackageIcon } from "../../../components/Icons/datapackage.svg";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import DataSet from "./Dataset";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
  },
  rightPanel: {
    maxWidth: "calc(100vw - 466px)",
    width: "calc(100vw - 464px)",
  },
  rightPanelExtended: {
    maxWidth: "calc(100vw - 42px)",
    width: "calc(100vw - 40px)",
  },
  // necessary for content to be below app bar
  content: {
    flexGrow: 1,
    backgroundColor: "#f6f7fb",
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

const DataFlow = ({ FormValues, dashboard, datasetFormValues }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const [myform, setForm] = useState({});
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [compression, setCompression] = useState("not_compressed");
  const [namingConvention, setNamingConvention] = useState("");
  const [packagePassword, setPackagePassword] = useState("");
  const [FormType, setFormType] = useState("dataflow");
  const [sftpPath, setSftpPath] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDatapackage, setselectedDatapackage] = useState("");
  const dataFlowData = useSelector((state) => state.dataFlow);
  const { selectedLocation, loading, error } = dataFlowData;
  const { createTriggered, upsertLoading } = useSelector(
    (state) => state.cdiadmin
  );
  const [locType, setLocType] = useState("SFTP");
  const [modalLocType, setModalLocType] = useState("SFTP");
  const messageContext = useContext(MessageContext);
  const protId = dashboard.selectedCard.prot_id;

  const pullVendorandLocation = () => {
    dispatch(getVendorsData());
    dispatch(getLocationByType(locType));
    dispatch(getServiceOwnersData());
  };

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: "Data Flow Settings",
      onClick: () => history.push("/dashboard/dataflow-management"),
    },
  ];

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

  // useEffect(() => {
  //   if (!dashboard?.selectedCard?.prot_id) {
  //     history.push("/dashboard");
  //   }
  // }, [dashboard?.selectedCard]);

  const AddDataflowData = () => {
    console.log("FormValues", FormValues);
    if (
      FormValues &&
      FormValues.vendor &&
      FormValues.locationName &&
      FormValues.firstFileDate &&
      FormValues.description !== "" &&
      protId !== ""
    ) {
      const payload = {
        id: uuidv4(),
        vendorID: FormValues.vendor[0],
        locationName: FormValues.locationName[0],
        dataStructure: FormValues.dataStructure,
        connectionType: FormValues.dataflowType,
        testFlag: FormValues.dataflowType === "test" ? 1 : 0,
        description: FormValues.description,
        firstFileDate: FormValues.firstFileDate,
        locationType: FormValues.locationType,
        // serviceOwnerValue: FormValues.serviceOwnerValue[0].label,
        protocolNumberStandard: protId,
        externalSystemName: "CDI",
        DataPackage: [],
      };
      console.log(payload);
      setForm(payload);
      setFormType("datapackage");
      setCurrentStep((step) => step + 1);
      // await dispatch(addDataFlow(payload));
      // history.push("/dashboard");
    } else {
      messageContext.showErrorMessage("Please fill all fields to proceed");
    }
  };

  const getDataSetValue = (val) => {
    console.log(val);
    // return val;
  };

  const AddDatapackage = () => {
    const newForm = { ...myform };
    const datapckageId = uuidv4();
    setselectedDatapackage(datapckageId);
    const obj = {
      id: datapckageId,
      compression,
      namingConvention,
      packagePassword,
      sftpPath,
      datasets: [],
    };
    newForm.DataPackage.push(obj);
    setForm(newForm);
    setFormType("dataset");
    setCurrentStep((step) => step + 1);
  };

  const AddDatasetData = (datasetObj) => {
    console.log("AddDatasetData", selectedDatapackage, datasetObj);
    // const newForm = { ...myform };
    // const datasetID = uuidv4();
    // const index = newForm.DataPackage.findIndex((r) => r.id === packageid);
    // const obj = {
    //   id: datasetID,
    //   compression,
    //   namingConvention,
    //   packagePassword,
    //   sftpPath,
    //   columnDefinition: [],
    // };
    // console.log("AddDatasetData", obj);
    // newForm.DataPackage[index].datasets.push(obj);
    // setForm(newForm);
  };
  useEffect(() => {
    if (messageContext?.dataflowObj?.dataset) {
      const datasetObj = messageContext?.dataflowObj?.dataset || {};
      AddDatasetData(datasetObj);
    }
  }, [messageContext?.dataflowObj?.dataset]);
  const backStep = () => {
    setCurrentStep((step) => step - 1);
  };
  const nextStep = async () => {
    console.log("datasetFormValues?", datasetFormValues);
    switch (currentStep) {
      case 1:
        AddDataflowData();
        break;
      case 2:
        AddDatapackage();
        break;
      case 3:
        messageContext?.setDataflow({ datasetSubmit: true });
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleOpen = () => {
    setIsPanelOpen(true);
  };

  const RenderForm = () => {
    let formEl = <></>;
    switch (currentStep) {
      case 1:
        formEl = (
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
        );
        break;
      case 2:
        formEl = (
          <DataPackages
            setCompression={setCompression}
            setNamingConvention={setNamingConvention}
            setPackagePassword={setPackagePassword}
            setSftpPath={setSftpPath}
            compression={compression}
            namingConvention={namingConvention}
            packagePassword={packagePassword}
            sftpPath={sftpPath}
          />
        );
        break;
      case 3:
        formEl = (
          <DataSet
            myform={myform}
            datapackageid={selectedDatapackage}
            getDataSetValue={getDataSetValue}
          />
        );
        break;
      default:
        formEl = (
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
        );
        break;
    }
    return formEl;
  };

  useEffect(() => {
    pullVendorandLocation();
    console.log(myform, "sdsasa", myform.DataPackage);
  }, []);
  useEffect(() => {
    console.log("myform:", myform);
  }, [myform]);
  useEffect(() => {
    if (modalLocType === locType) {
      dispatch(getLocationByType(locType));
    }
  }, [createTriggered]);
  return (
    <div className={classes.root}>
      {(loading || upsertLoading) && <Loader />}
      {error && (
        <Banner
          variant="error"
          open={true}
          onClose={() => dispatch(hideErrorMessage())}
          style={{ zIndex: 9999, top: "15%" }}
          message={error}
        />
      )}
      <Panel
        onClose={handleClose}
        onOpen={handleOpen}
        open={isPanelOpen}
        width={20}
      >
        {/* <LeftPanel
          protId={protId}
          packages={myform.DataPackage}
          setFormType={setFormType}
          myform={myform}
        /> */}
      </Panel>
      <Panel className={classes.rightPanelExtended} width="100%" hideButton>
        <main className={classes.content}>
          <div className="content">
            <div className={classes.contentHeader}>
              <Header
                close={closeForm}
                submit={nextStep}
                back={backStep}
                currentStep={currentStep}
                breadcrumbItems={breadcrumbItems}
                headerTitle="Virologicclinic-IIBR12-001-Other"
                icon={<DataPackageIcon className={classes.contentIcon} />}
                datasetsCount={6}
              />
            </div>
            <Divider />
            <div className={classes.formSection}>{RenderForm()}</div>
          </div>
        </main>
      </Panel>
    </div>
  );
};

// export default DataFlow;

export default connect((state) => ({
  FormValues: getFormValues("DataFlowForm")(state),
  datasetFormValues: getFormValues("DataSetsForm")(state),
  dashboard: state.dashboard,
}))(DataFlow);
