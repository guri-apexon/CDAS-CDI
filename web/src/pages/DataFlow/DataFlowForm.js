/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import compose from "@hypnosphi/recompose/compose";
import { connect } from "react-redux";
import { reduxForm, getFormValues } from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography";
import Radio from "apollo-react/components/Radio";
import Divider from "apollo-react/components/Divider";
import MenuItem from "apollo-react/components/MenuItem";
import Grid from "apollo-react/components/Grid";
import Link from "apollo-react/components/Link";
import PlusIcon from "apollo-react-icons/Plus";
import {
  ReduxFormAutocomplete,
  ReduxFormDatePickerV2,
  ReduxFormRadioGroup,
  ReduxFormSelect,
  ReduxFormAutocompleteV2,
  ReduxFormTextField,
} from "../../components/FormComponents/FormComponents";
import validate from "../../components/FormComponents/validation";
import LocationModal from "../../components/Common/LocationModal";

import { locationTypes, dataStruct } from "../../utils";

const styles = {
  paper: {
    padding: "25px 16px",
  },
  submit: {
    margin: "16px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section: {
    marginBottom: 32,
  },
  subsection: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 24,
  },
  locationBox: {
    boxSizing: "border-box",
    border: "1px solid #E9E9E9",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    padding: "10px 15px",
  },
  formLabel: {
    color: "#444444",
    fontSize: 14,
    marginTop: "15px",
    letterSpacing: 0,
    lineHeight: "24px",
  },
  formText: {
    color: "#000000",
    fontSize: 14,
    marginTop: 8,
    marginLeft: 5,
    letterSpacing: 0,
    lineHeight: "24px",
  },
  formPass: {
    color: "#000000",
    fontSize: 30,
    marginTop: 8,
    marginLeft: 5,
    textSecurity: "disc",
    "-webkit-text-security": "disc",
    "-moz-text-security": "disc",
    letterSpacing: 5,
    lineHeight: "24px",
  },
};

const DataFlowFormBase = (props) => {
  const [locationOpen, setLocationOpen] = useState(false);
  const {
    handleSubmit,
    classes,
    change,
    locations,
    vendors,
    userName,
    password,
    serviceOwners,
    changeLocationData,
    changeFormField,
    changeLocationType,
    connLink,
    testLock,
    prodLock,
    testProdLock,
  } = props;
  const onChangeServiceOwner = (values) => {
    change("serviceOwnerValue", values);
  };
  const openLocationModal = () => {
    setLocationOpen(true);
  };
  return (
    <form onSubmit={handleSubmit}>
      <Paper className={classes.paper}>
        <div className={classes.section}>
          <Typography variant="title1">Flow Details</Typography>
          <div style={{ width: "50%" }}>
            <ReduxFormAutocomplete
              name="vendor"
              label="Vendor"
              source={vendors}
              id="vendor"
              className="autocomplete_field"
              onChange={(v) => changeFormField(v, "vendor")}
              singleSelect
              variant="search"
              fullWidth
            />
            <ReduxFormTextField
              fullWidth
              maxLength="30"
              name="description"
              input={{
                value: "NewValue",
              }}
              inputProps={{ maxLength: 30 }}
              onChange={(v) => changeFormField(v, "description")}
              label="Description"
              disabled={testLock || prodLock}
            />
            <ReduxFormDatePickerV2
              name="firstFileDate"
              dateFormat="DD MMM YYYY"
              placeholder="DD MMM YYYY"
              label="Expected First File Date"
            />
            <ReduxFormRadioGroup
              name="dataflowType"
              onChange={(v) => changeFormField(v, "dataflowType")}
              label="Data Flow Type"
              disabled={testLock || prodLock}
            >
              <Radio value="test" label="Test" />
              <Radio value="production" label="Production" />
            </ReduxFormRadioGroup>
          </div>
        </div>
        <Divider className={classes.divider} />
        <div className={classes.section}>
          <Typography variant="title1" id="locationDetailTitile">
            Location Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item md={5}>
              <ReduxFormSelect
                name="dataStructure"
                id="dataStructure"
                label="Data Structure"
                fullWidth
                disabled={testLock || prodLock}
              >
                {dataStruct?.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </ReduxFormSelect>
              <ReduxFormSelect
                name="locationType"
                label="Location Type"
                onChange={(e) => changeLocationType(e.target.value)}
                fullWidth
                disabled={testLock || prodLock}
              >
                {locationTypes?.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </ReduxFormSelect>
              <ReduxFormAutocomplete
                name="locationName"
                label="Location Name"
                source={locations}
                className="autocomplete_field"
                variant="search"
                onChange={changeLocationData}
                singleSelect
                fullWidth
              />
              <Link
                onClick={() => openLocationModal()}
                style={{ fontWeight: 600 }}
              >
                <PlusIcon style={{ width: 12, height: 12, marginRight: 8 }} />
                New Location
              </Link>
              <LocationModal
                locationModalOpen={locationOpen}
                modalLocationType={props.modalLocationType}
                handleModalClose={() => setLocationOpen(false)}
              />
            </Grid>
            <Grid item md={7}>
              <Paper className={classes.locationBox}>
                <Typography>Location</Typography>
                <Typography className={classes.formLabel}>Username</Typography>
                <Typography className={classes.formText}>{userName}</Typography>
                <Typography className={classes.formLabel}>Password</Typography>
                <Typography className={classes.formPass}>{password}</Typography>
                <Typography className={classes.formLabel}>
                  Connection URL/IP Server/Database
                </Typography>
                <Typography className={classes.formText}>{connLink}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>
        <Divider className={classes.divider} />
        <div className={classes.section}>
          <Typography variant="title1">Others</Typography>
          <div style={{ width: "50%" }}>
            <ReduxFormAutocompleteV2
              name="serviceOwner"
              label="Service Owners (Optional)"
              source={serviceOwners ?? []}
              onChange={onChangeServiceOwner}
              forcePopupIcon={true}
              fullWidth
              noOptionsText="No Service Owner"
              variant="search"
              chipColor="white"
              multiple
            />
          </div>
        </div>
      </Paper>
    </form>
  );
};

const ReduxForm = compose(
  withStyles(styles),
  reduxForm({
    form: "DataFlowForm",
    validate,
  })
)(DataFlowFormBase);

const DataFlowForm = connect((state) => ({
  initialValues: state.dataFlow.formData, // pull initial values from account reducer
  values: getFormValues("DataFlowForm")(state),
  locations: state.dataFlow.locations?.records,
  vendors: state.dataFlow.vendors?.records,
  serviceOwners: state.dataFlow.serviceOwners?.records,
  testLock: state.dataFlow.testLock,
  prodLock: state.dataFlow.prodLock,
  testProdLock: state.dataFlow.testProdLock,
}))(ReduxForm);

export default DataFlowForm;
