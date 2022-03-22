/* eslint-disable no-script-url */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
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
import Header from "../../../components/DataFlow/Header";
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
  getDataFlowDetail,
} from "../../../store/actions/DataFlowAction";

import { ReactComponent as DataPackageIcon } from "../../../components/Icons/datapackage.svg";
import { MessageContext } from "../../../components/Providers/MessageProvider";

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

const DataFlow = ({ FormValues, dashboard }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const dataFlowData = useSelector((state) => state.dataFlow);
  const dashboard = useSelector((state) => state.dashboard);
  const dataSetCount = dashboard?.selectedDataFlow?.dataSets;
  const { selectedLocation, createTriggered, error, loading, dataFlowdetail } =
    dataFlowData;
  const [locType, setLocType] = useState("SFTP");
  const [modalLocType, setModalLocType] = useState("SFTP");
  const messageContext = useContext(MessageContext);
  const [dataflowSource, setDataFlowSource] = useState({});
  const { dataflowId } = useParams();

  const pullVendorandLocation = () => {
    dispatch(getVendorsData());
    dispatch(getLocationByType(locType));
    dispatch(getServiceOwnersData());
  };

  const getDataFlowSource = async (dataflowid) => {
    dispatch(getDataFlowDetail(dataflowid));
  };

  useEffect(() => {
    getDataFlowSource(dataflowId);
    pullVendorandLocation();
  }, [dataflowId]);

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: "Data Flow Settings",
      onClick: () => history.push(`/dataflow-management/${dataflowId}`),
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

  // useEffect(() => {
  //   if (!dashboard?.selectedCard?.prot_id) {
  //     history.push("/dashboard");
  //   }
  // }, [dashboard?.selectedCard]);

  const submitForm = async () => {
    const protId = dashboard.selectedCard.prot_id;
    // console.log("FormValues?", FormValues);
    // console.log("protId", protId);
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
      <Panel
        onClose={handleClose}
        onOpen={handleOpen}
        open={isPanelOpen}
        width={446}
      >
        <LeftPanel
          dataflowId={dataflowId}
          dataflowSource={dataFlowdetail}
          headerTitle={dataFlowdetail.name}
        />
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
                submit={submitForm}
                breadcrumbItems={breadcrumbItems}
                headerTitle={dataFlowdetail.name}
                icon={<DataPackageIcon className={classes.contentIcon} />}
                datasetsCount={dataSetCount}
              />
            </div>
            <Divider />
            <div className={classes.formSection}>
              <DataFlowForm
                dataflowSource={dataFlowdetail}
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

// export default DataFlow;

export default connect((state) => ({
  FormValues: getFormValues("DataFlowForm")(state),
  dashboard: state.dashboard,
}))(DataFlow);
