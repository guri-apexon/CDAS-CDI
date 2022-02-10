import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import MonitorTab from "./MonitorTab";

describe("MonitorTab", () => {
  let wrapper;
  beforeEach(() => {
    const middlewares = [];
    const mockFn = jest.fn();
    const mockStore = configureStore(middlewares);
    const initialState = {
      summaryLoading: false,
      ingestionData: {},
    };
    const store = mockStore({
      dashboard: initialState,
    });
    wrapper = mount(
      <Provider store={store}>
        <MonitorTab fetchLatestData={mockFn} />
      </Provider>
    );
  });

  // eslint-disable-next-line jest/expect-expect
  it("Rendering MonitorTab Component", () => {
    render(wrapper);
    wrapper.unmount();
  });

  test("Study Monitor Summary available", () => {
    // eslint-disable-next-line no-underscore-dangle
    const _h3 = wrapper.find("h3");
    setTimeout(() => {
      expect(_h3.text()).toBe("Study Monitor Summary");
      wrapper.unmount();
    });
  });

  test("Failed Loads count available", () => {
    // eslint-disable-next-line no-underscore-dangle
    const _h3 = wrapper.find("#failed_loads_count");
    setTimeout(() => {
      expect(_h3.text()).toBe("0");
      wrapper.unmount();
    });
  });

  test("Quarantined Files count available", () => {
    // eslint-disable-next-line no-underscore-dangle
    const _h3 = wrapper.find("#quarantined_files_count");
    setTimeout(() => {
      expect(_h3.text()).toBe("0");
      wrapper.unmount();
    });
  });

  test("Files exceeding % change count available", () => {
    // eslint-disable-next-line no-underscore-dangle
    const _h3 = wrapper.find("#files_exceeding_count");
    setTimeout(() => {
      expect(_h3.text()).toBe("0");
      wrapper.unmount();
    });
  });

  test("Files with Ingestion Issues count available", () => {
    // eslint-disable-next-line no-underscore-dangle
    const _h3 = wrapper.find("#fileswith_issues_count");
    setTimeout(() => {
      expect(_h3.text()).toBe("0");
      wrapper.unmount();
    });
  });

  test("Stale Datasets count available", () => {
    // eslint-disable-next-line no-underscore-dangle
    const _h3 = wrapper.find("#stale_datasets_count");
    setTimeout(() => {
      expect(_h3.text()).toBe("0");
      wrapper.unmount();
    });
  });

  it("check table available", () => {
    const table = wrapper.find("table");
    expect(table.exists()).toBeTruthy();
    wrapper.unmount();
  });

  it("check for Show inactive datasets in Header", () => {
    const { queryByText } = render(wrapper);
    expect(queryByText("Show inactive datasets")).toBeTruthy();
    wrapper.unmount();
  });

  it("check filter button clicked in table", () => {
    const filterBtn = wrapper.find("button#filterBtn");
    setTimeout(() => {
      expect(filterBtn.length).toEqual(1);
      filterBtn.simulate("click");
      expect(wrapper.find("input[[name='datasetname']").exists()).toBeTruthy();
      wrapper.unmount();
    });
  });
});
