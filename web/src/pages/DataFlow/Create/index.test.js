import React from "react";
import { mount } from "enzyme";
import DataFlow from "./index";

test("Create DataFlow component renders", () => {
  const wrapper = mount(<DataFlow />);
  expect(wrapper.exists(<table />)).toBe(true);
});
