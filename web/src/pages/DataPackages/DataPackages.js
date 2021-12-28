/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React, { useState } from "react";
import "./DataPackages.scss";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import Box from "apollo-react/components/Box";
import PlusIcon from "apollo-react-icons/Plus";
import Button from "apollo-react/components/Button";
import Card from "apollo-react-icons/Card";
import Checkbox from "apollo-react/components/Checkbox";
import TextField from "apollo-react/components/TextField";
import PasswordInput from "apollo-react/components/PasswordInput";
import MenuItem from "apollo-react/components/MenuItem";
import Select from "apollo-react/components/Select";
import Grid from "apollo-react/components/Grid";
import Search from "apollo-react/components/Search";
import { toast } from "../../utils";

const compressionTypes = [
  { text: "Not Comporessed", value: "not_compressed" },
  { text: "Zip", value: "zip" },
  { text: "7Z", value: "7z" },
  { text: "SAS XPT", value: "sas_xpt" },
  { text: "RAR", value: "rar" },
];
const DataPackages = () => {
  const [showForm, setShowForm] = useState(false);
  const [configShow, setConfigShow] = useState(false);
  const [compression, setCompression] = useState("not_compressed");
  const [namingConvention, setNamingConvention] = useState("");
  const [packagePassword, setPackagePassword] = useState("");
  const [sftpPath, setSftpPath] = useState("");
  const [notMatchedType, setNotMatchedType] = useState(false);

  const showConfig = (e, checked) => {
    setConfigShow(checked);
  };
  const validateFields = () => {
    setNotMatchedType(true);
  };
  // eslint-disable-next-line consistent-return
  const submitPackage = () => {
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
    };
    console.log("submitPackage", reqBody);
  };
  return (
    <div className="data-packages-wrapper">
      <Grid container spacing={2}>
        <Grid item xs={4} className="packages-list">
          <Paper>
            <Box padding={4}>
              <div className="flex flex-center justify-between">
                <Typography className="b-font">
                  Data Packages & Datasets
                </Typography>
                <Button
                  variant="secondary"
                  icon={<PlusIcon />}
                  size="small"
                  onClick={setShowForm}
                >
                  Add Data Package
                </Button>
              </div>
              <div>
                <Search placeholder="Search" size="small" fullWidth />
              </div>
              <div className="flex no-result">
                <Card className="head-icon" />
                <Typography>No Data Package or Datasets Added</Typography>
              </div>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Box padding={4}>
            <Button variant="primary" size="small" onClick={submitPackage}>
              Save
            </Button>
          </Box>
          <Box padding={4}>
            <Paper className="add-package-box">
              {showForm ? (
                <>
                  <div className="data-setting-header flex flex-center">
                    <Typography className="b-font">
                      Data Package Settings
                    </Typography>
                    <Checkbox
                      size="small"
                      label="Package Level Configuration"
                      checked={configShow}
                      onChange={showConfig}
                    />
                  </div>
                  {configShow && (
                    <div className="package-form">
                      <Select
                        required
                        error={notMatchedType}
                        label="Package Compression Type"
                        value={compression}
                        size="small"
                        placeholder="Select type..."
                        onChange={(e) => setCompression(e.target.value)}
                        className="mb-20"
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
                    <Card className="head-icon" />
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
        </Grid>
      </Grid>
    </div>
  );
};

export default DataPackages;
