import React from "react";
import { mount } from "enzyme";
import CDTCreate from "./CDTCreate";

test("CDTCreate Table component renders", () => {
  const wrapper = mount(<CDTCreate />);
  expect(wrapper.exists(".cdt-create-wrapper")).toBe(true);
});
