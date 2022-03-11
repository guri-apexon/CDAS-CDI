/* eslint-disable consistent-return */
/* eslint-disable no-script-url */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
// import CssBaseline from "@material-ui/core/CssBaseline";
import Panel from "apollo-react/components/Panel";
import { useDispatch, useSelector, connect } from "react-redux";
import { submit, reset, getFormValues } from "redux-form";
import Loader from "apollo-react/components/Loader";
import Modal from "apollo-react/components/Modal";
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
  setDataflowLocal,
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
    overflow: "hidden",
  },
  rightPanelExtended: {
    maxWidth: "calc(100vw - 42px)",
    width: "calc(100vw - 40px)",
    overflow: "hidden",
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [compression, setCompression] = useState("not_compressed");
  const [namingConvention, setNamingConvention] = useState("");
  const [packagePassword, setPackagePassword] = useState("");
  const [FormType, setFormType] = useState("dataflow");
  const [sftpPath, setSftpPath] = useState("");
  const [currentStep, setCurrentStep] = useReducer((state, action) => {
    if (action?.step) return action.step;
    return action?.prev ? state - 1 : state + 1;
  }, 1);
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
      setForm(payload);
      setFormType("datapackage");
      setCurrentStep();
      // setDataflowLocal(payload);
    } else {
      messageContext.showErrorMessage("Please fill all fields to proceed");
    }
  };

  const getDataSetValue = (val) => {
    console.log(val);
    // return val;
  };

  const AddDatapackage = (payload) => {
    const newForm = { ...myform };
    const datapckageId = uuidv4();
    setselectedDatapackage(datapckageId);
    const obj = {
      id: datapckageId,
      datasets: [],
      ...payload,
    };
    newForm.DataPackage[0] = obj;
    setForm(newForm);
    setFormType("dataset");
    setCurrentStep();
  };

  const AddDatasetData = (datasetObj) => {
    if (namingConvention === "" || compression === "") {
      messageContext.showErrorMessage("Please fill required fields to proceed");
      return false;
    }
    console.log("AddDatasetData", selectedDatapackage, datasetObj);
    const newForm = { ...myform };
    const datasetID = uuidv4();
    const packageIndex = newForm.DataPackage.findIndex(
      (r) => r.id === selectedDatapackage
    );
    newForm.DataPackage[packageIndex].datasets.push({ datasetObj, datasetID });
    setForm(newForm);
    setCurrentStep();
  };
  const submitFinalForm = () => {
    setSaveSuccess(true);
  };
  const packagesRef = useRef();
  const nextStep = async () => {
    console.log("datasetFormValues?", datasetFormValues, currentStep);
    switch (currentStep) {
      case 1:
        AddDataflowData();
        break;
      case 2:
        packagesRef.current.submitForm();
        break;
      case 3:
        setCurrentStep();
        break;
      case 4:
        setCurrentStep();
        break;
      case 5:
        messageContext?.setDataflow({ datasetSubmit: true });
        submitFinalForm();
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    if (messageContext?.dataflowObj?.dataset) {
      const datasetObj = messageContext?.dataflowObj?.dataset || {};
      AddDatasetData(datasetObj);
    }
  }, [messageContext?.dataflowObj?.dataset]);

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleOpen = () => {
    setIsPanelOpen(true);
  };

  const RenderForm = () => {
    const formEl = (
      <>
        <div style={{ display: currentStep === 1 ? "block" : "none" }}>
          <DataFlowForm
            currentStep={currentStep}
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
        <div style={{ display: currentStep === 2 ? "block" : "none" }}>
          <DataPackages
            toast={messageContext}
            ref={packagesRef}
            payloadBack={AddDatapackage}
          />
        </div>
        <div
          style={{
            display: [3, 4, 5].includes(currentStep) ? "block" : "none",
          }}
        >
          <DataSet
            currentStep={currentStep}
            myform={myform}
            updateStep={(step) => setCurrentStep({ step })}
            datapackageid={selectedDatapackage}
            getDataSetValue={getDataSetValue}
          />
        </div>
      </>
    );
    // switch (currentStep) {
    //   case 1:
    //     formEl = (
    //       <DataFlowForm
    //         currentStep={currentStep}
    //         onSubmit={onSubmit}
    //         changeLocationData={changeLocationData}
    //         changeFormField={changeFormField}
    //         changeLocationType={changeLocationType}
    //         modalLocationType={modalLocationType}
    //         userName={selectedLocation?.usr_nm}
    //         password={selectedLocation?.pswd}
    //         connLink={selectedLocation?.cnn_url}
    //       />
    //     );
    //     break;
    //   case 2:
    //     formEl = (
    //       <DataPackages
    //         setCompression={setCompression}
    //         setNamingConvention={setNamingConvention}
    //         setPackagePassword={setPackagePassword}
    //         setSftpPath={setSftpPath}
    //         compression={compression}
    //         namingConvention={namingConvention}
    //         packagePassword={packagePassword}
    //         sftpPath={sftpPath}
    //       />
    //     );
    //     break;
    //   case 3:
    //   case 4:
    //   case 5:
    //     formEl = (
    //       <DataSet
    //         currentStep={currentStep}
    //         myform={myform}
    //         updateStep={(step) => setCurrentStep({ step })}
    //         datapackageid={selectedDatapackage}
    //         getDataSetValue={getDataSetValue}
    //       />
    //     );
    //     break;
    //   default:
    //     formEl = (
    //       <DataFlowForm
    //         onSubmit={onSubmit}
    //         changeLocationData={changeLocationData}
    //         changeFormField={changeFormField}
    //         changeLocationType={changeLocationType}
    //         modalLocationType={modalLocationType}
    //         userName={selectedLocation?.usr_nm}
    //         password={selectedLocation?.pswd}
    //         connLink={selectedLocation?.cnn_url}
    //       />
    //     );
    //     break;
    // }
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
                back={() => setCurrentStep({ prev: true })}
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
      <Modal
        open={saveSuccess}
        variant="success"
        onClose={() => setSaveSuccess(false)}
        title="Data Flow saved successfully"
        message="Data Flow saved successfully"
        buttonProps={[
          { label: "Continue editing data flow", variant: "primary" },
          { label: "Exit", onClick: () => closeForm() },
        ]}
        id="success"
      />
    </div>
  );
};

// export default DataFlow;

export default connect((state) => ({
  FormValues: getFormValues("DataFlowForm")(state),
  datasetFormValues: getFormValues("DataSetsForm")(state),
  dashboard: state.dashboard,
}))(DataFlow);
