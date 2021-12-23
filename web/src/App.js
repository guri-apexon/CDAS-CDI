import React from "react";
import { BrowserRouter, useHistory } from "react-router-dom";

import "./App.scss";
import ErrorBoundary from "./components/ErrorBoundary";
import CDIWrapper from "./components/CDIWrapper/CDIWrapper";
import AppProvider from "./components/AppProvider";
import MessageProvider from "./components/MessageProvider";

const App = () => {
  const history = useHistory();
  return (
    <>
      <ErrorBoundary>
        <AppProvider>
          <MessageProvider>
            <BrowserRouter basename="/" history={history}>
              <CDIWrapper />
            </BrowserRouter>
          </MessageProvider>
        </AppProvider>
      </ErrorBoundary>
    </>
  );
};

export default App;
