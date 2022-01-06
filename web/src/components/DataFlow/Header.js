import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "apollo-react/components/Typography";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import { ReactComponent as DataPackageIcon } from "../Icons/datapackage.svg";

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
  return (
    <BreadcrumbsUI
      className={props.className}
      id="dataflow-breadcrumb"
      items={[
        { href: "#" },
        {
          title: "Data Flow Settings",
        },
      ]}
    />
  );
};
const Header = (props) => {
  const classes = useStyles();
  return (
    <>
      <Breadcrumbs className={classes.breadcrumbs} />
      <div style={{ display: "flex", paddingLeft: 11 }}>
        <DataPackageIcon className={classes.contentIcon} />
        <Typography className={classes.contentTitle}>
          Virologicclinic-IIBR12-001-Other
        </Typography>
      </div>
      <Typography className={classes.contentSubTitle}>6 datasets</Typography>
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
    </>
  );
};

export default Header;
