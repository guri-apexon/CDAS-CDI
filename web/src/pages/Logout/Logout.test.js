import React from "react";
import { mount } from "enzyme";
import Logout from "./Logout";

test("Rendering Progress bar component", () => {
  const wrapper = mount(<Logout />);
  expect(wrapper.exists(".wrapper")).toBe(true);
});
