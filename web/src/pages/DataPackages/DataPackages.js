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
import Modal from "apollo-react/components/Modal/Modal";
// import CssBaseline from "@material-ui/core/CssBaseline";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import { ReactComponent as DataPackageIcon } from "../../components/Icons/datapackage.svg";
import "./DataPackages.scss";
import LeftPanel from "../../components/Dataset/LeftPanel/LeftPanel";
import { getUserInfo, toast, validateFields, isSftp } from "../../utils";
import { submitDataPackage } from "../../services/ApiServices";
import {
  addDataPackage,
  selectDataPackage,
  getPackagesList,
  addPackageBtnAction,
  updateStatus,
  getPackagePassword,
} from "../../store/actions/DataPackageAction";
import { MessageContext } from "../../components/Providers/MessageProvider";
import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../components/Common/usePermission";
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
  const [disablePackageLevel, setDisablePackageLevel] = useState(false);
  const packageData = useSelector((state) => state.dataPackage);
  const [addedPackage, setAddedPackage] = useState(false);

  const { dataFlowdetail, versionFreezed } = useSelector(
    (state) => state.dataFlow
  );
  const userInfo = getUserInfo();
  const { showSuccessMessage, showErrorMessage } = useContext(MessageContext);
  const {
    selectedCard,
    selectedDataFlow: { dataFlowId: dfId },
  } = useSelector((state) => state.dashboard);
  const { packageSODPassword } = packageData;
  const [passwordUpdate, setPasswordUpdate] = useState(false);
  const { prot_id: protId } = selectedCard;

  const { canUpdate: canUpdateDataFlow } = useStudyPermission(
    Categories.CONFIGURATION,
    Features.DATA_FLOW_CONFIGURATION,
    protId
  );

  const goToDataflow = () => {
    if (dfId) {
      history.push(`/dashboard/dataflow-management/${dfId}`);
    }
  };

  const breadcrumpItems = [
    { href: "javascript:void(0)", onClick: () => history.push("/dashboard") },
    {
      href: "javascript:void(0)",
      title: dataFlowdetail?.name || "Data Flow Settings",
      onClick: goToDataflow,
    },
    {
      href: "javascript:void(0)",
      title: packageData?.selectedPackage?.name || "Data Package Settings",
      onClick: () => history.push("/dashboard/data-packages"),
    },
  ];

  const resetForm = () => {
    setConfigShow(false);
    setNamingConvention("");
    setPackagePassword("");
    setSftpPath("");
    setCompression("");
    setNotMatchedType(false);
  };
  const showConfig = (e, checked) => {
    if (!checked) {
      // resetForm();
      // setShowForm(true);
      setConfigShow(checked);
    } else {
      setConfigShow(checked);
    }
  };
  // const getPackages = (query = "") => {
  //   dispatch(getPackagesList(query));
  // };

  useEffect(() => {
    if (packageData.openAddPackage) {
      // getPackages();
      resetForm();
      setShowForm(true);
    }
  }, [packageData.openAddPackage]);

  // const PackagePassswordData = async () => {
  //   await dispatch(
  //     getPackagePassword(
  //       packageData.packagesList[0]?.dataflowid,
  //       packageData.packagesList[0]?.datapackageid
  //     )
  //   );
  //   setPasswordUpdate(true);
  // };

  const PackagePassswordData = async () => {
    await dispatch(
      getPackagePassword(
        packageData.selectedPackage?.dataflowid,
        packageData.selectedPackage?.datapackageid
      )
    );
    setPasswordUpdate(true);
  };

  useEffect(() => {
    if (!packageData.openAddPackage && packageData.selectedPackage) {
      setShowForm(true);
      setConfigShow(true);
      setCompression(packageData.selectedPackage?.type);
      setNamingConvention(packageData.selectedPackage?.name);
      setSodValue(packageData.selectedPackage?.sod_view_type);
      setSftpPath(packageData.selectedPackage?.path);
      if (packageData.selectedPackage?.password === "Yes") {
        PackagePassswordData();
        if (packageSODPassword === "") {
          setConfigShow(false);
        } else if (packageSODPassword !== "" && !passwordUpdate) {
          setConfigShow(false);
        } else {
          setPackagePassword(packageSODPassword);
          setTimeout(() => {
            setConfigShow(true);
          }, 2000);
        }
      } else {
        setConfigShow(true);
        setPackagePassword("");
      }
    }
    // if (
    //   packageData.selectedPackage &&
    //   packageData.selectedPackage?.type === null
    // )
    //   setConfigShow(false);
  }, [
    packageData.openAddPackage,
    packageData.selectedPackage,
    packageData.packageSODPassword,
  ]);

  useEffect(() => {
    if (!isSftp(dataFlowdetail.loctyp)) {
      setConfigShow(false);
      setDisablePackageLevel(true);
    }
    return () => {
      console.log("unmounting");
      dispatch(selectDataPackage({}));
    };
  }, []);

  const handleAddedSuccess = (message) => {
    if (message) showSuccessMessage(message);
    dispatch(addDataPackage());
    resetForm();
    setAddedPackage(false);
    setShowForm(false);
    history.push(`/dashboard/dataflow-management/${dfId}`);
  };
  // eslint-disable-next-line consistent-return
  const submitPackage = async () => {
    const validated = validateFields(namingConvention, compression);
    setNotMatchedType(!validated);
    if (!validated) return false;
    if (namingConvention === "" && compression) {
      toast("Please fill all fields to proceed", "error");
      return false;
    }
    let reqBody = {
      compression_type: compression,
      naming_convention: namingConvention,
      package_password: packagePassword,
      sftp_path: sftpPath,
      study_id: selectedCard.prot_id,
      dataflow_id: dfId,
      user_id: userInfo.userId,
      versionFreezed,
    };
    const updatedReq = !!packageData.selectedPackage?.datapackageid;
    if (updatedReq) {
      reqBody = {
        ...reqBody,
        package_id: packageData.selectedPackage?.datapackageid,
        sod_view_type: sodValue,
      };
    }

    const result = await submitDataPackage(reqBody);
    if (result.status === 1) {
      if (updatedReq) {
        handleAddedSuccess(result.message);
      } else {
        setAddedPackage(true);
      }
    } else {
      showErrorMessage(result.message);
    }
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
        <LeftPanel dataflowSource={dataFlowdetail} />
      </Panel>
      <Panel
        className={
          isPanelOpen ? classes.rightPanel : classes.rightPanelExtended
        }
        width="100%"
        hideButton
      >
        <main className="right-content">
          <Modal
            open={addedPackage}
            // disableBackdropClick="true"
            onClose={() => handleAddedSuccess()}
            message="Data Package has been created as Inactive. Please add an active
        Data Set, then activate the data package."
            buttonProps={[
              {
                label: "OK",
                variant: "primary",
                onClick: () => handleAddedSuccess(),
              },
            ]}
          />
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
                  packageData.selectedPackage?.sod_view_type
                    ? "Save Data Flow"
                    : "Save"
                }
                saveDisabled={!canUpdateDataFlow}
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
                        packageData.selectedPackage?.sod_view_type ||
                        !canUpdateDataFlow ||
                        disablePackageLevel
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
                      {packageData.selectedPackage?.sod_view_type ? (
                        <TextField
                          error={notMatchedType}
                          label="Package Compression Type"
                          value={compression}
                          size="small"
                          placeholder="Select type..."
                          disabled={
                            packageData.selectedPackage?.sod_view_type ||
                            !canUpdateDataFlow
                          }
                          className="mb-20 package-type"
                        />
                      ) : (
                        <Select
                          error={notMatchedType}
                          label="Package Compression Type"
                          value={compression || ""}
                          size="small"
                          placeholder="Select type..."
                          onChange={(e) => {
                            setCompression(e.target.value);
                            if (e.target.value === "") {
                              setNotMatchedType(false);
                            }
                          }}
                          disabled={!canUpdateDataFlow}
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
                        disabled={!canUpdateDataFlow}
                      />
                      <PasswordInput
                        size="small"
                        icon={false}
                        value={packagePassword}
                        label="Package Password (Optional)"
                        className="mb-20"
                        style={{ width: "70%" }}
                        onChange={(e) => setPackagePassword(e.target.value)}
                        disabled={!canUpdateDataFlow}
                      />
                      <TextField
                        className="mb-20"
                        label="sFTP Folder Path (Optional)"
                        placeholder=""
                        defaultValue={sftpPath}
                        size="small"
                        fullWidth
                        onChange={(e) => setSftpPath(e.target.value)}
                        disabled={!canUpdateDataFlow}
                      />
                      {packageData.selectedPackage?.sod_view_type && (
                        <div>
                          <Select
                            label="SOD View Type to Process"
                            value={sodValue}
                            size="small"
                            onChange={(e) => {
                              setSodValue(
                                e.target.value || sodValue || "Regular"
                              );
                            }}
                            disabled={!canUpdateDataFlow}
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
                      disabled={!canUpdateDataFlow}
                      onClick={() => {
                        resetForm();
                        setShowForm(true);
                        dispatch(addPackageBtnAction());
                      }}
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
