import React from "react";
import { mount } from "enzyme";
import CDTList from "./CDTList";

test("CDTList Table component renders", () => {
  const wrapper = mount(<CDTList />);
  expect(wrapper.exists(<table />)).toBe(true);
});
