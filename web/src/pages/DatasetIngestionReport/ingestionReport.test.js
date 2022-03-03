import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import Router from "react-router-dom";
import DatasetIngestionReport from "./index";

const middlewares = [];
const mockFn = jest.fn();
const mockStore = configureStore(middlewares);
const initialState = {
  loading: false,
  transferLogs: [],
  datasetProperties: {},
};
const store = mockStore({
  ingestionReports: initialState,
});
jest.mock("react-router", () => ({
  useParams: jest.fn().mockReturnValue({ datasetId: "a070E00000FhoKXQAZ" }),
  useHistory: jest.fn(),
}));
const wrap = mount(
  <Provider store={store}>
    <DatasetIngestionReport getData={mockFn} />
  </Provider>
);

const createWrapper = () => {
  return render(wrap);
};

describe("DatasetIngestionReport", () => {
  // eslint-disable-next-line jest/expect-expect
  it("Rendering DatasetIngestionReport Component", () => {
    setTimeout(() => {
      jest
        .spyOn(Router, "useParams")
        .mockReturnValue({ datasetId: "a070E00000FhoKXQAZ" });
      const wrapper = createWrapper();
      expect(wrapper).toMatchSnapshot();
      wrapper.unmount();
    });
  });

  test("Dataset Ingestion Report title available", () => {
    // eslint-disable-next-line no-underscore-dangle
    jest
      .spyOn(Router, "useParams")
      .mockReturnValue({ datasetId: "a070E00000FhoKXQAZ" });
    const h3 = wrap.find("p#ingestion-report-title");
    expect(h3.text()).toBe("Dataset Ingestion Report");
    wrap.unmount();
  });

  test("Metrics Tabs available available", () => {
    // eslint-disable-next-line no-underscore-dangle
    const buttonmetrics = wrap.find("#report-metrics span");
    const buttontransferlog = wrap.find("button#report-transferlog span");
    const buttonproperties = wrap.find("button#report-properties span");
    setTimeout(() => {
      expect(buttonmetrics.text()).toBe("Metrics");
      expect(buttontransferlog.text()).toBe("Transfer Log");
      expect(buttonproperties.text()).toBe("Properties");
      wrap.unmount();
    });
  });

  it("check properties tab clicked", () => {
    const filterBtn = wrap.find("button#report-properties");
    expect(filterBtn.length).toEqual(1);
    filterBtn.simulate("click");
    expect(wrap.find("h3").text()).toBe("Dataset Properties");
    wrap.unmount();
  });

  //   it("check table available", () => {
  //     const table = wrapper.find("table");
  //     expect(table.exists()).toBeTruthy();
  //     wrapper.unmount();
  //   });

  //   it("check Add Location button in Header", () => {
  //     const { queryByText } = render(wrapper);
  //     expect(queryByText("Add Location")).toBeTruthy();
  //     wrapper.unmount();
  //   });

  //   it("check filter button clicked in table", () => {
  //     const filterBtn = wrapper.find("button#filterBtn");
  //     setTimeout(() => {
  //       expect(filterBtn.length).toEqual(1);
  //       filterBtn.simulate("click");
  //       expect(wrapper.find("input[[name='datasetname']").exists()).toBeTruthy();
  //       wrapper.unmount();
  //     });
});
