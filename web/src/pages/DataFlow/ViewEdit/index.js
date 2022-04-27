/* eslint-disable no-script-url */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Panel from "apollo-react/components/Panel";
import { useDispatch, useSelector, connect } from "react-redux";
import { submit, reset, getFormValues } from "redux-form";
import Loader from "apollo-react/components/Loader";
import { values } from "lodash";
import moment from "moment";
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
  getDataFlowDetail,
} from "../../../store/actions/DataFlowAction";

import { getLocationDetails } from "../../../store/actions/DataSetsAction";

import { ReactComponent as DataPackageIcon } from "../../../components/Icons/datapackage.svg";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import { getUserInfo } from "../../../utils";
import { updateDataflow } from "../../../services/ApiServices";

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
  const dashboardData = useSelector((state) => state.dashboard);
  const dataSetCount = dashboardData?.selectedDataFlow?.dataSets;
  const {
    selectedLocation,
    createTriggered,
    error,
    loading,
    dataFlowdetail,
    updated,
  } = dataFlowData;
  const [locType, setLocType] = useState("");
  const [modalLocType, setModalLocType] = useState("SFTP");
  const messageContext = useContext(MessageContext);
  const [dataflowSource, setDataFlowSource] = useState({});
  const [ffDate, setFfDate] = useState(null);
  const { dataflowId } = useParams();
  const userInfo = getUserInfo();

  const breadcrumbItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: "Data Flow Settings",
      onClick: () => history.push(`/dataflow-management/${dataflowId}`),
    },
  ];

  const changeLocationData = (value) => {
    if (selectedLocation && value === selectedLocation.value) return;
    const locationsRec = dataFlowData.locations?.records ?? [];
    const location = locationsRec?.find(
      // eslint-disable-next-line eqeqeq
      (loc) => value == loc.src_loc_id
    );
    dispatch(updateSelectedLocation(location));
  };

  const pullVendorandLocation = () => {
    dispatch(getVendorsData());
    dispatch(getServiceOwnersData());
  };

  useEffect(() => {
    dispatch(getDataFlowDetail(dataflowId));
  }, [dataflowId]);

  useEffect(() => {
    if (modalLocType === locType) {
      dispatch(getLocationByType(locType));
    }
  }, [createTriggered]);

  useEffect(() => {
    if (
      selectedLocation?.src_loc_id &&
      selectedLocation?.loc_typ !== ("SFTP" || "FTPS")
    ) {
      dispatch(getLocationDetails(selectedLocation?.src_loc_id));
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (locType) dispatch(getLocationByType(locType));
  }, [locType]);

  const changeFormField = (value, field) => {
    dispatch(changeFormFieldData(value, field));
  };
  const changeLocationType = (value) => {
    setLocType(value);
  };

  const modalLocationType = (value) => {
    setModalLocType(value);
  };

  const closeForm = async () => {
    await dispatch(reset("DataFlowForm"));
    history.push("/dashboard");
  };

  useEffect(() => {
    if (dataFlowdetail) {
      pullVendorandLocation();
      if (dataFlowdetail.loctyp && locType !== dataFlowdetail.loctyp) {
        changeLocationType(dataFlowdetail.loctyp);
      }
    }
  }, [dataFlowdetail]);

  // useEffect(() => {
  //   if (!dashboard?.selectedCard?.prot_id) {
  //     history.push("/dashboard");
  //   }
  // }, [dashboard?.selectedCard]);
  const changeFirstFlDt = (dt) => {
    console.log("dt", dt);
    setFfDate(dt);
  };
  const submitForm = async () => {
    const protId = dashboard.selectedCard.prot_id;
    // console.log("FormValues", FormValues);
    if (
      FormValues?.vendors &&
      selectedLocation &&
      FormValues?.description !== "" &&
      protId !== "" &&
      dataflowId
    ) {
      let firstFileDate = ffDate || FormValues.firstFileDate;
      firstFileDate = moment(firstFileDate).isValid()
        ? moment(firstFileDate).format("DD-MMM-yyyy")
        : null;
      const payload = {
        vendorID: FormValues.vendors[0],
        locationName: selectedLocation.value,
        dataStructure: FormValues.dataStructure,
        connectionType: FormValues.locationType,
        testFlag: FormValues.dataflowType === "test" ? "true" : "false",
        prodFlag: FormValues.dataflowType === "production" ? "true" : "false",
        description: FormValues.description,
        firstFileDate,
        serviceOwners: FormValues.serviceOwner?.length
          ? FormValues.serviceOwner
          : null,
        protocolNumberStandard: protId,
        externalSystemName: "CDI",
        dataflowId,
        userId: userInfo.userId,
      };
      const result = await updateDataflow(payload);
      if (result?.status === 1) {
        messageContext.showSuccessMessage(result.message);
      } else {
        messageContext.showErrorMessage(
          result?.message || "Something went wrong"
        );
      }
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
  useEffect(() => {
    if (!selectedLocation?.value && dataFlowData?.dataFlowdetail?.srclocid) {
      changeLocationData(dataFlowData?.dataFlowdetail?.srclocid);
    }
  }, [dataFlowData]);

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
                firstFileDate={ffDate}
                changeFirstFlDt={changeFirstFlDt}
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
