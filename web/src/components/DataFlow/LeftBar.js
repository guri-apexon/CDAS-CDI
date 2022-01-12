/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Box from "apollo-react/components/Box";
import Typography from "apollo-react/components/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Divider from "apollo-react/components/Divider";
import Switch from "apollo-react/components/Switch";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Search from "apollo-react/components/Search";
import Tag from "apollo-react/components/Tag";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import Tooltip from "apollo-react/components/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "apollo-react-icons/ChevronLeft";
import ChevronRightIcon from "apollo-react-icons/ChevronRight";
import { ReactComponent as DataFlowIcon } from "../Icons/dataflow.svg";
import { getUserInfo, debounceFunction } from "../../utils";
import PackagesList from "../../pages/DataPackages/PackagesTable";
import { getPackagesList } from "../../store/actions/DataPackageAction";

const drawerWidth = 446;

const useStyles = makeStyles((theme) => ({
  iconButton: {
    border: "1px solid #D9D9D9",
    backgroundColor: "#FFFFFF",
    height: 24,
    width: 24,
    position: "fixed",
    top: 145,
    zIndex: 1215,
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
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  paper: {
    zIndex: 1,
  },
  drawerOpenIcon: {
    left: drawerWidth,
    transition: theme.transitions.create("left", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerCloseIcon: {
    left: 12,
    transition: theme.transitions.create("left", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
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
}));

const Leftbar = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);
  const [searchTxt, setSearchTxt] = useState("");
  const packageData = useSelector((state) => state.dataPackage);
  const dataFlowData = useSelector((state) => state.dataFlow);
  const { description, selectedVendor, dataflowType, loading } = dataFlowData;
  const userInfo = getUserInfo();
  const handleDrawer = () => {
    setOpen(!open);
  };
  const viewAuditLog = () => {
    history.push("/audit-logs");
  };
  const getPackages = (query = "") => {
    dispatch(getPackagesList(query));
  };
  useEffect(() => {
    getPackages();
  }, []);
  const searchTrigger = (e) => {
    const newValue = e.target.value;
    setSearchTxt(newValue);
    debounceFunction(async () => {
      await getPackages(newValue);
    }, 1000);
  };
  const redirectDataPackage = () => {
    history.push("/data-packages");
  };
  const menuItems = [
    { text: "View audit log", onClick: viewAuditLog },
    { text: "Clone data flow" },
    { text: "Hard delete data flow" },
  ];
  const ContextMenu = () => {
    return (
      <>
        <Tooltip title="Actions" disableFocusListener>
          <IconMenuButton id="actions" menuItems={menuItems} size="small">
            <EllipsisVertical />
          </IconMenuButton>
        </Tooltip>
      </>
    );
  };
  return (
    <>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx(classes.paper, {
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
            top: 56,
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
              color="#999999"
              style={{ textTransform: "capitalize" }}
            />
            <Typography className={classes.LeftTitle}>
              Virologicclinic-IIBR12-001-Other
            </Typography>
            <Typography className={classes.LeftSubTitle}>
              {selectedVendor?.label}
            </Typography>
            <Typography className={classes.description}>
              {/* <ArrowRight className={classes.icon} /> */}
              {description}
            </Typography>
            <Button
              variant="primary"
              id="viewSettingsBtn"
              style={{ marginTop: 17 }}
              fullWidth
            >
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
                onClick={redirectDataPackage}
                size="small"
                style={{ marginRight: 10 }}
              >
                Add data package
              </Button>
            </div>
            <div style={{ maxWidth: 400 }}>
              <Search
                placeholder="Search"
                size="small"
                value={searchTxt}
                onChange={searchTrigger}
                fullWidth
              />
            </div>
            {packageData ? (
              <div className="list-container">
                {loading ? (
                  <Box display="flex" className="loader-container">
                    <ApolloProgress />
                  </Box>
                ) : (
                  <>
                    <Typography variant="body2" style={{ marginLeft: 10 }}>
                      {`${packageData.packagesList.length} Data Packages`}
                    </Typography>
                    <PackagesList userInfo={userInfo} data={packageData} />
                  </>
                )}
              </div>
            ) : (
              <div className="flex no-result">
                <img src="assets/svg/datapackage.svg" alt="datapackage" />
                <Typography>No Data Package or Datasets Added</Typography>
              </div>
            )}
          </div>
        </Box>
      </Drawer>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        className={clsx(classes.iconButton, {
          [classes.drawerOpenIcon]: open,
          [classes.drawerCloseIcon]: !open,
        })}
        onClick={handleDrawer}
      >
        {open ? (
          <ChevronLeftIcon className={classes.icon} />
        ) : (
          <ChevronRightIcon className={classes.icon} />
        )}
      </IconButton>
    </>
  );
};

export default Leftbar;
