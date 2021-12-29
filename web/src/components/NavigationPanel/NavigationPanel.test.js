import React from "react";
import { BrowserRouter } from "react-router-dom";
import { mount } from "enzyme";
import NavigationPanel from "./NavigationPanel";

test("Rendering Nav Panel", () => {
  const wrapper = mount(
    <BrowserRouter basename="/">
      <NavigationPanel />
    </BrowserRouter>
  );
  expect(wrapper.exists(".navigation-panel")).toBe(true);
});
