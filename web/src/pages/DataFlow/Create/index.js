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
import { getSQLColumns } from "../../../store/actions/DataSetsAction";
import DataPackages from "./Datapackage";
import { ReactComponent as DataPackageIcon } from "../../../components/Icons/datapackage.svg";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import DataSet from "./Dataset";
import { dataflowSave } from "../../../services/ApiServices";
import { SelectedDataflow } from "../../../store/actions/DashboardAction";
import { isSftp } from "../../../utils";

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

const DataFlow = ({
  FormValues,
  dashboard: { selectedCard },
  datasetFormValues,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const packagesRef = useRef();
  const datasetRef = useRef();
  const [myform, setForm] = useState({});
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [FormType, setFormType] = useState("dataflow");
  const [createdDataflow, setCreatedDataflow] = useState(null);
  const [headerValue, setHeaderValue] = useState(1);
  const [changeLocationRequire, setChangeLocationRequire] = useState(true);
  const [currentStep, setCurrentStep] = useReducer((state, action) => {
    if (action?.step) return action.step;
    return action?.prev ? state - 1 : state + 1;
  }, 1);
  const dataFlowData = useSelector((state) => state.dataFlow);
  const {
    datakind: { records: datakindArr },
  } = useSelector((state) => state.dataSets);
  const { selectedLocation, loading, error } = dataFlowData;
  const { createTriggered, upsertLoading } = useSelector(
    (state) => state.cdiadmin
  );
  const [locType, setLocType] = useState("SFTP");
  const [modalLocType, setModalLocType] = useState("SFTP");
  const messageContext = useContext(MessageContext);

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
    setChangeLocationRequire(false);
  };
  const changeFormField = (value, field, arr) => {
    if (field === "vendor" && value[0]) {
      setSelectedVendor(arr.find((x) => x.vend_id === value[0]));
    }
    dispatch(changeFormFieldData(value, field));
  };
  const changeLocationType = (value) => {
    dispatch(getLocationByType(value));
    setLocType(value);
    setChangeLocationRequire(true);
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
    console.log("FormValues", FormValues, selectedCard);
    if (
      FormValues &&
      FormValues?.vendor?.length > 0 &&
      FormValues?.locationName &&
      FormValues?.description !== "" &&
      selectedCard?.protocolnumberstandard !== ""
    ) {
      if (changeLocationRequire) {
        messageContext.showErrorMessage(
          "Please change location name as per location type"
        );
        return false;
      }
      const payload = {
        vend_id: FormValues.vendor[0],
        src_loc_id: FormValues.locationName[0],
        dataStructure: FormValues.dataStructure,
        testFlag: FormValues.dataflowType === "test" ? 1 : 0,
        description: FormValues.description,
        exptDtOfFirstProdFile: FormValues.firstFileDate,
        locationType: FormValues.locationType,
        // serviceOwnerValue: FormValues.serviceOwnerValue[0].label,
        protocolNumberStandard: selectedCard.protocolnumberstandard,
        // protocolNumber: selectedCard.prot_id,
        serviceOwners: FormValues.serviceOwnerValue?.map((x) => x.value) || [],
        externalSystemName: "CDI",
        dataPackage: [{ dataSet: [] }],
        active: true,
        vendorName: selectedVendor?.vend_nm,
      };
      setForm(payload);
      setFormType("datapackage");
      setCurrentStep();
      dispatch(setDataflowLocal(FormValues));
    } else {
      messageContext.showErrorMessage("Please fill all fields to proceed");
    }
  };

  const backStep = () => {
    setCurrentStep({ prev: true });
  };

  const getDataSetValue = (val) => {
    console.log(val);
    // return val;
  };

  const AddDatapackage = (payload) => {
    const newForm = { ...myform };
    if (payload) {
      const obj = {
        dataSet: [],
        ...payload,
      };
      newForm.dataPackage[0] = obj;
      setForm(newForm);
    }
    setFormType("dataset");
    setCurrentStep();
  };

  const AddDatasetData = (datasetObj) => {
    console.log("datasetObj", datasetObj);
    if (
      datasetObj.datasetName === "" ||
      datasetObj.clinicalDataType === null ||
      !datasetObj.clinicalDataType?.length
    ) {
      messageContext.showErrorMessage("Please fill required fields to proceed");
      return false;
    }
    const newForm = { ...myform };
    if (datasetObj.loadType) {
      datasetObj.incremental = datasetObj.loadType === "Incremental" ? 1 : 0;
    }
    if (datasetObj.clinicalDataType) {
      const datakindObj = datakindArr.find((x) => {
        return x.value === datasetObj.clinicalDataType[0];
      });
      delete datasetObj.clinicalDataType;
      datasetObj.dataKind = datakindObj?.name;
    }
    if (datasetObj.transferFrequency) {
      datasetObj.dataTransferFrequency = datasetObj.transferFrequency;
      delete datasetObj.transferFrequency;
    }
    if (datasetObj.overrideStaleAlert) {
      datasetObj.OverrideStaleAlert = datasetObj.overrideStaleAlert;
      delete datasetObj.overrideStaleAlert;
    }
    if (datasetObj.customQuery === "No" && datasetObj.tableName) {
      dispatch(getSQLColumns(datasetObj.tableName));
    }
    if (typeof datasetObj.headerRowNumber !== "undefined") {
      setHeaderValue(datasetObj.headerRowNumber);
    }

    newForm.dataPackage[0].dataSet[0] = datasetObj;
    setForm(newForm);
    if (datasetObj.customQuery === "Yes") {
      setCurrentStep({ step: 5 });
    } else {
      setCurrentStep();
    }
  };

  const AddColumnDefinitions = (rows) => {
    const newForm = { ...myform };
    if (newForm.dataPackage[0].dataSet[0]) {
      newForm.dataPackage[0].dataSet[0].columncount = rows.length;
      newForm.dataPackage[0].dataSet[0].columnDefinition = rows;
      setForm(newForm);
    }
  };
  const submitFinalForm = async () => {
    if (
      (isSftp(locType) && !myform.dataPackage[0]?.dataSet[0]?.columncount) ||
      (myform.dataPackage[0]?.dataSet[0]?.customQuery === "No" &&
        !myform.dataPackage[0]?.dataSet[0]?.columncount)
    ) {
      messageContext.showErrorMessage(
        "Please add atleast one column to proceed"
      );
      return false;
    }
    const reqBody = {
      ...myform,
    };

    setSubmitting(true);
    const result = await dataflowSave(reqBody);
    if (result?.dataflowDetails) setCreatedDataflow(result.dataflowDetails);
    if (result) {
      setSaveSuccess(true);
    }
    setSubmitting(false);
  };
  const redirectToDataflow = () => {
    dispatch(SelectedDataflow(createdDataflow));
    history.push(
      `/dashboard/dataflow-management/${createdDataflow?.dataFlowId}`
    );
  };
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
        datasetRef.current.submitForm();
        break;
      case 4:
        datasetRef.current.checkvalidation();
        break;
      case 5:
        submitFinalForm();
        // setCurrentStep({ step: 3 });
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

  useEffect(() => {
    const columnDefinition =
      messageContext?.dataflowObj?.columnDefinition || [];
    if (columnDefinition.length) {
      AddColumnDefinitions(columnDefinition);
    }
  }, [messageContext?.dataflowObj?.columnDefinition]);

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
            locType={locType}
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
            ref={datasetRef}
            currentStep={currentStep}
            myform={myform}
            messageContext={messageContext}
            submitData={AddDatasetData}
            updateStep={(step) => setCurrentStep({ step })}
            getDataSetValue={getDataSetValue}
            headerValue={headerValue}
          />
        </div>
      </>
    );
    return formEl;
  };

  useEffect(() => {
    pullVendorandLocation();
    return () => {
      console.log("MyForm", myform);
      messageContext?.resetDataflow();
    };
  }, []);
  useEffect(() => {
    console.log("myform:", modalLocType, myform);
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
                back={() => backStep()}
                currentStep={currentStep}
                breadcrumbItems={breadcrumbItems}
                icon={<DataPackageIcon className={classes.contentIcon} />}
                submitting={submitting}
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
        onClose={() => closeForm()}
        title="Data Flow saved successfully"
        message="Data Flow saved successfully"
        buttonProps={[
          {
            label: "Continue editing data flow",
            variant: "primary",
            onClick: () => redirectToDataflow(),
          },
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
