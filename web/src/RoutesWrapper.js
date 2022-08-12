import { Route, Switch, Redirect, useRouteMatch } from "react-router";
import { useLocation, useHistory } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import Loader from "apollo-react/components/Loader";
import { getUserId, setIdleLogout } from "./utils";
import TopNavbar from "./components/AppHeader/TopNavbar/TopNavbar";
import AppFooter from "./components/AppFooter/AppFooter";
import Logout from "./pages/Logout/Logout";
import DataPackages from "./pages/DataPackages/DataPackages";
import AuditLog from "./pages/AuditLog/AuditLog";
import PageHeader from "./components/Common/PageHeader";
import { userLogOut } from "./services/ApiServices";

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Monitor = lazy(() => import("./pages/Dashboard/MonitorTab/ViewAll"));
const CDIhome = lazy(() =>
  import("./pages/Dashboard/AllMonitorTab/AllMonitor")
);
const DataFlow = lazy(() => import("./pages/DataFlow/ViewEdit"));
const DataFlowCreate = lazy(() => import("./pages/DataFlow/Create"));
const DataFlowClone = lazy(() => import("./pages/CloneDataFlow/index"));
const Dataset = lazy(() => import("./pages/Dataset/Dataset"));
// const ColumnsTab = lazy(() => import("./pages/Dataset/ColumnsTab/ColumnsTab"));
const CDIAdmin = lazy(() => import("./pages/Admin/CDIAdmin"));
const DatasetIngestionReport = lazy(() =>
  import("./pages/DatasetIngestionReport")
);
const IngestionIssues = lazy(() =>
  import("./pages/DatasetIngestionReport/IngestionIssues")
);

const Empty = () => <></>;

const WithPageHeader = () => {
  const match = useRouteMatch();
  return (
    <>
      <PageHeader height={64} />
      <Switch>
        <Route path={`${match.path}`} exact render={() => <Dashboard />} />
        <Route
          path={`${match.path}/monitor`}
          exact
          render={() => <Monitor />}
        />
        <Route
          path={`${match.path}/audit-logs/:dataflowId`}
          exact
          render={() => <AuditLog />}
        />
        <Route
          path={`${match.path}/data-packages`}
          exact
          render={() => <DataPackages />}
        />
        <Route
          path={`${match.path}/dataflow-management/:dataflowId`}
          exact
          render={() => <DataFlow />}
        />
        <Route
          path={`${match.path}/dataflow/create`}
          exact
          render={() => <DataFlowCreate />}
        />
        <Route
          path={`${match.path}/dataflow/clone`}
          exact
          render={() => <DataFlowClone />}
        />
        <Route
          path={`${match.path}/dataset/:datasetId`}
          exact
          render={() => <Dataset />}
        />
        <Route
          path={`${match.path}/ingestion-report/:datasetId`}
          exact
          render={() => <DatasetIngestionReport />}
        />
        <Route
          path={`${match.path}/ingestion-issues/:datasetId`}
          exact
          render={() => <IngestionIssues />}
        />
        <Redirect from="*" to="/dashboard" />
      </Switch>
    </>
  );
};

const WithOutPageHeader = () => {
  const match = useRouteMatch();
  return (
    <>
      <Switch>
        <Route path={`${match.path}/cdi`} exact render={() => <CDIAdmin />} />
        {/* <Route path={`${match.path}/jdbc`} exact render={() => <JDBCForm />} />  */}
        {/* <Route
          path={`${match.path}/columns`}
          exact
          render={() => <ColumnsTab />}
        /> */}
        <Route path="/cdihome" exact render={() => <CDIhome />} />
        <Route
          path={`${match.path}/monitor`}
          exact
          render={() => <Monitor />}
        />
      </Switch>
      <AppFooter width="100%" />
    </>
  );
};

const CDIWrapper = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [checkedOnce, setCheckedOnce] = useState(false);

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const userId = getUserId(true);
    if (userId) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [history]);

  useEffect(() => {
    const userId = getUserId(true);
    if (userId) {
      history.push(location.pathname);
      if (location.pathname === "/") {
        history.push("/dashboard");
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (!checkedOnce) {
        window.location.href = `${process.env.REACT_APP_LAUNCH_URL}`;
        console.log("dotenv :", process.env.REACT_APP_LAUNCH_URL);
        setCheckedOnce(true);
      }
    }
  }, [checkedOnce, history]);

  const logoutOnIdle = async () => {
    const isLogout = await userLogOut();
    if (isLogout) {
      setLoggedIn(false);
      history.push("/logout");
    }
  };

  useEffect(() => {
    setIdleLogout(() => {
      logoutOnIdle();
    });
  }, []);

  return (
    <Suspense fallback={<Loader isInner />}>
      {loggedIn ? (
        <div className="page-wrapper">
          <TopNavbar setLoggedIn={setLoggedIn} />
          <Switch>
            <Route path="/dashboard" render={() => <WithPageHeader />} />
            <Route path="/cdihome" render={() => <WithOutPageHeader />} />
            <Route path="/admin" render={() => <WithOutPageHeader />} />
            <Route path="*" render={() => <WithPageHeader />} />
          </Switch>
        </div>
      ) : (
        <Switch>
          <Route path="/checkAuthentication" exact render={() => <Empty />} />
          <Route path="/logout" render={() => <Logout />} />
          <Redirect from="/" to="/checkAuthentication" />
        </Switch>
      )}
    </Suspense>
  );
};

export default CDIWrapper;
