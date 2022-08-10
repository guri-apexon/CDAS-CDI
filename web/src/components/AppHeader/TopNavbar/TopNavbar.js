/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
import { useState, useContext, useEffect, useRef, memo } from "react";
import { withRouter } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import NavigationBar from "apollo-react/components/NavigationBar";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { neutral7 } from "apollo-react/colors";
import Typography from "apollo-react/components/Typography";
import Backdrop from "apollo-react/components/Backdrop";
import CircularProgress from "apollo-react/components/CircularProgress";
import Banner from "apollo-react/components/Banner";
import App from "apollo-react-icons/App";
import DashboardIcon from "apollo-react-icons/Dashboard";
import Question from "apollo-react-icons/Question";
import moment from "moment";
import Button from "apollo-react/components/Button";
import Modal from "apollo-react/components/Modal";
import NavigationPanel from "../NavigationPanel/NavigationPanel";
import { MessageContext } from "../../Providers/MessageProvider";
import { AppContext } from "../../Providers/AppProvider";
// eslint-disable-next-line import/named
import { getUserInfo, matchAppUrl } from "../../../utils/index";
// eslint-disable-next-line import/named
import { userLogOut, getRolesPermissions } from "../../../services/ApiServices";
import {
  hideAppSwitcher,
  showAlert,
} from "../../../store/actions/AlertActions";

const styles = {
  root: {
    display: "flex",
    height: 400,
    boxSizing: "content-box",
  },
  panelTitle: {
    padding: "24px 24px 16px 24px",
    fontWeight: 600,
  },
  card: {
    margin: "8px 24px",
    cursor: "pointer",
  },
  cardHighlight: {
    backgroundColor: "#d8e7fe",
  },
  bold: {
    fontWeight: 600,
  },
  cardSubtitle: {
    color: neutral7,
    lineHeight: "24px",
  },
  page: {
    padding: 24,
  },
  panelContent: {
    overflow: "auto",
    height: 333,
    minWidth: 300,
  },
  centerAligned: {
    display: "flex",
    alignItems: "center",
  },
  appIcon: {
    fontSize: 24,
    color: "#fff",
    cursor: "pointer",
  },
  helpIcon: {},
  navLogo: {
    color: "white",
    marginRight: 24,
    cursor: "pointer",
    zIndex: 2,
    whiteSpace: "nowrap",
  },
  nav: {
    overflow: "hidden",
  },
  fullNavHeight: {
    height: "100%",
  },
};

const menuItems = [
  {
    text: "Dashboard",
    pathname: "/dashboard",
  },
  {
    text: "Reports",
    menuItems: [],
  },
  {
    text: "Admin",
    pathname: "/admin/cdi",
  },
];

const useStyles = makeStyles(styles);

const TopNavbar = ({ history, location: { pathname }, setLoggedIn }) => {
  const classes = useStyles();
  const [panelOpen, setpanelOpen] = useState(true);
  const appContext = useContext(AppContext);
  const { permissions } = appContext.user;

  const dispatch = useDispatch();
  const alertStore = useSelector((state) => state.alert);

  const [notLoggedOutErr, setNotLoggedOutErr] = useState(false);
  const [open, setOpen] = useState(false);
  const messageContext = useContext(MessageContext);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const userInfo = getUserInfo();
  const profileMenuProps = {
    name: userInfo.fullName,
    title: userInfo.userEmail,
    email: userInfo.lastLogin ? (
      <span style={{ fontSize: "13px" }}>
        Last Login:
        {userInfo.lastLogin}
      </span>
    ) : (
      ""
    ),
    // eslint-disable-next-line no-use-before-define
    logoutButtonProps: { onClick: () => LogOut() },
    menuItems: [],
  };
  const ConfirmModal = memo(({ showVersionopen, closeModal }) => {
    return (
      <Modal
        open={showVersionopen}
        disableBackdropClick="true"
        onClose={closeModal}
        message={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <>
            <div>Clinical Data Analytics Suite</div>
            <p>Version 1.0</p>
          </>
        }
        buttonProps={[{ label: "Close", onClick: closeModal }]}
        id="neutral"
      />
    );
  });
  const getPermisions = async () => {
    if (!matchAppUrl()) {
      LogOut();
      return false;
    }
    if (permissions.length === 0) {
      let uniquePermissions = [];
      const data = await getRolesPermissions();
      if (data.status === 401) {
        LogOut();
        return false;
      }
      console.log(">>> all permissions", data);
      if (data.message === "Something went wrong") {
        messageContext.showErrorMessage(
          `There was an issue authorizing your login information. Please contact your Administrator.`
        );
      } else {
        uniquePermissions = Array.from(
          data
            .reduce((acc, { categoryName, featureName, allowedPermission }) => {
              const current = acc.get(featureName) || {
                allowedPermission: [],
              };
              return acc.set(featureName, {
                ...current,
                categoryName,
                featureName,
                allowedPermission: [
                  ...current.allowedPermission,
                  allowedPermission,
                ],
              });
            }, new Map())
            .values()
        );
        appContext.updateUser({ permissions: uniquePermissions });
      }

      // console.log(uniquePermissions);
    }
  };

  useEffect(() => {
    getPermisions();
  }, []);
  const LogOut = async () => {
    setOpen(true);
    const isLogout = await userLogOut();
    if (isLogout) {
      setLoggedIn(false);
      history.push("/logout");
      setOpen(false);
    } else {
      setNotLoggedOutErr(true);
      setOpen(false);
    }
  };

  const notificationsMenuProps = {
    newNotifications: true,
    notifications: [
      {
        icon: DashboardIcon,
        header: "Header",
        details: "Lorem ipsum dolor sit ame. Lorem ipsum dolor sit ame.",
        timestamp: moment(),
      },
    ],
  };

  useEffect(() => {
    // console.log(alertStore);
    if (alertStore?.showAppSwitcher) {
      setpanelOpen(true);
    }
  }, [alertStore]);

  const toggleMenu = () => {
    // eslint-disable-next-line no-shadow
    // setpanelOpen((panelOpen) => !panelOpen);

    if (alertStore.isFormComponentActive && panelOpen === false) {
      dispatch(hideAppSwitcher());
      dispatch(showAlert());
    }
    if (alertStore.isFormComponentActive === false || undefined) {
      // eslint-disable-next-line no-shadow
      setpanelOpen((panelOpen) => !panelOpen);
    }
  };
  const onPanelClose = () => {
    setpanelOpen(false);
  };

  return (
    <div id="topNavbar">
      <ConfirmModal
        showVersionopen={showVersionModal}
        closeModal={() => setShowVersionModal(false)}
      />
      <Backdrop style={{ zIndex: 1 }} open={open}>
        <CircularProgress variant="indeterminate" size="small" />
      </Backdrop>
      <NavigationBar
        LogoComponent={() => (
          <div className={classes.centerAligned}>
            <Button onClick={toggleMenu} className={classes.fullNavHeight}>
              <App className={classes.appIcon} />
            </Button>
            <Typography
              className={classes.navLogo}
              onClick={() => history.replace("/dashboard")}
            >
              IQVIA™
              <span style={{ paddingLeft: 5 }} className={classes.bold}>
                Clinical Data Ingestion
              </span>
            </Typography>
          </div>
        )}
        position="static"
        menuItems={menuItems}
        profileMenuProps={profileMenuProps}
        // eslint-disable-next-line no-shadow
        onClick={({ pathname }) => history.push(pathname)}
        checkIsActive={(item) =>
          item.pathname
            ? item.pathname === pathname
            : item.menuItems.some((e) => e.pathname === pathname)
        }
        waves
        // notificationsMenuProps={notificationsMenuProps}
        otherButtons={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <div className={classes.centerAligned}>
            <Button
              // onClick={() => setShowVersionModal(true)}
              // className={classes.fullNavHeight}
              onClick={() =>
                window.open(
                  "https://docs.ims.io/CDAS/CDI/1.1/USG/Default.htm",
                  "_blank"
                )
              }
            >
              <Question className={classes.appIcon} />
            </Button>
          </div>
        }
        className={classes.nav}
      />

      <NavigationPanel open={panelOpen} onClose={onPanelClose} />

      <Banner
        variant="error"
        open={notLoggedOutErr}
        onClose={() => setNotLoggedOutErr(false)}
        message="Error: There is some error in logging out!"
      />
      <Banner
        variant={messageContext.errorMessage.variant}
        open={messageContext.errorMessage.show}
        onClose={messageContext.bannerCloseHandle}
        message={messageContext.errorMessage.messages}
        id={`Message-Banner--${messageContext.errorMessage.variant}`}
        className="Message-Banner"
      />
    </div>
  );
};

export default withRouter(TopNavbar);
