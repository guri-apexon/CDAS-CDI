import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { useDispatch, useSelector } from "react-redux";
import { submit } from "redux-form";
import Box from "apollo-react/components/Box";
import Drawer from "@material-ui/core/Drawer";
import Divider from "apollo-react/components/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "apollo-react-icons/ChevronLeft";
import ChevronRightIcon from "apollo-react-icons/ChevronRight";
import Typography from "apollo-react/components/Typography";
import Switch from "apollo-react/components/Switch";
import ArrowRight from "apollo-react-icons/ArrowRight";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Tag from "apollo-react/components/Tag";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import Tooltip from "apollo-react/components/Tooltip";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";
import Search from "apollo-react/components/Search";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import PageHeader from "../../components/DataFlow/PageHeader";
import "./DataFlow.scss";
import DataFlowForm from "./DataFlowForm";
import { ReactComponent as DataFlowIcon } from "./dataflow.svg";
import { ReactComponent as DataPackageIcon } from "./datapackage.svg";
import {
  getVendorsData,
  updateSelectedLocation,
  changeFormFieldData,
  getLocationsData,
} from "../../store/actions/DataFlowAction";

const drawerWidth = 446;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  iconButton: {
    border: "1px solid #D9D9D9",
    backgroundColor: "#FFFFFF",
    height: 24,
    width: 24,
    position: "relative",
    left: 0,
    top: "4%",
    zIndex: 9999,
    boxShadow: "0 4px 16px 0 rgba(0,0,0,0.08)",
    "&:hover": {
      backgroundColor: "#fff",
    },
  },
  icon: {
    height: 16,
    width: 16,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: 25,
    justifyContent: "space-between",
  },
  drawerContent: {
    padding: "16px 25px",
  },
  leftPanel: {
    display: "inline-flex",
    alignItems: "center",
    color: "#595959",
  },
  dataPackage: {
    color: "#595959",
    padding: "25px 16px",
  },
  dataPackHead: {
    justifyContent: "space-between",
    display: "flex",
    alignItems: "center",
  },
  DataPackageTitle: {
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: 0,
    lineHeight: "24px",
  },
  LeftTitle: {
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: 0,
    lineHeight: "24px",
    marginTop: 12,
  },
  LeftSubTitle: {
    fontSize: 18,
    color: "#444444",
    lineHeight: "20px",
    marginTop: 4,
  },
  description: {
    color: "#444444",
    fontFamily: "Proxima Nova",
    fontSize: "14px",
    letterSpacing: 0,
    display: "flex",
    alignItems: "center",
    lineHeight: "24px",
    marginTop: 23,
  },
  dataflowLeft: {
    width: 16,
    height: 16,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  drawerOpen: {
    width: drawerWidth,
    overflow: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    overflow: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(1.5) + 1,
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
  },
  contentHeader: {
    paddingTop: 11,
    padding: "16px 25px",
    backgroundColor: "#ffffff",
  },
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
    letterSpacing: 0,
    lineHeight: "24px",
  },
  formSection: {
    display: "block",
    margin: "22px 15px",
  },
}));

const menuItems = [
  { text: "View audit log" },
  { text: "Clone data flow" },
  { text: "Hard delete data flow" },
];

const ContextMenu = () => {
  return (
    <>
      <Tooltip title="Actions" disableFocusListener>
        <IconMenuButton id="actions" menuItems={menuItems}>
          <EllipsisVertical />
        </IconMenuButton>
      </Tooltip>
    </>
  );
};

const Breadcrumbs = (props) => {
  return (
    <BreadcrumbsUI
      className={props.className}
      items={[
        { href: "#" },
        {
          title: "Data Flow Settings",
        },
      ]}
    />
  );
};

const onSubmit = (values) => {
  setTimeout(() => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(values, null, 2));
  }, 400);
};

const DataFlow = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const dataFlowData = useSelector((state) => state.dataFlow);
  const { selectedLocation, description, selectedVendor, dataflowType } =
    dataFlowData;
  console.log(description, "description");
  const [open, setOpen] = useState(true);
  const handleDrawer = () => {
    setOpen(!open);
  };
  const pullVendorandLocation = () => {
    dispatch(getVendorsData());
    dispatch(getLocationsData());
  };
  useEffect(() => {
    pullVendorandLocation();
  }, []);
  const changeLocationData = (value) => {
    const locationsRec = dataFlowData.locations?.records ?? [];
    const location = locationsRec?.find(
      // eslint-disable-next-line eqeqeq
      (loc) => value == loc.loc_id
    );
    dispatch(updateSelectedLocation(location));
  };
  const changeFormField = (value, field) => {
    dispatch(changeFormFieldData(value, field));
  };
  return (
    <div className={classes.root}>
      <PageHeader />
      <CssBaseline />
      <div className={classes.toolbar} />
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar} />
        <Box
          style={{
            overflow: "auto",
            position: "relative",
            top: 47,
            backgroundColor: "#fff",
          }}
        >
          <div className={classes.drawerHeader}>
            <div className={classes.leftPanel}>
              <DataFlowIcon className={classes.dataflowLeft} />
              <Typography style={{ marginLeft: 7, color: "#595959" }}>
                Data Flow
              </Typography>
            </div>
            <div className="right-panel">
              <FormControlLabel
                style={{ fontSize: 14 }}
                value="true"
                control={<Switch color="primary" size="small" />}
                label="Active"
                labelPlacement="start"
              />
              <ContextMenu />
            </div>
          </div>
          <Divider />
          <div className={classes.drawerContent}>
            <Tag
              label={dataflowType}
              variant="grey"
              style={{ textTransform: "capitalize" }}
            />
            <Typography className={classes.LeftTitle}>
              Virologicclinic-IIBR12-001-Other
            </Typography>
            <Typography className={classes.LeftSubTitle}>
              {selectedVendor?.label}
            </Typography>
            <Typography className={classes.description}>
              <ArrowRight className={classes.icon} />
              {description}
            </Typography>
            <Button variant="primary" style={{ marginTop: 17 }} fullWidth>
              View Settings
            </Button>
          </div>
          <Divider />
          <div className={classes.dataPackage}>
            <div className={classes.dataPackHead}>
              <Typography className={classes.DataPackageTitle}>
                Data Packages & Datasets
              </Typography>
              <Button
                variant="secondary"
                icon={<PlusIcon />}
                size="small"
                style={{ marginRight: 10 }}
              >
                Add data package
              </Button>
            </div>
            <div style={{ maxWidth: 400 }}>
              <Search placeholder="Search" fullWidth />
            </div>
          </div>
        </Box>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} style={{ minHeight: "30px" }} />
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          className={classes.iconButton}
          onClick={handleDrawer}
        >
          {open ? (
            <ChevronLeftIcon className={classes.icon} />
          ) : (
            <ChevronRightIcon className={classes.icon} />
          )}
        </IconButton>
        <div className={classes.contentHeader}>
          <Breadcrumbs className={classes.breadcrumbs} />
          <div style={{ display: "flex" }}>
            <DataPackageIcon className={classes.contentIcon} />
            <Typography className={classes.contentTitle}>
              Virologicclinic-IIBR12-001-Other
            </Typography>
          </div>
          <Typography className={classes.contentSubTitle}>
            6 datasets
          </Typography>
          <ButtonGroup
            alignItems="right"
            buttonProps={[
              {
                label: "Cancel",
                onClick: () => console.log("Cancel Clicked"),
              },
              {
                label: "Save",
                onClick: () => dispatch(submit("DataFlowForm")),
              },
            ]}
          />
        </div>
        <Divider />
        <div className={classes.formSection}>
          <DataFlowForm
            onSubmit={onSubmit}
            changeLocationData={changeLocationData}
            changeFormField={changeFormField}
            userName={selectedLocation?.usr_nm}
            password={selectedLocation?.pswd}
            connLink={selectedLocation?.cnn_url}
            serviceOwners={selectedLocation?.serv_ownr}
          />
        </div>
      </main>
    </div>
  );
};

export default DataFlow;
