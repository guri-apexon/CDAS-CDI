import React from "react";
import { mount } from "enzyme";
import VLCTab from "./VLCTab";

test("VLCTab Table component renders count", () => {
  const wrapper = mount(<VLCTab />);
  expect(wrapper.exists(<table />)).toBe(true);
});
