import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
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
import "./index.scss";
// import LeftPanel from "../../components/Dataset/LeftPanel/LeftPanel";
import { getUserInfo, isSftp, validateFields } from "../../../../utils";
// import {
//   addDataPackage,
//   getPackagesList,
// } from "../../store/actions/DataPackageAction";

const DataPackage = ({ payloadBack, toast, locType, configRequired }, ref) => {
  const [showForm, setShowForm] = useState(true);
  const [configShow, setConfigShow] = useState(false);
  const [compression, setCompression] = useState("not_compressed");
  const [namingConvention, setNamingConvention] = useState("");
  const [packagePassword, setPackagePassword] = useState("");
  const [sftpPath, setSftpPath] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [notMatchedType, setNotMatchedType] = useState(false);
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
  useImperativeHandle(ref, () => ({
    // eslint-disable-next-line consistent-return
    submitForm: () => {
      if (disabled) {
        payloadBack({
          type: "",
          name: "No package",
          password: "",
          path: "",
          noPackageConfig: 0,
        });
        return false;
      }
      if (namingConvention !== "") {
        const validated = validateFields(namingConvention, compression);
        setNotMatchedType(!validated);
        if (!validated) return false;
        if (namingConvention === "" || compression === "") {
          toast.showErrorMessage("Please fill all fields to proceed", "error");
          return false;
        }
      }
      const reqBody = {
        type: compression,
        name: namingConvention === "" ? "No package" : namingConvention,
        password: packagePassword,
        path: sftpPath,
        noPackageConfig: configShow ? 1 : 0,
      };
      payloadBack(reqBody);
    },
  }));

  useEffect(() => {
    setDisabled(locType && !isSftp(locType));
  }, [locType]);
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
                checked={!disabled && configShow}
                disabled={disabled}
                onChange={showConfig}
              />
            </div>
            {configShow && !disabled && (
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
                  label="Package Password (Optional)"
                  className="mb-20"
                  style={{ width: "70%" }}
                  onChange={(e) => setPackagePassword(e.target.value)}
                />
                <TextField
                  className="mb-20"
                  label="sFTP Folder Path (Optional)"
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

export default forwardRef(DataPackage);
