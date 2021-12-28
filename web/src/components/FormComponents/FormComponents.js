import withStyles from "@material-ui/core/styles/withStyles";
import React from "react";
import { Field } from "redux-form";

import Autocomplete from "apollo-react/components/Autocomplete";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import Button from "apollo-react/components/Button";
import Checkbox from "apollo-react/components/Checkbox";
import DatePicker from "apollo-react/components/DatePicker";
import DatePickerV2 from "apollo-react/components/DatePickerV2";
import DateRangePicker from "apollo-react/components/DateRangePicker";
import FileInput from "apollo-react/components/FileInput";
import FormHelperText from "apollo-react/components/FormHelperText";
import PasswordComplexity from "apollo-react/components/PasswordComplexity";
import PasswordInput from "apollo-react/components/PasswordInput";
import PhoneNumberInput from "apollo-react/components/PhoneNumberInput";
import RadioGroup from "apollo-react/components/RadioGroup";
import Select from "apollo-react/components/Select";
import Slider from "apollo-react/components/Slider";
import Switch from "apollo-react/components/Switch";
import TextField from "apollo-react/components/TextField";
import Typography from "apollo-react/components/Typography";

export const styles = {
  topSpacer: {
    marginTop: 16,
  },
  phoneNumber: {
    margin: "16px 0",
  },
  passwordWrapper: {
    display: "flex",
    alignItems: "start",
  },
  passwordComplexity: {
    marginTop: 54,
  },
  thumb: {
    width: 200,
    height: 200,
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
  },
};

function reduxFormify(Component) {
  return function reduxFormifyComponent(props) {
    return <Field component={Component} {...props} />;
  };
}

const RenderAutocomplete = ({
  input,
  helperText,
  meta: { touched, error },
  ...rest
}) => (
  <Autocomplete
    helperText={(touched && error) || helperText}
    error={touched && !!error}
    {...input}
    value={input.value === "" ? [] : input.value}
    {...rest}
  />
);

export const ReduxFormAutocomplete = reduxFormify(RenderAutocomplete);

const RenderAutocompleteV2 = ({
  input: { onChange, value, ...input },
  helperText,
  meta: { touched, error },
  ...rest
}) => {
  console.log("input", input);
  return (
    <>
      <AutocompleteV2
        helperText={(touched && error) || helperText}
        error={touched && !!error}
        {...input}
        onChange={(event, v) => onChange(v)}
        {...rest}
      />
    </>
  );
};

export const ReduxFormAutocompleteV2 = reduxFormify(RenderAutocompleteV2);

export const RenderCheckbox = ({
  input,
  meta: { error, touched },
  ...rest
}) => {
  const isChecked = typeof input.value !== "boolean" ? false : input.value;
  return (
    <>
      <Checkbox checked={isChecked} {...input} {...rest} />
      {touched && error && <FormHelperText error>{error}</FormHelperText>}
    </>
  );
};

export const ReduxFormCheckbox = reduxFormify(RenderCheckbox);

const RenderDatePicker = ({
  input,
  helperText,
  meta: { touched, error },
  ...rest
}) => (
  <DatePicker
    helperText={(touched && error) || helperText}
    error={touched && !!error}
    {...input}
    {...rest}
  />
);

export const ReduxFormDatePicker = reduxFormify(RenderDatePicker);

const RenderDatePickerV2 = ({
  input: { onBlur, ...input },
  helperText,
  meta: { touched, error },
  ...rest
}) => (
  <DatePickerV2
    helperText={(touched && error) || helperText}
    error={touched && !!error}
    {...input}
    {...rest}
  />
);

export const ReduxFormDatePickerV2 = reduxFormify(RenderDatePickerV2);

const RenderDateRangePicker = ({
  input: { onChange, ...input },
  label,
  classes,
  fromDateProps = {},
  toDateProps = {},
  meta: { touched, error },
  ...rest
}) => (
  <div className={classes.topSpacer}>
    <Typography variant="body2">{label}</Typography>
    <DateRangePicker
      onChange={(event) => onChange(event.target.value)}
      fromDateProps={{
        ...fromDateProps,
        helperText: (touched && error) || fromDateProps.helperText,
        error: touched && error,
      }}
      toDateProps={{
        ...toDateProps,
        helperText: (touched && error) || toDateProps.helperText,
        error: touched && error,
      }}
      {...input}
      {...rest}
    />
  </div>
);

export const ReduxFormDateRangePickerBase = reduxFormify(RenderDateRangePicker);

export const ReduxFormDateRangePicker = withStyles(styles)(
  ReduxFormDateRangePickerBase
);

const RenderPasswordInput = ({
  showComplexity,
  fullWidth,
  classes,
  input,
  meta: { touched, error },
  ...rest
}) => (
  <div className={classes.passwordWrapper}>
    <PasswordInput
      helperText={touched && error}
      fullWidth={fullWidth}
      error={touched && !!error}
      {...input}
      {...rest}
    />
    {showComplexity && (
      <PasswordComplexity
        className={classes.passwordComplexity}
        fullWidth={fullWidth}
        value={input.value}
      />
    )}
  </div>
);

export const ReduxFormPasswordInput = withStyles(styles)(
  reduxFormify(RenderPasswordInput)
);

const RenderPhoneInput = ({
  input,
  helperText,
  classes,
  meta: { touched, error },
  ...rest
}) => (
  <PhoneNumberInput
    helperText={(touched && error) || helperText}
    defaultCountry="us"
    className={classes.phoneNumber}
    error={touched && !!error}
    {...input}
    {...rest}
  />
);

export const ReduxFormPhoneInput = withStyles(styles)(
  reduxFormify(RenderPhoneInput)
);

const RenderPictureInput = ({
  input,
  helperText,
  classes,
  meta: { touched, error },
  ...rest
}) => (
  <>
    <FileInput
      className={classes.input}
      {...input}
      value={input?.value?.target?.file?.name ?? ""}
      onChange={(file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          input.onChange({
            target: { file, thumb: reader.result },
          });
        };
        reader.readAsDataURL(file);
      }}
      helperText={(touched && error) || helperText}
      error={touched && !!error}
      {...rest}
    />
    {input.value && (
      <div className={classes.thumb}>
        <img alt="Uploaded" src={input?.value?.target?.thumb ?? ""} />
      </div>
    )}
  </>
);

export const ReduxFormPictureInput = withStyles(styles)(
  reduxFormify(RenderPictureInput)
);

const RenderRadioGroup = ({
  input,
  classes,
  helperText,
  meta: { touched, error },
  ...rest
}) => (
  <div className={classes.topSpacer}>
    <RadioGroup
      {...input}
      {...rest}
      error={touched && !!error}
      helperText={(touched && error) || helperText}
    />
  </div>
);

export const ReduxFormRadioGroup = withStyles(styles)(
  reduxFormify(RenderRadioGroup)
);

const RenderSelect = ({
  input,
  helperText,
  meta: { touched, error },
  ...rest
}) => (
  <Select
    helperText={(touched && error) || helperText}
    error={touched && !!error}
    {...input}
    {...rest}
  />
);

export const ReduxFormSelect = reduxFormify(RenderSelect);

const RenderSlider = ({
  label,
  classes,
  unit,
  input,
  meta: { touched, error },
  ...rest
}) => (
  <>
    <Typography variant="body2" className={classes.topSpacer}>
      {`${label} (${input.value}${unit})`}
    </Typography>
    <Slider
      {...input}
      value={+input.value}
      onChange={(event, value) => input.onChange(value)}
      {...rest}
    />
    {touched && error && <FormHelperText error>{error}</FormHelperText>}
  </>
);

export const ReduxFormSlider = withStyles(styles)(reduxFormify(RenderSlider));

const RenderSwitch = ({ input, name, ...rest }) => {
  const isChecked = typeof input.value !== "boolean" ? false : input.value;
  return <Switch checked={isChecked} {...input} value={name} {...rest} />;
};

export const ReduxFormSwitch = reduxFormify(RenderSwitch);

const RenderTextField = ({ input, meta: { touched, error }, ...rest }) => (
  <TextField
    error={touched && !!error}
    helperText={touched && error}
    {...input}
    {...rest}
  />
);

export const ReduxFormTextField = reduxFormify(RenderTextField);

const RenderButtonToggle = ({
  input: { onChange, value },
  trueLabel,
  falseLabel,
  ...rest
}) => (
  <Button onClick={() => onChange(!value)} {...rest}>
    {value ? falseLabel : trueLabel}
  </Button>
);

export const ReduxFormButtonToggle = reduxFormify(RenderButtonToggle);
