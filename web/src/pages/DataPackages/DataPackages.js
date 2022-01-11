/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./DataPackages.scss";
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
import Grid from "apollo-react/components/Grid";
import CssBaseline from "@material-ui/core/CssBaseline";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import PageHeader from "../../components/DataFlow/PageHeader";
import Leftbar from "../../components/DataFlow/LeftBar";
import { getUserInfo, toast } from "../../utils";
import {
  addDataPackage,
  getPackagesList,
} from "../../store/actions/DataPackageAction";
// import CreatepackageForm from "./CreatePackageForm";

const compressionTypes = [
  { text: "Not Comporessed", value: "not_compressed" },
  { text: "Zip", value: "zip" },
  { text: "7Z", value: "7z" },
  { text: "SAS XPT", value: "xpt" },
  { text: "RAR", value: "rar" },
];
const breadcrumpItems = [
  { href: "/" },
  {
    title: "Data Flow Settings",
    href: "/dataflow-management",
  },
  {
    title: "Data Package Settings",
  },
];
const DataPackages = () => {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [configShow, setConfigShow] = useState(false);
  const [compression, setCompression] = useState("not_compressed");
  const [namingConvention, setNamingConvention] = useState("");
  const [packagePassword, setPackagePassword] = useState("");
  const [sftpPath, setSftpPath] = useState("");
  const [notMatchedType, setNotMatchedType] = useState(false);
  const packageData = useSelector((state) => state.dataPackage);
  const userInfo = getUserInfo();

  const showConfig = (e, checked) => {
    setConfigShow(checked);
  };
  const resetForm = () => {
    setConfigShow(false);
    setShowForm(false);
  };
  const validateFields = () => {
    const nameArr = namingConvention.split(".");
    if (compression === nameArr[1]) {
      console.log("nameArr[1]", nameArr[1], compression);
      return true;
    }
    return false;
  };
  const getPackages = (query = "") => {
    dispatch(getPackagesList(query));
  };

  useEffect(() => {
    if (packageData && packageData.refreshData) {
      getPackages();
      resetForm();
    }
  }, [packageData.refreshData]);
  useEffect(() => {
    getPackages();
  }, []);
  // eslint-disable-next-line consistent-return
  const submitPackage = () => {
    const validated = validateFields();
    setNotMatchedType(!validated);
    if (!validated) return false;
    if (
      namingConvention === "" ||
      compression === "" ||
      packagePassword === "" ||
      sftpPath === ""
    ) {
      toast("Please fill all fields to proceed", "error");
      return false;
    }
    const reqBody = {
      compression_type: compression,
      naming_convention: namingConvention,
      package_password: packagePassword,
      sftp_path: sftpPath,
      study_id: "a020E000005SwfCQAS",
      dataflow_id: "a0A0E00000322XRUAY",
      user_id: userInfo.user_id,
    };
    console.log("submitPackage", reqBody);
    dispatch(addDataPackage(reqBody));
  };
  return (
    <div className="data-packages-wrapper">
      <Grid container>
        <PageHeader />
        <CssBaseline />
        <Leftbar />
        <main className="right-content">
          <Paper className="no-shadow">
            <Box className="top-content">
              <BreadcrumbsUI className="breadcrump" items={breadcrumpItems} />
              {showForm && (
                <>
                  <div className="flex title">
                    <img src="assets/svg/datapackage.svg" alt="datapackage" />
                    <Typography className="b-font">
                      Creating New Package
                    </Typography>
                  </div>
                  {/* <Typography variant="body2" className="b-font dataset-count">
                6 datasets
              </Typography> */}
                  <ButtonGroup
                    alignItems="right"
                    buttonProps={[
                      {
                        label: "Cancel",
                        size: "small",
                        onClick: () => setShowForm(false),
                      },
                      {
                        label: "Save",
                        size: "small",
                        onClick: submitPackage,
                      },
                    ]}
                  />
                </>
              )}
            </Box>
          </Paper>
          <Box padding={4}>
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
                    />
                  </div>
                  {configShow && (
                    <div className="package-form">
                      {/* <CreatepackageForm onSubmit={onSubmit} /> */}
                      <Select
                        required
                        error={notMatchedType}
                        label="Package Compression Type"
                        value={compression}
                        size="small"
                        placeholder="Select type..."
                        onChange={(e) => setCompression(e.target.value)}
                        className="mb-20 package-type"
                      >
                        {compressionTypes.map((type, i) => (
                          <MenuItem key={i} value={type.value}>
                            {type.text}
                          </MenuItem>
                        ))}
                      </Select>
                      <TextField
                        error={notMatchedType}
                        required
                        className="mb-20"
                        label="Package Naming Convention"
                        placeholder=""
                        size="small"
                        fullWidth
                        helperText="File extension must match package compression type e.g. 7z, zip, rar, or sasxpt"
                        onChange={(e) => setNamingConvention(e.target.value)}
                      />
                      <PasswordInput
                        defaultValue=""
                        size="small"
                        label="Package Password"
                        className="mb-20"
                        style={{ width: "70%" }}
                        onChange={(e) => setPackagePassword(e.target.value)}
                      />
                      <TextField
                        className="mb-20"
                        label="sFTP Folder Path"
                        placeholder=""
                        size="small"
                        fullWidth
                        onChange={(e) => setSftpPath(e.target.value)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Box className="h-v-center flex-column add-btn-container">
                    <img
                      src="assets/svg/datapackage.svg"
                      className="head-icon"
                      alt="datapackage"
                    />
                    <Typography variant="title1">
                      No Data Package or Datasets Added
                    </Typography>
                    <Button
                      variant="secondary"
                      icon={<PlusIcon />}
                      size="small"
                      onClick={setShowForm}
                    >
                      Add Data Package
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </main>
      </Grid>
    </div>
  );
};

export default DataPackages;
