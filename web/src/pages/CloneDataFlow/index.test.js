import React from "react";
import { mount } from "enzyme";
import CloneDataFlow from "./index";

test("CloneDataFlow component renders", () => {
  const wrapper = mount(<CloneDataFlow />);
  expect(wrapper.exists(<table />)).toBe(true);
});
