import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Box from "apollo-react/components/Box";
import Typography from "apollo-react/components/Typography";
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
import { ReactComponent as DataFlowIcon } from "../../../../components/Icons/dataflow.svg";
import PackagesList from "../../../DataPackages/PackagesTable";
import { getUserInfo, debounceFunction, isSftp } from "../../../../utils";
import {
  getPackagesList,
  addPackageBtnAction,
} from "../../../../store/actions/DataPackageAction";
import { updateDFStatus } from "../../../../store/actions/DashboardAction";
import { activateDF, inActivateDF } from "../../../../services/ApiServices";
import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../../../components/Common/usePermission";

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
  const dashboard = useSelector((state) => state.dashboard);

  const { prot_id: protId } = dashboard?.selectedCard;

  const {
    canUpdate: canUpdateDataFlow,
    canCreate: CanCreateDataFlow,
    canRead: canReadDataFlow,
  } = useStudyPermission(
    Categories.CONFIGURATION,
    Features.DATA_FLOW_CONFIGURATION,
    protId
  );

  const { canEnabled: canDeleteTest } = useStudyPermission(
    Categories.MENU,
    Features.DATA_FLOW_HARD_DELETE_TEST,
    protId
  );

  const { canEnabled: canDeleteProd } = useStudyPermission(
    Categories.MENU,
    Features.DATA_FLOW_HARD_DELETE_PROD,
    protId
  );

  // const dataflow = useSelector((state) => state.dataFlow);
  const {
    dataFlowId,
    dataFlowName,
    description,
    vendorSource,
    type,
    status,
    locationType,
  } = dashboard?.selectedDataFlow;
  const { loading, packagesList } = packageData;
  const userInfo = getUserInfo();
  const location = useLocation();
  const viewAuditLog = () => {
    history.push(`/dashboard/audit-logs/${dataFlowId}`);
  };
  const getPackages = (dfid, query = "") => {
    if (dfid) {
      dispatch(getPackagesList(dfid, query));
    } else {
      // history.push("dashboard");
    }
  };
  useEffect(() => {
    getPackages(dataFlowId);
  }, [dataFlowId]);
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
    {
      text: "View audit log",
      disabled: !canUpdateDataFlow,
      onClick: viewAuditLog,
    },
    { text: "Clone data flow", disabled: !CanCreateDataFlow },
    {
      text: "Hard delete data flow",
      disabled:
        type?.trim().toLowerCase() === "test" ? !canDeleteTest : !canDeleteProd,
    },
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

  const handleStatusUpdate = async () => {
    if (status === "Active") {
      const data = await inActivateDF(dataFlowId);
      if (data?.active === 0) {
        dispatch(updateDFStatus(dataFlowId, "Inactive"));
      }
    } else {
      const data = await activateDF(dataFlowId);
      if (parseInt(data?.active, 10) === 1) {
        dispatch(updateDFStatus(dataFlowId, "Active"));
      }
    }
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
          <Switch
            label="Active"
            className="inline-checkbox"
            checked={status === "Active"}
            onChange={handleStatusUpdate}
            disabled={!canUpdateDataFlow}
            size="small"
          />
          <ContextMenu />
        </div>
      </div>
      <Divider />
      <Box className="sidebar-content">
        <Tag
          label={type}
          variant="grey"
          style={{ textTransform: "capitalize", marginBottom: 20 }}
        />
        <Typography className={classes.LeftTitle}>{dataFlowName}</Typography>
        <Typography className={classes.LeftSubTitle}>{vendorSource}</Typography>
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
          View settings
        </Button>
      </Box>

      <Divider />
      <div className="packages-list-header">
        <div className="flex flex-center justify-between">
          <Typography className="b-font">Data Packages & Datasets</Typography>
          {packageData.packagesList[0]?.sod_view_type === null && (
            <Button
              variant="secondary"
              icon={<PlusIcon />}
              size="small"
              onClick={redirectDataPackage}
              disabled={!isSftp(locationType) || !canUpdateDataFlow}
            >
              Add data package
            </Button>
          )}
        </div>

        <div style={{ maxWidth: 400 }} className="search-package">
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
            {loading && (
              <Box display="flex" className="loader-container">
                <ApolloProgress />
              </Box>
            )}
            {!loading && (
              <>
                <Typography variant="body2" style={{ marginLeft: 10 }}>
                  {packagesList.length}
                  {packagesList.length > 1 ? " Data Packages" : " Data Package"}
                </Typography>
                <PackagesList userInfo={userInfo} data={packageData} />
              </>
            )}
          </div>
        ) : (
          <div className="flex no-result">
            <img src="/assets/svg/datapackage.svg" alt="datapackage" />
            <Typography>No Data Package or Datasets Added</Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
