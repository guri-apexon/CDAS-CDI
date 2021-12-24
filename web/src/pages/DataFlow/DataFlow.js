import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from "apollo-react/components/Box";
import Drawer from "@material-ui/core/Drawer";
import Divider from "apollo-react/components/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "apollo-react-icons/ChevronLeft";
import ChevronRightIcon from "apollo-react-icons/ChevronRight";
import ChartBar from "apollo-react-icons/ChartBar";
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

import PageHeader from "../../components/DataFlow/PageHeader";
import "./DataFlow.scss";

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
    left: -41,
    top: -14,
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
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
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

const DataFlow = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const handleDrawer = () => {
    setOpen(!open);
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
              <ChartBar className={classes.dataflowLeft} />
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
            <Tag label="Production" variant="grey" />
            <Typography className={classes.LeftTitle}>
              Virologicclinic-IIBR12-001-Other
            </Typography>
            <Typography className={classes.LeftSubTitle}>
              Analytical Labs
            </Typography>
            <Typography className={classes.description}>
              <ArrowRight className={classes.icon} />
              Discription
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
        <div className={classes.toolbar} />
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
      </main>
    </div>
  );
};

export default DataFlow;
