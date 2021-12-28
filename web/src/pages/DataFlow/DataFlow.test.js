import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import DataFlow from "./DataFlow";

const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {
  loading: false,
  selectedLocation: {},
  serviceOwner: [],
  locations: [],
  vendors: [],
  userName: "",
  password: "",
  connLink: "",
  description: "",
  dataflowType: "test",
  dataStructure: "tabular",
  locationType: "SFTP",
  selectedVendor: {},
};
const store = mockStore({ dataFlow: initialState });

test("DataFlow component renders", () => {
  const wrapper = mount(
    <Provider store={store}>
      <DataFlow />
    </Provider>
  );
  setTimeout(() => {
    expect(wrapper).toMatchSnapshot();
  });
});

test("DataFlow Breadcrumbs available", () => {
  const wrapper = mount(
    <Provider store={store}>
      <DataFlow />
    </Provider>
  );
  const p = wrapper.find("#dataflow-breadcrumb p");
  setTimeout(() => {
    expect(p.text()).toBe("Data Flow Settings");
  });
});
