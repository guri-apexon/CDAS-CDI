import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import Box from "apollo-react/components/Box";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import Checkbox from "apollo-react/components/Checkbox";
import TextField from "apollo-react/components/TextField";
import MenuItem from "apollo-react/components/MenuItem";
import Select from "apollo-react/components/Select";
import { ReactComponent as DataPackageIcon } from "../../../../components/Icons/datapackage.svg";
import "./DataPackages.scss";
// import LeftPanel from "../../components/Dataset/LeftPanel/LeftPanel";
import { getUserInfo, toast } from "../../../../utils";
// import {
//   addDataPackage,
//   getPackagesList,
// } from "../../store/actions/DataPackageAction";

const DataPackage = ({
  compression,
  setCompression,
  namingConvention,
  setNamingConvention,
  packagePassword,
  setPackagePassword,
  sftpPath,
  setSftpPath,
}) => {
  const [showForm, setShowForm] = useState(true);
  const [configShow, setConfigShow] = useState(false);
  //   const [compression, setCompression] = useState("not_compressed");
  //   const [namingConvention, setNamingConvention] = useState("");
  //   const [packagePassword, setPackagePassword] = useState("");
  //   const [sftpPath, setSftpPath] = useState("");
  const [notMatchedType, setNotMatchedType] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const userInfo = getUserInfo();

  const compressionTypes = [
    { text: "Not Compressed", value: "not_compressed" },
    { text: "Zip", value: "zip" },
    { text: "7Z", value: "7z" },
    { text: "SAS XPT", value: "xpt" },
    { text: "RAR", value: "rar" },
  ];

  const showConfig = (e, checked) => {
    setConfigShow(checked);
  };
  //   const resetForm = () => {
  //     setConfigShow(false);
  //     setShowForm(false);
  //   };
  const validateFields = () => {
    const nameArr = namingConvention.split(".");
    if (compression === nameArr[1]) {
      console.log("nameArr[1]", nameArr[1], compression);
      return true;
    }
    return false;
  };

  // eslint-disable-next-line consistent-return
  //   const submitPackage = () => {
  //     const validated = validateFields();
  //     setNotMatchedType(!validated);
  //     if (!validated) return false;
  //     if (
  //       namingConvention === "" ||
  //       compression === "" ||
  //       packagePassword === "" ||
  //       sftpPath === ""
  //     ) {
  //       toast("Please fill all fields to proceed", "error");
  //       return false;
  //     }
  //     const reqBody = {
  //       compression_type: compression,
  //       naming_convention: namingConvention,
  //       package_password: packagePassword,
  //       sftp_path: sftpPath,
  //       study_id: selectedCard.prot_id,
  //       dataflow_id: selectedDFId,
  //       user_id: userInfo.user_id,
  //     };
  //     dispatch(addDataPackage(reqBody));
  //   };

  //   const handleClose = () => {
  //     setIsPanelOpen(false);
  //   };

  //   const handleOpen = () => {
  //     setIsPanelOpen(true);
  //   };

  return (
    <div className="data-packages">
      <Paper className="add-package-box">
        {showForm ? (
          <>
            <div className="data-setting-header flex flex-center">
              <Typography className="b-font">Data Package Settings</Typography>
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
                    // eslint-disable-next-line react/no-array-index-key
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
                <TextField
                  type="password"
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
                Add Data Package
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </div>
  );
};

export default DataPackage;
