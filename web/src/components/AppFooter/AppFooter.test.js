import React from "react";
import { mount } from "enzyme";
import AppFooter from "./AppFooter";

test("Rendering Nav Panel", () => {
  const wrapper = mount(<AppFooter />);
  expect(wrapper.exists(".app-footer")).toBe(true);
});
