import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import DataPackages from "./DataPackages";

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
  DataPackagesType: "test",
  dataStructure: "tabular",
  locationType: "SFTP",
  selectedVendor: {},
};
const store = mockStore({
  dataPackage: {
    packagesList: [],
    selectedPackage: {},
    loading: false,
    refreshData: false,
  },
  dataFlow: initialState,
  dashboard: {
    dashboardData: [],
    notOnBoardedStudyStatus: {},
    loading: false,
    exportStudy: null,
    selectedCard: {
      phase: "",
      projectcode: "",
      prot_id: "",
      protocolnumber: "",
      protocolstatus: "",
      sponsorname: "",
      vendors: "",
      dataFlows: "",
      dataSets: "",
    },
  },
});

const wrapper = mount(
  <Provider store={store}>
    <DataPackages />
  </Provider>
);
test("DataPackages component renders", () => {
  setTimeout(() => {
    expect(wrapper).toMatchSnapshot();
  });
});

test("DataPackages Breadcrumbs available", () => {
  const p = wrapper.find("#DataPackages-breadcrumb p");
  setTimeout(() => {
    expect(p.text()).toBe("Data Package Settings");
  });
});

test("DataPackages No Data available available", () => {
  const p = wrapper.find(".add-btn-container h3");
  setTimeout(() => {
    expect(p.text()).toBe("No Data Package or Datasets Added");
  });
});

test("DataPackages Packages Search Box Exist", () => {
  expect(wrapper.find(".package-searchbox input")).toHaveLength(1);
});

test("DataPackages Header Exist", () => {
  expect(wrapper.find(".top-content").exists()).toBeTruthy();
});

test("DataPackages Data Structure change simulate", () => {
  wrapper.find(".add-btn-container button").simulate("click");
  expect(wrapper.find(".data-setting-header p")).toHaveLength(1);
  expect(wrapper.find(".data-setting-header p").text()).toEqual(
    "Data Package Settings"
  );
});
test("DataPackages Data Config active and package type Working fine", () => {
  const checkbox = wrapper.find(".config-checkbox input");
  expect(checkbox.exists()).toBeTruthy();
  checkbox.simulate("change", { target: { checked: true } });
  expect(checkbox.getDOMNode().checked).toBeTruthy();
  const select = wrapper.find(".package-type input");
  expect(select.exists()).toBeTruthy();
  expect(select.getDOMNode().value).toEqual("not_compressed");
});
