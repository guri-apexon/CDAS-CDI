import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tab from "apollo-react/components/Tab";
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
  const classes = useStyles();
  return (
    <>
      <Breadcrumbs
        className={classes.breadcrumbs}
        breadcrumbItems={props.breadcrumbItems}
      />
      <div style={{ display: "flex", paddingLeft: 11 }}>
        {props.icon}
        <Typography className={classes.contentTitle}>
          {props.headerTitle}
        </Typography>
      </div>
      {props.datasetsCount && (
        <Typography className={classes.contentSubTitle}>
          {`${props.datasetsCount} datasets`}
        </Typography>
      )}
      <ButtonGroup
        alignItems="right"
        buttonProps={[
          {
            label: "Cancel",
            onClick: () => props.close(),
          },
          {
            label: "Save",
            onClick: () => props.submit(),
          },
        ]}
      />
      {props.tabs && (
        <Tabs
          value={props.tabValue}
          onChange={props.handleChangeTab}
          size="small"
          style={{ marginBottom: "-19px" }}
          truncate
        >
          {props.tabs.map((tab) => (
            <Tab label={tab} />
          ))}
        </Tabs>
      )}
    </>
  );
};

export default Header;
