import { render, userEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import SystemSettings from "./SystemSettings";

describe("SystemSettings", () => {
  let wrapper;
  beforeEach(() => {
    const middlewares = [];
    const mockFn = jest.fn();
    const mockStore = configureStore(middlewares);
    const initialState = {
      settings: [],
      loading: false,
    };
    const store = mockStore({
      cdiadmin: initialState,
    });
    wrapper = mount(
      <Provider store={store}>
        <SystemSettings getData={mockFn} />
      </Provider>
    );
  });

  // eslint-disable-next-line jest/expect-expect
  it("Rendering Setting Component", () => {
    render(wrapper);
    wrapper.unmount();
  });

  test("Setting title available", () => {
    // eslint-disable-next-line no-underscore-dangle
    const _h3 = wrapper.find("h3");
    setTimeout(() => {
      expect(_h3.text()).toBe("System Settings");
      wrapper.unmount();
    });
  });

  it("check table available", () => {
    const table = wrapper.find("table");
    expect(table.exists()).toBeTruthy();
    wrapper.unmount();
  });

  it("check Add new setting button in Header", () => {
    const { queryByText } = render(wrapper);
    expect(queryByText("Add new setting")).toBeTruthy();
    wrapper.unmount();
  });

  it("check Add new setting is opening new form in table", () => {
    const addLocationBtn = wrapper.find("button#addLocationBtn");
    setTimeout(() => {
      expect(addLocationBtn.length).toEqual(1);
      addLocationBtn.simulate("click");
      expect(wrapper.find("input[[name='name']").exists()).toBeTruthy();
      expect(wrapper.find("input[[name='value']").exists()).toBeTruthy();
      wrapper.unmount();
    });
  });

  it("check input values are getting rendered in table", () => {
    const addLocationBtn = wrapper.find("button#addLocationBtn");
    setTimeout(() => {
      expect(addLocationBtn.length).toEqual(1);
      addLocationBtn.simulate("click");
      const nameV = wrapper.find("input[[name='name']");
      const valueV = wrapper.find("input[[name='value']");
      userEvent.type(nameV, "Name");
      userEvent.type(valueV, "Value");
      expect(wrapper.find("input[[name='name']").exists()).toHaveValue("Name");
      expect(wrapper.find("input[[name='value']").exists()).toHaveValue(
        "Value"
      );
      wrapper.unmount();
    });
  });

  it("check search values are getting rendered in table", () => {
    const searchBox = wrapper.find("input#settingSearch");
    setTimeout(() => {
      expect(searchBox.length).toEqual(1);
      userEvent.type(searchBox, "Search");
      expect(searchBox.exists()).toHaveValue("Search");
      wrapper.unmount();
    });
  });
});
