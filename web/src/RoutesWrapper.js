import { Route, Switch, Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import Loader from "apollo-react/components/Loader";

import { getCookie } from "./utils";
import TopNavbar from "./components/AppHeader/TopNavbar/TopNavbar";
// import AppFooter from "../AppFooter/AppFooter";
import Logout from "./pages/Logout/Logout";
import DataPackages from "./pages/DataPackages/DataPackages";
import AuditLog from "./pages/AuditLog/AuditLog";
import PageHeader from "./components/Common/PageHeader";

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const DataFlow = lazy(() => import("./pages/DataFlow/DataFlow"));
// const DataSets = lazy(() => import("./pages/DataSets/DataSets"));
const Dataset = lazy(() => import("./pages/Dataset/Dataset"));

const Empty = () => <></>;

const CDIWrapper = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [checkedOnce, setCheckedOnce] = useState(false);
  const history = useHistory();

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
    console.log(userId);
    if (userId) {
      // history.push("/dashboard");
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
          <PageHeader height={64} />
          <Switch>
            <Route path="/dashboard" exact render={() => <Dashboard />} />
            <Route
              path="/data-packages"
              exact
              render={() => <DataPackages />}
            />
            <Route
              path="/audit-logs/:dataflowId"
              exact
              render={() => <AuditLog />}
            />
            <Route
              path="/dataflow-management"
              exact
              render={() => <DataFlow />}
            />
            <Route
              path="/datasets-management"
              exact
              render={() => <Dataset />}
            />
            <Route
              path="/dataset/:datasetId"
              exact
              render={() => <Dataset />}
            />
            <Redirect from="/" to="/dashboard" />
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
