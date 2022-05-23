/* eslint-disable no-nested-ternary */
/* eslint-disable no-script-url */
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submit, reset } from "redux-form";
import Panel from "apollo-react/components/Panel/Panel";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import "./Dataset.scss";
import { getDataKindData } from "../../../../store/actions/DataSetsAction";
import CreateDataSetsForm from "./DataSetsForm";
// import DataSetsFormSQL from "./DataSetsFormSQL";
import JDBCForm from "./JDBCForm";
import ColumnsTab from "./ColumnsTab/ColumnsTab";
import VLCTab from "./VLCTab";
import { isSftp } from "../../../../utils";

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
const Dataset = (props, ref) => {
  const { currentStep, updateStep, submitData, headerValue } = props;
  const [value, setValue] = useState(0);
  const [locationType, setLocationType] = useState("jdbc");
  const [columnsActive, setColumnsActive] = useState(false);
  const [customSql, setCustomSql] = useState("Yes");
  const dispatch = useDispatch();
  const [jdbcFormData, setJdbcFormData] = useState(null);
  const [sftpInitialValues, setSftpInitialValues] = useState({});
  const dataSets = useSelector((state) => state.dataSets);
  const dataFlow = useSelector((state) => state.dataFlow);
  const { loading, isDatasetCreated } = dataSets;
  const { dataFlowdetail } = dataFlow;
  const { datasetId } = useParams();

  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const columnFunc = React.useRef(null);

  const onChangeSql = (val) => {
    setColumnsActive(val === "No");
    setCustomSql(val);
  };

  useEffect(() => {
    dispatch(getDataKindData());
  }, []);

  useEffect(() => {
    dispatch(reset("CreateDataSetsForm"));
    dispatch(reset("DataSetsFormSQL"));
  }, []);

  useEffect(() => {
    if (isDatasetCreated) {
      setValue(1);
    }
  }, [isDatasetCreated]);

  useEffect(() => {
    if (dataFlowdetail?.locationType) {
      setLocationType(dataFlowdetail?.locationType);
      if (isSftp(dataFlowdetail?.locationType)) {
        setColumnsActive(true);
      }
    }
    console.log("dataFlowdetail?.locationType", dataFlowdetail?.locationType);
  }, [dataFlowdetail]);

  const jdbcRef = useRef();
  const handleSubmitTrigger = () => {
    if (isSftp(locationType)) {
      dispatch(submit("CreateDataSetsForm"));
    } else {
      // messageContext?.setDataflow({ datasetSubmit: true });
      jdbcRef?.current?.handleSubmit();
    }
  };

  useImperativeHandle(ref, () => ({
    submitForm() {
      handleSubmitTrigger();
    },
    checkvalidation() {
      if (isSftp(locationType)) {
        columnFunc.current();
      }
    },
  }));

  const handleChangeTab = (event, v) => {
    switch (v) {
      case 1:
        handleSubmitTrigger();
        // updateStep(4);
        break;
      case 2:
        // updateStep(5);
        break;
      default:
        setValue(v);
        updateStep(3);
        break;
    }
  };
  const onSubmit = (formValue) => {
    const data = {
      ...formValue,
      dfTestFlag: dataFlowdetail.testflag,
    };
    if (isSftp(locationType)) {
      setSftpInitialValues(formValue);
    } else {
      setJdbcFormData(data);
    }
    submitData(data);
  };

  useEffect(() => {
    if (currentStep === 5 || currentStep === 4) {
      if (
        isSftp(locationType) ||
        (!isSftp(locationType) && customSql !== "Yes")
      )
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
                  disabled={
                    !columnsActive && ["Dataset Columns", "VLC"].includes(tab)
                  }
                />
              ))}
            </Tabs>
          )}
        </div>

        <div style={{ padding: 20, marginTop: 20 }}>
          {value === 0 &&
            (isSftp(locationType) ? (
              <CreateDataSetsForm
                initialValues={sftpInitialValues}
                loading={loading}
                onSubmit={onSubmit}
              />
            ) : (
              <JDBCForm
                dataflowid="123abc"
                datasetId={datasetId}
                dfTestFlag={dataFlowdetail.testflag}
                onChangeSql={onChangeSql}
                onSubmit={onSubmit}
                ref={jdbcRef}
                initialValue={jdbcFormData}
                moveNext={() => setValue(1)}
              />
            ))}
          {value === 1 && (
            <ColumnsTab
              columnFunc={columnFunc}
              locationType={locationType}
              headerValue={headerValue}
              moveNext={() => updateStep(5)}
            />
          )}
          {value === 2 && <VLCTab />}
        </div>
      </main>
    </Panel>
  );
};

export default forwardRef(Dataset);
