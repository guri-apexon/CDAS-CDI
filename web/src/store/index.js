import { applyMiddleware, createStore, compose } from "redux";
import createSagaMiddleware from "redux-saga";

import cdasCoreSaga from "./sagas/sagas";
import { appReducer } from "./reducers";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const rootReducer = (state, action) => {
  console.log(action);
  if (action.type === "LOGOUT_SUCCESS") {
    state = undefined;
  }
  return appReducer(state, action);
};

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(cdasCoreSaga);

export default store;
