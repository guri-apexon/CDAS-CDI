/* eslint-disable no-script-url */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { connect, useDispatch, useSelector } from "react-redux";

import Divider from "apollo-react/components/Divider";
import Typography from "apollo-react/components/Typography";
import Step from "apollo-react/components/Step";
import StepLabel from "apollo-react/components/StepLabel";
import Stepper from "apollo-react/components/Stepper";
import Panel from "apollo-react/components/Panel";
import Modal from "apollo-react/components/Modal";

import {
  updateSelectedStudy,
  SelectedDataflow,
} from "../../store/actions/DashboardAction";
import { getDataFlowDetails, dataflowSave } from "../../services/ApiServices";
import { MessageContext } from "../../components/Providers/MessageProvider";
import { getVendorsData } from "../../store/actions/DataFlowAction";
import {
  formComponentActive,
  hideAlert,
  showAppSwitcher,
  formComponentInActive,
  hideAppSwitcher,
} from "../../store/actions/AlertActions";
import AlertBox from "../AlertBox/AlertBox";

import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

const steps = [
  "Select a study to Clone from",
  "Select a source data flow",
  "Verify data flow to clone",
  "Provide required details",
];

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginLeft: "8px",
    marginTop: "4px",
  },
  bold: {
    fontWeight: "600",
  },
  ml8: {
    marginLeft: "8px",
  },
  mt0: {
    marginTop: "0px",
  },
  mt8: {
    marginTop: "8px",
  },
  mt12: {
    marginTop: "12px",
  },
  mt24: {
    marginTop: "24px",
  },
  mb24: {
    marginBottom: "24px",
  },

  // necessary for content to be below app bar
  content: {
    flexGrow: 1,
    backgroundColor: "#f6f7fb",
    paddingBottom: "1px",
  },
  contentHeader: {
    paddingTop: 11,
    padding: "16px 25px",
    backgroundColor: "#ffffff",
  },
  mainSection: {
    display: "block",
    margin: "24px 24px",
  },
  breadcrumbs: {
    marginTop: 0,
    marginBottom: 16,
    paddingLeft: 0,
  },
  contentIcon: {
    color: "#595959",
  },
  contentTitle: {
    color: "#000000",
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: 0,
    lineHeight: "24px",
    marginLeft: "8px",
    marginBottom: "8px",
  },
  contentSubTitle: {
    color: "#000000",
    fontSize: "14px",
    paddingLeft: 11,
    letterSpacing: 0,
    lineHeight: "24px",
  },
  subtitle: {
    marginTop: "8px",
    display: "block",
  },
  stepperContent: {
    padding: "20px 22px",
  },
  divider: {
    margin: "20px 0 40px",
  },
  stepLabel: {
    minHeight: "48px",
    cursor: "pointer",
    "& .MuiStepLabel-iconContainer": {
      paddingRight: "16px",
    },
  },
  step: {
    display: "none",
    "&.active": {
      display: "block",
    },
  },
  tableCursor: {
    "& table tr": {
      cursor: "pointer !important",
    },
  },
}));

const CloneDataFlow = () => {
  const [dataflowType, setDataflowType] = useState("");
  const [vendorDetails, setVendorDetails] = useState({
    vendor: null,
    description: "",
  });
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [dataFlowSource, setDataFlowSource] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [targetRoute, setTargetRoute] = useState("");
  const [isShowAlertBox, setShowAlertBox] = useState(false);

  const routerHandle = useRef();

  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const alertStore = useSelector((state) => state.alert);
  const dashboard = useSelector((state) => state.dashboard);
  const { protocolnumberstandard: protocolNumberStandard } =
    dashboard?.selectedCard;

  const unblockRouter = () => {
    dispatch(formComponentInActive());
    dispatch(hideAlert());
    dispatch(hideAppSwitcher());
    if (routerHandle) {
      routerHandle.current();
    }
  };

  const cancelButton = () => {
    unblockRouter();
    if (targetRoute === "") {
      unblockRouter(); // should be above history push
      history.push("/dashboard");
      // console.log("==================>", "dashboard");
    } else {
      history.push(targetRoute);
      // console.log("==================>", targetRoute);
    }
  };

  const leavePageBtn = () => {
    dispatch(hideAlert());
    dispatch(showAppSwitcher());
    setShowAlertBox(false);
  };
  const keepEditingBtn = () => {
    dispatch(hideAlert());
    setShowAlertBox(false);
  };

  useEffect(() => {
    if (alertStore?.showAlertBox) {
      setShowAlertBox(true);
    }
  }, [alertStore]);

  useEffect(() => {
    routerHandle.current = history.block((tr) => {
      setTargetRoute(tr?.pathname);
      setShowCancelPopup(true);
      return false;
    });

    return function () {
      /* eslint-disable */
      routerHandle.current();
    };
  });

  const goToDashboard = () => {
    history.push("/dashboard");
  };
  const handleCancel = () => {
    goToDashboard();
  };

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: goToDashboard },
    {
      href: "javascript:void(0)",
      title: "Select Study",
      onClick: () => {
        setActiveStep(0);
      },
    },
    {
      href: "javascript:void(0)",
      title: "Select Source Data Flow",
      onClick: () => {
        setActiveStep(1);
      },
    },
    {
      href: "javascript:void(0)",
      title: "Verify",
      onClick: () => {
        setActiveStep(2);
      },
    },
    {
      href: "javascript:void(0)",
      title: "Details",
    },
  ];

  useEffect(() => {
    dispatch(getVendorsData());
    dispatch(formComponentActive());
  }, []);

  // useEffect(() => {
  //   if (selectedStudy) {
  //     dispatch(updateSelectedStudy(selectedStudy));
  //   }
  // }, [selectedStudy]);

  const handleStudySelect = (studyData, step) => {
    setSelectedStudy(studyData);
    setActiveStep(step);
  };

  const goToPreviousStep = () => {
    if (activeStep) {
      setActiveStep(activeStep - 1);
    }
  };

  const goToNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const handleClone = async () => {
    // const payload = {
    //   vendorid: FormValues.vendor.vend_id,
    //   locationID: FormValues.locationName.src_loc_id,
    //   dataStructure: FormValues.dataStructure,
    //   testFlag: FormValues.dataflowType === "test" ? 1 : 0,
    //   description: FormValues.description,
    //   exptDtOfFirstProdFile: FormValues.firstFileDate,
    //   connectionType: FormValues.locationType,
    //   protocolNumberStandard: selectedCard.protocolnumberstandard,
    //   // protocolNumber: selectedCard.prot_id,
    //   serviceOwners: FormValues.serviceOwner?.map((x) => x.value) || [],
    //   externalSystemName: "CDI",
    //   dataPackage: [{ dataSet: [] }],
    //   active: true,
    //   vendorName: FormValues?.vendor?.vend_nm,
    // };

    try {
      setLoading(true);
      setShowAlertBox(false);
      const res = await getDataFlowDetails(selectedStudy?.dataflow?.dataflowid);
      if (!res) {
        messageContext.showErrorMessage(`Something went wrong`);
        return false;
      }
      const { vendor, description } = vendorDetails;
      const { vend_id: vendorid, vend_nm: vendorName } = vendor;
      const {
        src_loc_id: locationID,
        dataStructure,
        exptDtOfFirstProdFile,
        connectionType,
        serviceOwners,
        dataPackage,
      } = res;
      const payload = {
        vendorid,
        locationID,
        dataStructure,
        testFlag: dataflowType === "test" ? 1 : 0,
        description,
        exptDtOfFirstProdFile,
        connectionType,
        protocolNumberStandard,
        serviceOwners,
        externalSystemName: "CDI",
        dataPackage: dataPackage.map((d) => ({
          ...d,
          dataSet: d.dataSet.map((item) => ({
            ...item,
            dataKindID: item.dataKind,
            datasetName: item.mnemonic,
            incremental: item.incremental?.toLowerCase() === "y" ? true : false,
          })),
        })),
        active: false,
        vendorName,
      };
      const { dataflowDetails, success, data } = await dataflowSave(payload);
      setLoading(false);
      console.log("dataflowDetails", dataflowDetails, success, data);
      if (dataflowDetails) {
        dispatch(SelectedDataflow(dataflowDetails));
        messageContext.showSuccessMessage(
          `Selected dataflow has been cloned to this study.`
        );
        unblockRouter();
        history.push(
          `/dashboard/dataflow-management/${dataflowDetails?.dataFlowId}`
        );
        return true;
      } else if (!success) {
        messageContext.showErrorMessage(
          data.message || `Something wrong with clone`
        );
      } else {
        messageContext.showErrorMessage(`Something wrong with clone`);
      }
      return true;
    } catch (error) {
      console.log(error);
      setLoading(false);
      messageContext.showErrorMessage(`Something went wrong`);
      return false;
    }
  };

  const getBreadCrumbItems = (number) => {
    return [...breadcrumbItems].splice(0, number);
  };

  return (
    <div className={classes.root} style={{ height: `calc(100vh - 120px)` }} data-testid="clonedftestid">
      {/* {loading && <Loader />} */}
      {isShowAlertBox && (
        <AlertBox
          onClose={keepEditingBtn}
          submit={leavePageBtn}
          message="Are you sure you want to leave the page?"
          title="The data flow configuration will be lost."
        />
      )}
      <Modal
        open={showCancelPopup}
        variant="warning"
        onClose={() => setShowCancelPopup(false)}
        title="The data flow configuration will be lost."
        message="Are you sure you want to leave the page?"
        buttonProps={[
          { label: "Cancel", onClick: () => setShowCancelPopup(false) },
          {
            label: "Yes",
            onClick: cancelButton,
          },
        ]}
        id="warning"
      />
      <Panel width={305} hideButton>
        <div className={classes.stepperContent}>
          <Typography variant="title1">Clone Data Flow</Typography>
          <Divider className={classes.divider} />
          <Stepper box activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step
                key={label}
                onClick={() => {
                  if (activeStep > index) setActiveStep(index);
                }}
              >
                <StepLabel className={classes.stepLabel}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
      </Panel>
      <Panel className={`${classes.mb24} `} width="100%" hideButton>
        <main className={classes.content}>
          <div className="content">
            <div
              className={`${classes.step} ${activeStep === 0 ? "active" : ""}`}
            >
              <Step1
                setSelectedStudy={handleStudySelect}
                selectedStudy={selectedStudy}
                classes={classes}
                goToPreviousStep={goToPreviousStep}
                goToNextStep={goToNextStep}
                nextDisabled={!selectedStudy}
                handleCancel={handleCancel}
                goToDashboard={goToDashboard}
                breadcrumbItems={getBreadCrumbItems(2)}
              />
            </div>
            <div
              className={`${classes.step} ${activeStep === 1 ? "active" : ""}`}
            >
              <Step2
                selectedStudy={selectedStudy}
                setSelectedStudy={handleStudySelect}
                classes={classes}
                goToPreviousStep={goToPreviousStep}
                setDataFlowSource={setDataFlowSource}
                goToNextStep={goToNextStep}
                nextDisabled={!dataFlowSource?.length}
                handleCancel={handleCancel}
                goToDashboard={goToDashboard}
                breadcrumbItems={getBreadCrumbItems(3)}
              />
            </div>
            <div
              className={`${classes.step} ${activeStep === 2 ? "active" : ""}`}
            >
              <Step3
                classes={classes}
                dataFlowSource={dataFlowSource}
                goToPreviousStep={goToPreviousStep}
                goToNextStep={goToNextStep}
                nextDisabled={!dataFlowSource?.length}
                handleCancel={handleCancel}
                goToDashboard={goToDashboard}
                breadcrumbItems={getBreadCrumbItems(4)}
              />
            </div>
            <div
              className={`${classes.step} ${activeStep === 3 ? "active" : ""}`}
            >
              <Step4
                classes={classes}
                goToPreviousStep={goToPreviousStep}
                goToNextStep={goToNextStep}
                nextDisabled={!dataFlowSource?.length}
                handleCancel={handleCancel}
                handleClone={handleClone}
                vendorDetails={vendorDetails}
                setVendorDetails={setVendorDetails}
                dataflowType={dataflowType}
                setDataflowType={setDataflowType}
                goToDashboard={goToDashboard}
                breadcrumbItems={getBreadCrumbItems(5)}
                loading={loading}
              />
            </div>
          </div>
        </main>
      </Panel>
    </div>
  );
};

// export default DataFlow;

export default connect((state) => ({
  dashboard: state.dashboard,
}))(CloneDataFlow);
