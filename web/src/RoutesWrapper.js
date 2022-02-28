import { Route, Switch, Redirect, useRouteMatch } from "react-router";
import { useLocation, useHistory } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import Loader from "apollo-react/components/Loader";

import { getCookie } from "./utils";
import TopNavbar from "./components/AppHeader/TopNavbar/TopNavbar";
import AppFooter from "./components/AppFooter/AppFooter";
import Logout from "./pages/Logout/Logout";
import DataPackages from "./pages/DataPackages/DataPackages";
import AuditLog from "./pages/AuditLog/AuditLog";
import PageHeader from "./components/Common/PageHeader";

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const DataFlow = lazy(() => import("./pages/DataFlow/ViewEdit"));
const DataFlowCreate = lazy(() => import("./pages/DataFlow/Create"));

// const DataSets = lazy(() => import("./pages/DataSets/DataSets"));
const Dataset = lazy(() => import("./pages/Dataset/Dataset"));
// const ColumnsTab = lazy(() => import("./pages/Dataset/ColumnsTab/ColumnsTab"));
// const JDBCForm = lazy(() => import("./pages/Dataset/JDBCForm"));
const CDIAdmin = lazy(() => import("./pages/Admin/CDIAdmin"));
const DatasetIngestionReport = lazy(() =>
  import("./pages/DatasetIngestionReport")
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
          path={`${match.path}/dataset/:datasetId`}
          exact
          render={() => <Dataset />}
        />
        <Route
          path="/ingestion-report/:datasetId"
          exact
          render={() => <DatasetIngestionReport />}
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
    const userId = getCookie("user.id");
    // console.log("Wrapper-props:", JSON.stringify(props));
    if (userId) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [history]);

  useEffect(() => {
    const userId = getCookie("user.id");
    // console.log(userId);
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

  return (
    <Suspense fallback={<Loader isInner />}>
      {loggedIn ? (
        <div className="page-wrapper">
          <TopNavbar setLoggedIn={setLoggedIn} />
          <Switch>
            <Route path="/dashboard" render={() => <WithPageHeader />} />
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
