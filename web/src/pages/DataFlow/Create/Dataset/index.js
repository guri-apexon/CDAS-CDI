/* eslint-disable no-nested-ternary */
/* eslint-disable no-script-url */
import React, {
  Fragment,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submit, reset } from "redux-form";
import Banner from "apollo-react/components/Banner";
import Panel from "apollo-react/components/Panel/Panel";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import Typography from "apollo-react/components/Typography";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import { ReactComponent as DatasetsIcon } from "../../../../components/Icons/dataset.svg";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import "./Dataset.scss";
import {
  hideErrorMessage,
  getDataKindData,
  saveDatasetData,
  updateDatasetData,
  getDataSetDetail,
  getDatasetColumns,
} from "../../../../store/actions/DataSetsAction";
import { getDataFlowDetail } from "../../../../store/actions/DataFlowAction";
import DataSetsForm from "./DataSetsForm";
// import DataSetsFormSQL from "./DataSetsFormSQL";
import JDBCForm from "./JDBCForm";
import ColumnsTab from "./ColumnsTab/ColumnsTab";
import VLCTab from "./VLCTab";

const dataSettabs = ["Settings", "Dataset Columns", "VLC"];

const styles = {
  rightPanel: {
    maxWidth: "calc(100vw - 466px)",
    width: "calc(100vw - 464px)",
  },
  rightPanelExtended: {
    maxWidth: "calc(100vw - 42px)",
    width: "calc(100vw - 40px)",
  },
  content: {
    flexGrow: 1,
    background: "#f6f7fb",
    minHeight: "calc(100vh - 125px)",
  },
  contentHeader: {
    paddingTop: 11,
    padding: "16px 25px 0px 25px",
    backgroundColor: "#ffffff",
  },
  contentTitle: {
    padding: "20px 0px",
    fontSize: 20,
    lineHeight: "22px",
    fontWeight: 500,
  },
  breadcrumbs: {
    marginBottom: 16,
    paddingLeft: 0,
  },
  contentSubTitle: {
    color: "#000000",
    fontSize: "14px",
    paddingLeft: 11,
    letterSpacing: 0,
    lineHeight: "24px",
  },
  cIcon: {
    color: "#595959",
  },
  cTitle: {
    color: "#000000",
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: 0,
    lineHeight: "24px",
    marginLeft: "8px",
    marginBottom: "8px",
  },
};
const Dataset = (props) => {
  const { datapackageid, currentStep, updateStep } = props;
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [value, setValue] = useState(0);
  const [locationType, setLocationType] = useState("jdbc");
  const [columnsActive, setColumnsActive] = useState(false);
  const [customSql, setCustomSql] = useState("no");
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const history = useHistory();
  const dataSets = useSelector((state) => state.dataSets);
  const dashboard = useSelector((state) => state.dashboard);
  const packageData = useSelector((state) => state.dataPackage);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { selectedDSDetails } = packageData;
  //   const { selectedDFId } = dashboard;
  const { dataflowName, datapackageName, datasetName } = selectedDSDetails;
  const { loading, error, sucessMsg, isDatasetCreated, selectedDataset } =
    dataSets;
  const { dataFlowdetail } = dataFlow;
  const { datasetId } = useParams();

  const useStyles = makeStyles(styles);
  const classes = useStyles();

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleOpen = () => {
    setIsPanelOpen(true);
  };

  const handleChangeTab = (event, v) => {
    setValue(v);
    switch (v) {
      case 1:
        updateStep(4);
        break;
      case 2:
        updateStep(5);
        break;
      default:
        updateStep(3);
        break;
    }
  };
  const getDataSetType = (type) => {
    if (type?.toLowerCase() === ("sftp" || "ftps")) {
      return "sftp";
    }
    return "jdbc";
  };

  const onChangeSql = (val) => {
    setColumnsActive(val === "No");
    setCustomSql(val);
  };

  useEffect(() => {
    // if (selectedDFId === "") {
    //   history.push("/dashboard");
    // }
    dispatch(getDataKindData());
  }, []);

  useEffect(() => {
    dispatch(reset("DataSetsForm"));
    dispatch(reset("DataSetsFormSQL"));
    // if (datasetId === "new") {
    //   dispatch(reset("DataSetsForm"));
    //   dispatch(reset("DataSetsFormSQL"));
    // } else {
    //   dispatch(getDataSetDetail(datasetId));
    //   dispatch(getDatasetColumns(datasetId));
    // }
    // console.log(datasetId);
  }, []);

  useEffect(() => {
    if (isDatasetCreated) {
      setValue(1);
    }
  }, [isDatasetCreated]);

  //   useEffect(() => {
  //     if (selectedDFId) {
  //       dispatch(getDataFlowDetail(selectedDFId));
  //     }
  //   }, [selectedDFId]);

  useEffect(() => {
    if (dataFlowdetail?.loctyp) {
      setLocationType(dataFlowdetail?.loctyp);
      if (getDataSetType(dataFlowdetail?.loctyp) === ("sftp" || "ftps")) {
        setColumnsActive(true);
      }
    }
  }, [dataFlowdetail]);

  const goToDataflow = () => {
    // if (selectedDFId) {
    //   history.push(`/dashboard/dataflow-management/${selectedDFId}`);
    // }
  };

  const gotoDataPackage = () => {
    if (datapackageid) {
      history.push("/dashboard/data-packages");
    }
  };

  const jdbcRef = useRef();

  const submitForm = () => {
    if (locationType?.toLowerCase() === ("sftp" || "ftps")) {
      dispatch(submit("DataSetsForm"));
    } else {
      jdbcRef.current.handleSubmit();
    }
  };

  const onSubmit = (formValue) => {
    console.log("AddDatasetData:onSubmit", formValue);
    setTimeout(() => {
      const data = {
        ...formValue,
        datapackageid,
        dfTestFlag: dataFlowdetail.testflag,
      };
      if (data.datasetid) {
        dispatch(updateDatasetData(data));
      } else {
        dispatch(saveDatasetData(data));
      }
    }, 400);
  };

  const closeForm = async () => {
    if (locationType?.toLowerCase() === ("sftp" || "ftps")) {
      await dispatch(reset("DataSetsForm"));
    } else {
      jdbcRef.current.handleCancel();
    }
    history.push("/dashboard");
  };
  useEffect(() => {
    console.log("currentStep", currentStep);
    if (currentStep === 5) {
      setValue(2);
    } else if (currentStep === 4) {
      setValue(1);
    } else if (currentStep === 3) {
      setValue(0);
    }
  }, [currentStep]);

  return (
    <Panel className={classes.rightPanelExtended} width="100%" hideButton>
      <main className={classes.content}>
        <div className={classes.contentHeader}>
          {dataSettabs && (
            <Tabs
              value={value}
              onChange={handleChangeTab}
              size="small"
              style={{ marginBottom: "-19px" }}
              truncate
            >
              {dataSettabs.map((tab) => (
                <Tab
                  label={tab}
                  disabled={!columnsActive && tab === "Dataset Columns"}
                />
              ))}
            </Tabs>
          )}
        </div>

        <div style={{ padding: 20, marginTop: 20 }}>
          {value === 0 &&
            (locationType?.toLowerCase() === "sftp" ||
              locationType?.toLowerCase() === "ftps") && (
              <DataSetsForm loading={loading} handleSubmit={onSubmit} />
            )}
          {value === 0 &&
            locationType?.toLowerCase() !== "sftp" &&
            locationType?.toLowerCase() !== "ftps" && (
              <JDBCForm
                datapackageid={datapackageid}
                dataflowid="123abc"
                datasetId={datasetId}
                dfTestFlag={dataFlowdetail.testflag}
                onChangeSql={onChangeSql}
                ref={jdbcRef}
              />
            )}
          {value === 1 && <ColumnsTab locationType={locationType} />}
          {value === 2 && <VLCTab />}
        </div>
      </main>
    </Panel>
  );
};

export default Dataset;
