/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import compose from "@hypnosphi/recompose/compose";
import { connect, useDispatch } from "react-redux";
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
} from "../../../components/FormComponents/FormComponents";
import validate from "../../../components/FormComponents/validation";
import LocationModal from "../../../components/Common/LocationModal";

import { locationTypes, dataStruct, SodLocationTypes } from "../../../utils";
import usePermission, {
  Categories,
  Features,
} from "../../../components/Common/usePermission";

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
  const dispatch = useDispatch();
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
    tabularSod,
    changeDataStrucuture,
    changeFormField,
    changeLocationType,
    connLink,
    initialValues,
  } = props;

  const { canUpdate: canUpdateLocation, canCreate: canCreateLocation } =
    usePermission(Categories.CONFIGURATION, Features.LOCATION_SETUP);

  const onChangeServiceOwner = (values) => {
    change("serviceOwner", values);
  };

  const onChangeVendor = (values) => {
    change("vendor", values);
  };

  const onChangeLocation = (values) => {
    // console.log("location", values);
    changeLocationData([values?.src_loc_id]);
    change("locationName", values);
  };

  const openLocationModal = () => {
    setLocationOpen(true);
  };
  useEffect(() => {
    // console.log("initialValues::::", initialValues);
    // changeFormField("", "description");
    // dispatch(change("DataFlowForm", "description", ""));
    // if (initialValues?.selectedVendor?.value) {
    //   dispatch(
    //     change("DataFlowForm", "vendor", [initialValues?.selectedVendor?.value])
    //   );
    // }
  }, [initialValues]);
  return (
    <form onSubmit={handleSubmit}>
      <Paper className={classes.paper}>
        <div className={classes.section}>
          <Typography variant="title1">Flow Details</Typography>
          <div style={{ width: "50%" }}>
            <ReduxFormAutocompleteV2
              name="vendor"
              label="Vendor"
              source={vendors}
              id="vendor"
              className="autocomplete_field"
              input={{
                onChange: onChangeVendor,
              }}
              disabled={!vendors?.length}
              forcePopupIcon={true}
              singleSelect
              enableVirtualization
              variant="search"
              fullWidth
              required
              disabled={!vendors?.length}
            />
            {/* <ReduxFormAutocomplete
              name="vendor1"
              label="Vendor1"
              source={vendors}
              id="vendor1"
              className="autocomplete_field"
              onChange={(v) => changeFormField(v, "vendor", vendors)}
              singleSelect
              variant="search"
              fullWidth
              required
            /> */}
            <ReduxFormTextField
              fullWidth
              maxLength="30"
              name="description"
              inputProps={{ maxLength: 30 }}
              onChange={(v) => changeFormField(v, "description")}
              label="Description"
              required
            />
            <div className="expected-date">
              <ReduxFormDatePickerV2
                name="firstFileDate"
                dateFormat="DD MMM YYYY"
                placeholder="DD MMM YYYY"
                label="Expected First File Date"
              />
            </div>

            <ReduxFormRadioGroup
              name="dataflowType"
              onChange={(v) => changeFormField(v, "dataflowType")}
              label="Data Flow Type"
              required
              className="dataset-data-flow-type"
            >
              <Radio value="test" label="Test" />
              <Radio value="production" label="Production" />
            </ReduxFormRadioGroup>
          </div>
        </div>
        <Divider className={classes.divider} />
        <div className={classes.section}>
          <Grid container spacing={2}>
            <Grid item md={5}>
              <Typography variant="title1" id="locationDetailTitile">
                Location Details
              </Typography>
              <ReduxFormSelect
                name="dataStructure"
                id="dataStructure"
                label="Data Structure"
                onChange={(e) => {
                  changeDataStrucuture(e.target.value);
                }}
                fullWidth
                required
              >
                {dataStruct?.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </ReduxFormSelect>
              {tabularSod ? (
                <ReduxFormSelect
                  name="locationType"
                  label="Location Type"
                  required
                  onChange={(e) => changeLocationType(e.target.value)}
                  fullWidth
                >
                  {SodLocationTypes?.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </ReduxFormSelect>
              ) : (
                <ReduxFormSelect
                  name="locationType"
                  label="Location Type"
                  required
                  onChange={(e) => changeLocationType(e.target.value)}
                  fullWidth
                >
                  {locationTypes?.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </ReduxFormSelect>
              )}
              {/* <ReduxFormAutocomplete
                name="locationName"
                label="Location Name"
                source={locations}
                className="autocomplete_field"
                variant="search"
                onChange={changeLocationData}
                singleSelect
                fullWidth
                required
              /> */}
              <ReduxFormAutocompleteV2
                name="locationName"
                label="Location Name"
                source={locations}
                disabled={!locations?.length}
                input={{
                  onChange: onChangeLocation,
                }}
                variant="search"
                singleSelect
                fullWidth
                required
              />
              <Link
                disabled={!canCreateLocation}
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
                canUpdate={canUpdateLocation}
                canCreate={canCreateLocation}
                isNew={true}
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
          <div style={{ width: "50%" }} className="service-owner">
            <ReduxFormAutocompleteV2
              name="serviceOwner"
              label="Service Owners (Optional)"
              source={serviceOwners ?? []}
              input={{
                onChange: onChangeServiceOwner,
              }}
              forcePopupIcon={true}
              fullWidth
              enableVirtualization
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
  // initialValues: state.dataFlow, // pull initial values from account reducer
  values: getFormValues("DataFlowForm")(state),
  locations: state.dataFlow.locations?.records,
  vendors: state.dataFlow.vendors?.records,
  serviceOwners: state.dataFlow.serviceOwners?.records,
}))(ReduxForm);

export default DataFlowForm;
