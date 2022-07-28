/* eslint-disable no-script-url */
import React from "react";
import { useSelector } from "react-redux";

import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ChevronLeft from "apollo-react-icons/ChevronLeft";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Divider from "apollo-react/components/Divider";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import Radio from "apollo-react/components/Radio";
import RadioGroup from "apollo-react/components/RadioGroup";
import SearchIcon from "apollo-react-icons/Search";
import TextField from "apollo-react/components/TextField";

const Step4 = ({
  classes,
  goToPreviousStep,
  nextDisabled,
  handleCancel,
  handleClone,
  vendorDetails,
  setVendorDetails,
  dataflowType,
  setDataflowType,
  breadcrumbItems,
  goToDashboard,
  loading,
}) => {
  const { vendors } = useSelector((state) => state.dataFlow);
  const dashboard = useSelector((state) => state.dashboard);
  const { protocolnumber: targetStudy } = dashboard?.selectedCard;

  const handleChange = (e, value) => {
    const key = e.target.name;
    switch (key) {
      case "dataflowType":
        setDataflowType(value);
        break;
      case "vendor":
        setVendorDetails({ ...vendorDetails, vendor: value });
        break;
      case "description":
        setVendorDetails({ ...vendorDetails, description: e.target.value });
        break;
      default:
        setVendorDetails({ ...vendorDetails, vendor: value });
        break;
    }
  };

  const isFormValid = () => {
    return dataflowType && vendorDetails?.vendor && vendorDetails?.description;
  };

  return (
    <>
      <div className={classes.contentHeader}>
        <BreadcrumbsUI
          className={classes.breadcrumbs}
          id="dataflow-breadcrumb"
          items={breadcrumbItems}
        />
        <Button
          onClick={goToDashboard}
          className="back-btn"
          icon={<ChevronLeft />}
          size="small"
        >
          Back to Dashboard
        </Button>
        <Typography
          variant="title1"
          className={`${classes.title} ${classes.bold}`}
        >
          {`Provide the following required information to clone the selected data flow to ${targetStudy}`}
        </Typography>
        {/* <Typography
          variant="title3"
          className={`${classes.ml8} ${classes.bold}`}
        >
          Verify data flow to clone
        </Typography> */}
      </div>
      <Divider />
      <div className={classes.mainSection}>
        <RadioGroup
          label="Data Flow Type"
          name="dataflowType"
          value={dataflowType}
          required
          onChange={handleChange}
          className="dataset-data-flow-type"
        >
          <Radio value="test" label="Test" />
          <Radio value="production" label="Production" />
        </RadioGroup>
        <br />
        <AutocompleteV2
          name="vendor"
          label="Vendor"
          source={vendors?.records}
          id="vendor"
          // value={vendorDetails?.vendor}
          className="autocomplete_field"
          onChange={handleChange}
          forcePopupIcon={true}
          enableVirtualization
          variant="search"
          fullWidth
          required
          popupIcon={<SearchIcon fontSize="extraSmall" />}
        />
        <TextField
          label="Description"
          placeholder="Placeholder"
          name="description"
          value={vendorDetails?.description}
          sizeAdjustable
          minHeight={280}
          inputProps={{ maxLength: 30 }}
          fullWidth
          onChange={handleChange}
          required
        />
        <div className={`${classes.mt24} flex justify-between`}>
          {/* <Button onClick={goToPreviousStep}>Previous</Button> */}
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={handleClone}
            variant="primary"
            disabled={!isFormValid() || loading}
          >
            Clone & edit
          </Button>
        </div>
      </div>
    </>
  );
};

export default Step4;
