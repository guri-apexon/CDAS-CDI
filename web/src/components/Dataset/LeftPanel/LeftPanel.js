/* eslint-disable react/jsx-wrap-multilines */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
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
import { ReactComponent as DataFlowIcon } from "../../Icons/dataflow.svg";
import PackagesList from "../../../pages/DataPackages/PackagesTable";
import { getUserInfo, debounceFunction } from "../../../utils";
import {
  getPackagesList,
  addPackageBtnAction,
} from "../../../store/actions/DataPackageAction";

import "./LeftPanel.scss";

const useStyles = makeStyles(() => ({
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: 25,
    maxHeight: "70px",
    justifyContent: "space-between",
  },
  leftPanel: {
    display: "inline-flex",
    alignItems: "center",
    color: "#595959",
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
}));

const LeftPanel = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const [searchTxt, setSearchTxt] = useState("");
  const packageData = useSelector((state) => state.dataPackage);
  const dataFlow = useSelector((state) => state.dataFlow);
  const dashboard = useSelector((state) => state.dashboard);
  const { dataFlowdetail, loading } = dataFlow;
  const { description, vendorname, testflag, active, name } = dataFlowdetail;
  const userInfo = getUserInfo();
  const location = useLocation();
  const { selectedDFId, selectedCard } = dashboard;
  const viewAuditLog = () => {
    history.push("/dashboard/audit-logs");
  };
  const getPackages = (query = "") => {
    if (selectedDFId) {
      dispatch(getPackagesList(selectedDFId, query));
    } else {
      // history.push("dashboard");
    }
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
    if (location.pathname === "/dashboard/data-packages") {
      dispatch(addPackageBtnAction());
    } else {
      history.push("/dashboard/data-packages");
    }
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
    <div className="leftPanel">
      <div className={classes.drawerHeader}>
        <div className={classes.leftPanel}>
          <DataFlowIcon className={classes.dataflowLeft} />
          <Typography style={{ marginLeft: 7, color: "#595959" }}>
            Data Flow
          </Typography>
        </div>
        <div className="right-panel top-status-checkbox">
          <FormControlLabel
            style={{ fontSize: 14 }}
            value="true"
            control={
              <Switch
                color="primary"
                size="small"
                checked={active === 0 ? false : true}
              />
            }
            label="Active"
            labelPlacement="start"
          />
          <ContextMenu />
        </div>
      </div>
      <Divider />
      <Box className="sidebar-content">
        <Tag
          label={testflag === 1 ? "Test" : "Production"}
          variant="grey"
          style={{ textTransform: "capitalize", marginBottom: 20 }}
        />
        <Typography className={classes.LeftTitle}>{name}</Typography>
        <Typography className={classes.LeftSubTitle}>{vendorname}</Typography>
        <Typography className={classes.description}>
          {/* <ArrowRight className={classes.icon} /> */}
          {description}
        </Typography>
        <Button
          variant="primary"
          style={{ marginTop: 17 }}
          fullWidth
          size="small"
        >
          View Settings
        </Button>
      </Box>

      <Divider />
      <div className="packages-list-header">
        <div className="flex flex-center justify-between">
          <Typography className="b-font">Data Packages & Datasets</Typography>
          <Button
            variant="secondary"
            icon={<PlusIcon />}
            size="small"
            onClick={redirectDataPackage}
          >
            Add Data Package
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
      </div>
      <div className="packages-list customScrollbar">
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
    </div>
  );
};

export default LeftPanel;
