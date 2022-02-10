import React from "react";
import { BrowserRouter, useHistory } from "react-router-dom";

import "./App.scss";
import RoutesWrapper from "./RoutesWrapper";
import AppProvider from "./components/Providers/AppProvider";
import MessageProvider from "./components/Providers/MessageProvider";

const App = () => {
  const history = useHistory();
  return (
    <>
      <AppProvider>
        <MessageProvider>
          <BrowserRouter basename="/" history={history}>
            <RoutesWrapper />
          </BrowserRouter>
        </MessageProvider>
      </AppProvider>
    </>
  );
};

export default App;
