import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tab from "apollo-react/components/Tab";
import Modal from "apollo-react/components/Modal";
import Tabs from "apollo-react/components/Tabs";
import Typography from "apollo-react/components/Typography";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";

const useStyles = makeStyles(() => ({
  breadcrumbs: {
    marginBottom: 16,
    paddingLeft: 0,
  },
  contentIcon: {
    color: "#595959",
  },
  contentTitle: {
    color: "#000000",
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: 0,
    lineHeight: "24px",
    marginLeft: "8px",
    marginBottom: "8px",
  },
  contentSubTitle: {
    color: "#000000",
    fontSize: "14px",
    paddingLeft: 11,
    letterSpacing: 0,
    lineHeight: "24px",
  },
}));

const Breadcrumbs = (props) => {
  const items = props.breadcrumbItems ?? [];
  return (
    <BreadcrumbsUI
      className={props.className}
      id="dataflow-breadcrumb"
      items={items}
    />
  );
};
const Header = (props) => {
  const { headerTitle, currentStep } = props;
  const classes = useStyles();
  const [hidebackBtn, setHideBackBtn] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  useEffect(() => {
    if (currentStep) {
      setHideBackBtn(currentStep <= 1);
    }
  }, [currentStep]);
  return (
    <>
      <Breadcrumbs
        className={classes.breadcrumbs}
        breadcrumbItems={props.breadcrumbItems}
      />
      <div style={{ display: "flex", paddingLeft: 11 }}>
        {props.icon}
        <Typography className={classes.contentTitle}>{headerTitle}</Typography>
      </div>
      {props.datasetsCount && (
        <Typography className={classes.contentSubTitle}>
          {`${props.datasetsCount} datasets`}
        </Typography>
      )}
      {(!props.tabValue || props.tabValue === 0) && (
        <ButtonGroup
          alignItems="right"
          buttonProps={[
            {
              label: "Cancel",
              onClick: () => setConfirmCancel(true),
              size: "small",
            },
            {
              label: "Back",
              style: { display: hidebackBtn ? "none" : "flex" },
              variant: "secondary",
              onClick: () => props.back(),
              size: "small",
            },
            {
              label: currentStep >= 5 ? "Save data flow" : "Next",
              onClick: () => props.submit(),
              size: "small",
            },
          ]}
        />
      )}
      {props.tabs && (
        <Tabs
          value={props.tabValue}
          onChange={props.handleChangeTab}
          size="small"
          style={{ marginBottom: "-19px" }}
          truncate
        >
          {props.tabs.map((tab) => (
            <Tab
              label={tab}
              disabled={
                Object.keys(props.selectedDataset).length <= 0 &&
                tab === "Dataset Columns"
              }
            />
          ))}
        </Tabs>
      )}
      <Modal
        open={confirmCancel}
        variant="warning"
        onClose={() => setConfirmCancel(false)}
        title="Are you sure you want to cancel?"
        message="All progress will be lost"
        buttonProps={[
          { label: "Dismiss" },
          { label: "Yes cancel", onClick: () => props.close() },
        ]}
        id="warning"
      />
    </>
  );
};

export default Header;
