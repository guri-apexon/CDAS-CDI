import React from "react";
import { BrowserRouter, useHistory } from "react-router-dom";

import "./App.scss";
import CDIWrapper from "./CDIWrapper/CDIWrapper";
import AppProvider from "./components/AppProvider";
import MessageProvider from "./components/MessageProvider";

const App = () => {
  const history = useHistory();
  return (
    <>
      <AppProvider>
        <MessageProvider>
          <BrowserRouter basename="/" history={history}>
            <CDIWrapper />
          </BrowserRouter>
        </MessageProvider>
      </AppProvider>
    </>
  );
};

export default App;
