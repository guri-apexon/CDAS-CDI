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
import InfoIcon from "apollo-react-icons/Info";
import Tooltip from "apollo-react/components/Tooltip";
import { ReactComponent as DataPackageIcon } from "../../../../components/Icons/datapackage.svg";
import "./index.scss";
import { getUserInfo, isSftp, validateFields } from "../../../../utils";
import { packageComprTypes, packageTypes } from "../../../../utils/constants";

// import {
//   addDataPackage,
//   getPackagesList,
// } from "../../store/actions/DataPackageAction";

const DataPackage = (
  { payloadBack, toast, locType, tabularSod, payloadSodBack },
  ref
) => {
  const [showForm, setShowForm] = useState(true);
  const [configShow, setConfigShow] = useState(false);
  const [compression, setCompression] = useState("");
  const [sodValue, setSodValue] = useState("");
  const [namingConvention, setNamingConvention] = useState("");
  const [packagePassword, setPackagePassword] = useState("");
  const [sftpPath, setSftpPath] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [notMatchedType, setNotMatchedType] = useState(false);
  const [folderPathValidation, setFolderPathValidation] = useState(false);

  const userInfo = getUserInfo();

  const resetForm = () => {
    setNamingConvention("");
    setPackagePassword("");
    setSftpPath("");
    setCompression("");
    setConfigShow(false);
    setNotMatchedType(false);
    setFolderPathValidation(false);
  };
  const showConfig = (e, checked) => {
    setConfigShow(checked);
    if (!checked) {
      resetForm();
    }
  };
  useImperativeHandle(ref, () => ({
    // eslint-disable-next-line consistent-return
    submitForm: () => {
      if (disabled && !tabularSod) {
        payloadBack({
          type: "",
          name: "No package",
          password: "",
          path: "",
          noPackageConfig: 1,
          active: 1,
        });
        return false;
      }
      if (namingConvention !== "" || compression) {
        const validated = validateFields(namingConvention, compression);
        setNotMatchedType(!validated);
        // check folder path field
        if (!sftpPath?.trim()) {
          setFolderPathValidation(true);
        }
        if (!validated || !sftpPath?.trim()) return false;
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
        noPackageConfig: configShow ? 0 : 1,
        active: 1,
      };
      const reqBodySod = {
        type: compression,
        name: namingConvention === "" ? "No package" : namingConvention,
        password: packagePassword,
        path: sftpPath,
        noPackageConfig: configShow ? 0 : 1,
        active: 1,
        sod_view_type: sodValue,
      };
      if (tabularSod) {
        payloadSodBack(reqBodySod);
      } else {
        payloadBack(reqBody);
      }
    },
  }));

  useEffect(() => {
    if (tabularSod) {
      setConfigShow(true);
      setDisabled(true);
      setCompression("ZIP");
      setSodValue("Regular");
    } else {
      setConfigShow(false);
      setDisabled(false);
      setCompression("");
    }
    setDisabled(locType && !isSftp(locType));
  }, [locType, tabularSod]);
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
                disabled={disabled}
                onChange={showConfig}
              />
            </div>
            {configShow && (
              <div className="package-form">
                {tabularSod ? (
                  <TextField
                    className="mb-20 package-type"
                    label="Package Compression Type"
                    size="small"
                    fullWidth
                    value={compression}
                    disabled
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
                      // eslint-disable-next-line react/no-array-index-key
                      <MenuItem key={i} value={type.value}>
                        {type.text}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                <TextField
                  error={notMatchedType}
                  // required
                  className="mb-20"
                  label="Package Naming Convention"
                  placeholder=""
                  size="small"
                  fullWidth
                  helperText={
                    tabularSod
                      ? "File extension must match package compression type e.g. zip"
                      : "File extension must match package compression type e.g. 7z, zip, rar, or xpt"
                  }
                  onChange={(e) => {
                    setNotMatchedType(
                      !validateFields(e.target.value, compression)
                    );
                    setNamingConvention(e.target.value);
                  }}
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
                  label="sFTP Folder Path"
                  error={folderPathValidation}
                  helperText={
                    folderPathValidation
                      ? "Folder Path is required when Package Level Configuration is entered"
                      : ""
                  }
                  placeholder=""
                  size="small"
                  fullWidth
                  onChange={(e) => {
                    setSftpPath(e.target.value);
                    setFolderPathValidation(false);
                  }}
                />
                {tabularSod && (
                  <div>
                    <Select
                      label="SOD View Type to Process"
                      value={sodValue}
                      size="small"
                      onChange={(e) => {
                        setSodValue(e.target.value || sodValue || "Regular");
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
                      <InfoIcon style={{ height: "2em", marginLeft: 10 }} />
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
    </div>
  );
};

export default forwardRef(DataPackage);
