import { Route, Switch, Redirect } from "react-router";
import { useHistory } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import Loader from "apollo-react/components/Loader";

import { getCookie } from "../../utils";
import TopNavbar from "../TopNavbar/TopNavbar";
import AppFooter from "../AppFooter/AppFooter";
import UserManagement from "../../pages/UserManagement/UserManagement";
import Dashboard from "../../pages/Dashboard/Dashboard";
import DataFlow from "../../pages/DataFlow/DataFlow";
import Logout from "../../pages/Logout/Logout";

const Empty = () => <></>;

const CDIWrapper = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);
  const history = useHistory();

  const getUrlPath = (route) => {
    return `${route}`;
  };

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
      history.push("/dashboard");
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
            <Route path="/dashboard" exact render={() => <Dashboard />} />
            <Route
              path="/dataflow-management"
              exact
              render={() => <DataFlow />}
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
