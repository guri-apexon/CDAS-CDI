/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import moment from "moment";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import Box from "apollo-react/components/Box";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import Checkbox from "apollo-react/components/Checkbox";
import TextField from "apollo-react/components/TextField";
import PasswordInput from "apollo-react/components/PasswordInput";
import MenuItem from "apollo-react/components/MenuItem";
import Select from "apollo-react/components/Select";
import Panel from "apollo-react/components/Panel";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from "apollo-react-icons/Info";
import Tooltip from "apollo-react/components/Tooltip";
// import CssBaseline from "@material-ui/core/CssBaseline";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import { ReactComponent as DataPackageIcon } from "../../components/Icons/datapackage.svg";
import "./DataPackages.scss";
import LeftPanel from "../../components/Dataset/LeftPanel/LeftPanel";
import { getUserInfo, toast, validateFields } from "../../utils";
import { submitDataPackage } from "../../services/ApiServices";
import {
  addDataPackage,
  getPackagesList,
} from "../../store/actions/DataPackageAction";
import { MessageContext } from "../../components/Providers/MessageProvider";
import { packageComprTypes, packageTypes } from "../../utils/constants";
import Header from "../../components/DataFlow/Header";

const useStyles = makeStyles(() => ({
  rightPanel: {
    maxWidth: "calc(100vw - 466px)",
    width: "calc(100vw - 464px)",
  },
  rightPanelExtended: {
    maxWidth: "calc(100vw - 42px)",
    width: "calc(100vw - 40px)",
  },
}));

const DataPackages = React.memo(() => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const [showForm, setShowForm] = useState(false);
  const [configShow, setConfigShow] = useState(false);
  const [sodValue, setSodValue] = useState("");
  const [compression, setCompression] = useState("");
  const [namingConvention, setNamingConvention] = useState("");
  const [packagePassword, setPackagePassword] = useState("");
  const [sftpPath, setSftpPath] = useState("");
  const [notMatchedType, setNotMatchedType] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const packageData = useSelector((state) => state.dataPackage);
  const dashboard = useSelector((state) => state.dashboard);
  const dataFlow = useSelector((state) => state.dataFlow);
  const userInfo = getUserInfo();
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);

  const {
    selectedCard,
    selectedDataFlow: { dataFlowId: dfId },
  } = dashboard;
  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: "Data Flow Settings",
      onClick: () => history.push("/dashboard/dataflow-management"),
    },
    {
      href: "javascript:void(0)",
      title: "Data Package Settings",
      onClick: () => history.push("/dashboard/data-packages"),
    },
  ];

  const resetForm = () => {
    setConfigShow(false);
    setShowForm(false);
    setNamingConvention("");
    setPackagePassword("");
    setSftpPath("");
    setCompression("");
    setNotMatchedType(false);
  };
  const showConfig = (e, checked) => {
    if (!checked) {
      resetForm();
    } else {
      setConfigShow(checked);
    }
  };
  // const getPackages = (query = "") => {
  //   dispatch(getPackagesList(query));
  // };

  useEffect(() => {
    if (packageData && packageData.refreshData) {
      // getPackages();
      resetForm();
    }
  }, [packageData.refreshData]);
  useEffect(() => {
    if (packageData.openAddPackage || packageData.selectedPackage)
      setShowForm(true);
    if (packageData.selectedPackage) {
      setConfigShow(true);
      setCompression(packageData.selectedPackage?.type);
      setNamingConvention(packageData.selectedPackage?.name);
      setSodValue(packageData.selectedPackage?.sod_view_type);
      setPackagePassword(packageData.selectedPackage?.password);
      setSftpPath(packageData.selectedPackage?.path);
    }
    if (packageData.selectedPackage?.type === null) setConfigShow(false);
  }, [packageData.openAddPackage, packageData.selectedPackage]);

  // eslint-disable-next-line consistent-return
  const submitPackage = async () => {
    const validated = validateFields(namingConvention, compression);
    setNotMatchedType(!validated);
    if (!validated) return false;
    if (namingConvention === "" && compression) {
      toast("Please fill all fields to proceed", "error");
      return false;
    }
    const reqBody = {
      compression_type: compression,
      naming_convention: namingConvention,
      package_password: packagePassword,
      sftp_path: sftpPath,
      study_id: selectedCard.prot_id,
      dataflow_id: dfId,
      user_id: userInfo.userId,
    };
    const sodReqBody = {
      package_id: packageData.selectedPackage.datapackageid,
      compression_type: compression,
      naming_convention: namingConvention,
      package_password: packagePassword,
      sftp_path: sftpPath,
      study_id: selectedCard.prot_id,
      dataflow_id: dfId,
      user_id: userInfo.userId,
      sod_view_type: sodValue,
    };
    if (packageData.selectedPackage) {
      const result = await submitDataPackage(reqBody);
      if (result.status === 1) {
        showSuccessMessage(result.message);
        dispatch(addDataPackage());
      } else {
        showErrorMessage(result.message);
      }
    } else {
      const sodResult = await submitDataPackage(sodReqBody);
      if (sodResult.status === 1) {
        showSuccessMessage(sodResult.message);
        history.push("/dashboard/dataflow-management");
      } else {
        showErrorMessage(sodResult.message);
      }
    }

    resetForm();
  };

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  const handleOpen = () => {
    setIsPanelOpen(true);
  };

  useEffect(() => {
    console.log("packageRender");
  }, []);
  const lastModifieddate =
    packageData.selectedPackage?.updt_tm &&
    moment(packageData.selectedPackage?.updt_tm).format("DD-MMM-YYYY hh:mm A");
  return (
    <div className="data-packages-wrapper">
      <Panel
        onClose={handleClose}
        onOpen={handleOpen}
        open={isPanelOpen}
        width={446}
      >
        <LeftPanel dataflowSource={dataFlow?.dataFlowdetail} />
      </Panel>
      <Panel
        className={
          isPanelOpen ? classes.rightPanel : classes.rightPanelExtended
        }
        width="100%"
        hideButton
      >
        <main className="right-content">
          <Paper className="no-shadow">
            <Box className="top-content">
              <Header
                close={() => history.push("/dashboard")}
                submit={submitPackage}
                breadcrumbItems={breadcrumpItems}
                headerTitle={
                  packageData.selectedPackage?.name || "Creating New Package"
                }
                icon={<DataPackageIcon className={classes.contentIcon} />}
                saveBtnLabel={
                  packageData.selectedPackage?.sod_view_type !== null
                    ? "Save Data Flow"
                    : "Save"
                }
              />
            </Box>
          </Paper>

          <Box style={{ padding: 24, backgroundColor: "#f6f7fb" }}>
            <Paper className="add-package-box">
              {showForm ? (
                <>
                  <div className="data-setting-header flex flex-center">
                    <Typography className="b-font">
                      Data Package Settings
                    </Typography>
                    <Checkbox
                      className="config-checkbox"
                      size="small"
                      label="Package Level Configuration"
                      checked={configShow}
                      onChange={showConfig}
                      disabled={
                        packageData.selectedPackage?.sod_view_type !== null
                      }
                    />
                  </div>
                  {packageData.selectedPackage?.updt_tm && (
                    <span>
                      Last modified &nbsp;&nbsp;
                      {lastModifieddate}
                    </span>
                  )}
                  {configShow && (
                    <div className="package-form">
                      {packageData.selectedPackage?.sod_view_type !== null ? (
                        <TextField
                          error={notMatchedType}
                          label="Package Compression Type"
                          value={compression}
                          size="small"
                          placeholder="Select type..."
                          disabled={
                            packageData.selectedPackage?.sod_view_type !== null
                          }
                          className="mb-20 package-type"
                        />
                      ) : (
                        <Select
                          error={notMatchedType}
                          label="Package Compression Type"
                          value={compression}
                          size="small"
                          placeholder="Select type..."
                          onChange={(e) => {
                            setCompression(e.target.value);
                            if (e.target.value === "") {
                              setNotMatchedType(false);
                            }
                          }}
                          className="mb-20 package-type"
                        >
                          {packageComprTypes.map((type, i) => (
                            <MenuItem key={i} value={type.value}>
                              {type.text}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                      <TextField
                        error={notMatchedType}
                        className="mb-20"
                        label="Package Naming Convention"
                        placeholder=""
                        size="small"
                        fullWidth
                        value={namingConvention}
                        helperText={
                          packageData.selectedPackage?.sod_view_type === null
                            ? "File extension must match package compression type e.g. 7z, zip, rar, or sasxpt"
                            : "File extension must match package compression type e.g.zip"
                        }
                        onChange={(e) => {
                          setNotMatchedType(
                            !validateFields(e.target.value, compression)
                          );
                          setNamingConvention(e.target.value);
                        }}
                      />
                      <PasswordInput
                        size="small"
                        icon={false}
                        defaultValue={packagePassword}
                        label="Package Password (Optional)"
                        className="mb-20"
                        style={{ width: "70%" }}
                        onChange={(e) => setPackagePassword(e.target.value)}
                      />
                      <TextField
                        className="mb-20"
                        label="sFTP Folder Path (Optional)"
                        placeholder=""
                        defaultValue={sftpPath}
                        size="small"
                        fullWidth
                        onChange={(e) => setSftpPath(e.target.value)}
                      />
                      {packageData.selectedPackage?.sod_view_type && (
                        <div>
                          <Select
                            label="SOD View Type to Process"
                            value={sodValue}
                            size="small"
                            onChange={(e) => {
                              setSodValue(e.target.value);
                            }}
                            className="mb-20 package-type"
                          >
                            {packageTypes.map((type, i) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <MenuItem key={i} value={type.value}>
                                {type.text}
                              </MenuItem>
                            ))}
                          </Select>
                          <Tooltip
                            title="SOD View Type to Process"
                            subtitle="Files in the SOD package which match your selection will be processed. Please make sure that your selection and the generated SOD view type are in sync."
                            placement="left"
                            style={{ marginRight: 48 }}
                          >
                            <InfoIcon
                              style={{ height: "2em", marginLeft: 10 }}
                            />
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Box className="h-v-center flex-column add-btn-container">
                    <DataPackageIcon className="head-icon" />
                    <Typography variant="title1">
                      No Data Package or Datasets Added
                    </Typography>
                    <Button
                      variant="secondary"
                      icon={<PlusIcon />}
                      size="small"
                      onClick={setShowForm}
                    >
                      Add data package
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </main>
      </Panel>
      {/* </Grid> */}
    </div>
  );
});

export default DataPackages;
