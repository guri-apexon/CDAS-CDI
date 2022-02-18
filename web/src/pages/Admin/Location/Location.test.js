import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import Location from "./Location";

describe("Location", () => {
  let wrapper;
  beforeEach(() => {
    const middlewares = [];
    const mockFn = jest.fn();
    const mockStore = configureStore(middlewares);
    const initialState = {
      locations: [],
      loading: false,
    };
    const datafflowState = {
      createTriggered: false,
    };
    const store = mockStore({
      locations: initialState,
      dataFlow: datafflowState,
    });
    wrapper = mount(
      <Provider store={store}>
        <Location getData={mockFn} />
      </Provider>
    );
  });

  // eslint-disable-next-line jest/expect-expect
  it("Rendering Location Component", () => {
    render(wrapper);
    wrapper.unmount();
  });

  test("Locations title available", () => {
    // eslint-disable-next-line no-underscore-dangle
    const _h3 = wrapper.find("h3");
    setTimeout(() => {
      expect(_h3.text()).toBe("Locations");
      wrapper.unmount();
    });
  });

  it("check table available", () => {
    const table = wrapper.find("table");
    expect(table.exists()).toBeTruthy();
    wrapper.unmount();
  });

  it("check Add Location button in Header", () => {
    const { queryByText } = render(wrapper);
    expect(queryByText("Add Location")).toBeTruthy();
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
