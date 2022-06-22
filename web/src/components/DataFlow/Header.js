import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import Typography from "apollo-react/components/Typography";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Modal from "apollo-react/components/Modal/Modal";

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
  const { headerTitle, saveBtnLabel } = props;
  const [openModal, setopenModal] = useState(false);
  const classes = useStyles();
  const onCancel = () => {
    setopenModal(true);
  };
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
              onClick: onCancel,
            },
            {
              label: saveBtnLabel || "Save",
              onClick: () => props.submit(),
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
        open={openModal}
        variant="warning"
        onClose={() => setopenModal(false)}
        title="Exit"
        message="Do you really want to exit and discard dataflow changes"
        buttonProps={[
          {
            label: "Discard changes",
            onClick: () => {
              props.close();
              setopenModal(false);
            },
          },
          {
            label: "Continue editing data flow",
            variant: "primary",
            onClick: () => setopenModal(false),
          },
        ]}
        id="success"
      />
    </>
  );
};

export default Header;
