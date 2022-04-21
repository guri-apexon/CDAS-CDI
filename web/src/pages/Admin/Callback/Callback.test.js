import React from "react";
import { mount } from "enzyme";
import Callback from "./Callback";

test("Callback Table component renders", () => {
  const wrapper = mount(<Callback />);
  expect(wrapper.exists(<table />)).toBe(true);
});
