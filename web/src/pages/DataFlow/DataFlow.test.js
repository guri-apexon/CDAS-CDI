// import React from "react";
// import { Provider } from "react-redux";
// import configureStore from "redux-mock-store";
// import { mount } from "enzyme";
// import DataFlow from "./DataFlow";
// import { ReduxFormSelect } from "../../components/FormComponents/FormComponents";

// const middlewares = [];
// const mockStore = configureStore(middlewares);
// const initialState = {
//   loading: false,
//   selectedLocation: {},
//   serviceOwner: [],
//   locations: [],
//   vendors: [],
//   userName: "",
//   password: "",
//   connLink: "",
//   description: "",
//   dataflowType: "test",
//   dataStructure: "tabular",
//   locationType: "SFTP",
//   selectedVendor: {},
// };
// const store = mockStore({ dataFlow: initialState });

// test("DataFlow component renders", () => {
//   const wrapper = mount(
//     <Provider store={store}>
//       <DataFlow />
//     </Provider>
//   );
//   setTimeout(() => {
//     expect(wrapper).toMatchSnapshot();
//   });
// });

// test("DataFlow Breadcrumbs available", () => {
//   const wrapper = mount(
//     <Provider store={store}>
//       <DataFlow />
//     </Provider>
//   );
//   const p = wrapper.find("#dataflow-breadcrumb p");
//   setTimeout(() => {
//     expect(p.text()).toBe("Data Flow Settings");
//   });
// });

// test("DataFlow Location Details available", () => {
//   const wrapper = mount(
//     <Provider store={store}>
//       <DataFlow />
//     </Provider>
//   );
//   const p = wrapper.find(".content #locationDetailTitile");
//   setTimeout(() => {
//     expect(p.text()).toBe("Location Details");
//   });
// });

// test("DataFlow Data Structure Dropdown", () => {
//   const wrapper = mount(
//     <Provider store={store}>
//       <DataFlow />
//     </Provider>
//   );
//   const p = wrapper.find("#dataStructure");
//   expect(p.find(ReduxFormSelect)).toHaveLength(1);
// });

// test("DataFlow Data Structure change simulate", () => {
//   const callback = jest.fn();
//   const props = {
//     value: "tabular",
//     onChange: callback,
//   };
//   const wrapper = mount(
//     <Provider store={store}>
//       <DataFlow {...props} />
//     </Provider>
//   );
//   const p = wrapper.find("#dataStructure");
//   const select = p.find(ReduxFormSelect);
//   expect(select.props().children[0].props.value).toEqual("tabular");
// });
