import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import AuditLog from "./AuditLog";

const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {
  data: [],
  loading: false,
  refreshData: false,
};
const store = mockStore({
  auditLogs: initialState,
  dashboard: {
    dashboardData: [],
    notOnBoardedStudyStatus: {},
    loading: false,
    exportStudy: null,
    selectedCard: {},
  },
});
jest.mock("react-router", () => ({
  useParams: jest.fn().mockReturnValue({ dataflowId: "a0A0E000004k7m3UAA" }),
  useHistory: jest.fn(),
}));
const wrapper = mount(
  <Provider store={store}>
    <AuditLog />
  </Provider>
);
test("AuditLogs component renders", () => {
  setTimeout(() => {
    expect(wrapper).toMatchSnapshot();
  });
});

// // test("Audit Logs Breadcrumbs available", () => {
// //   const p = wrapper.find(".breadcrumb p");
// //   setTimeout(() => {
// //     expect(p.text()).toBe("Audit Log");
// //   });
// // });

// // test("Audit Logs No Data available available", () => {
// //   const p = wrapper.find("table p");
// //   setTimeout(() => {
// //     expect(p.text()).toBe("No data to display");
// //   });
// // });

// // test("Audit Logs Header Exist", () => {
// //   expect(wrapper.find(".top-content").exists()).toBeTruthy();
// // });

// // test("Audit Logs Page Topar Exist", () => {
// //   expect(wrapper.find(".dataflow-header").exists()).toBeTruthy();
// // });

// // test("Audit Logs Save and Cancel Buttons Exist", () => {
// //   expect(
// //     wrapper
// //       .find("button span")
// //       .findWhere((x) => x.text() === "Cancel")
// //       .exists()
// //   ).toBeTruthy();
// //   // expect(wrapper.find(".top-content").exists()).toBeTruthy();
// });
