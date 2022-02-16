import React from "react";
import { BrowserRouter } from "react-router-dom";
import { mount } from "enzyme";
import TopNavbar from "./TopNavbar";

test("Rendering TopNavbar", () => {
  const wrapper = mount(
    <BrowserRouter basename="/">
      <TopNavbar />
    </BrowserRouter>
  );
  expect(wrapper.exists("#topNavbar")).toBe(true);
});
