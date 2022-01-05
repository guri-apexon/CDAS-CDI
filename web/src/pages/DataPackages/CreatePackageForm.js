import compose from "@hypnosphi/recompose/compose";
import withStyles from "@material-ui/core/styles/withStyles";
import React from "react";
import { connect, Provider } from "react-redux";
import { combineReducers, createStore } from "redux";
import { reducer as formReducer, getFormValues, reduxForm } from "redux-form";
import MenuItem from "apollo-react/components/MenuItem";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import {
  ReduxFormPasswordInput,
  ReduxFormSelect,
  ReduxFormTextField,
} from "../../components/Common/ReduxFormComponents";
import validate from "./validation";

const initialValues = {};

const compressionTypes = [
  { text: "Not Comporessed", value: "not_compressed" },
  { text: "Zip", value: "zip" },
  { text: "7Z", value: "7z" },
  { text: "SAS XPT", value: "sas_xpt" },
  { text: "RAR", value: "rar" },
];

const CreatePackageFormBase = ({ handleSubmit, values }) => {
  const submitted = () => {
    console.log("Submitted");
    handleSubmit();
  };
  return (
    <form onSubmit={submitted}>
      <ReduxFormSelect
        name="compression_type"
        label="Package Compression Type"
        size="small"
      >
        {compressionTypes.map((type, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <MenuItem key={i} value={type.value}>
            {type.text}
          </MenuItem>
        ))}
      </ReduxFormSelect>
      <ReduxFormTextField
        className="mb-20"
        fullWidth
        name="package_name"
        label="Package Naming Convention"
        placeholder=""
        required
        size="small"
        helperText="File extension must match package compression type e.g. 7z, zip, rar, or sasxpt"
      />
      <ReduxFormPasswordInput
        name="package_password"
        label="Package Password"
        placeholder="Enter Password"
        className="mb-20"
        style={{ width: "70%" }}
        size="small"
        required
      />
      <div>
        {values?.viewFormState && <pre>{JSON.stringify(values, null, 2)}</pre>}
      </div>
    </form>
  );
};

const ReduxForm = compose(
  withStyles({}),
  reduxForm({
    form: "CreatePackageForm",
    validate,
    initialValues,
  })
)(CreatePackageFormBase);

const CreatepackageForm = connect((state) => ({
  initialValues: state.dataPackage,
  values: getFormValues("CreatePackageForm")(state),
}))(ReduxForm);

export default CreatepackageForm;
