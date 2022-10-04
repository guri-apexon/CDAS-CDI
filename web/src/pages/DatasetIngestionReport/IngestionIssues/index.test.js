import React from "react";
import { mount } from "enzyme";
import "@testing-library/jest-dom";
import configureStore from "redux-mock-store";
import { render, cleanup } from "@testing-library/react";
import IngestionIssues from "./index";
import IssueLeftPanel from "./LeftSidebar";
import IssueRightPanel from "./RightSidebar";
import { AppContext } from "../../../components/Providers/AppProvider";
import { ReduxProvider, renderWithRouter } from "../../../utils/testData";

afterEach(cleanup);

describe("IngestionIssue", () => {
  const realLocation = window.location;

  beforeAll(() => {
    delete window.location;
    window.location = { assign: jest.fn(), reload: jest.fn() };
  });

  afterAll(() => {
    window.location = realLocation;
  });

  const mockStore = configureStore();
  const UserContext = React.createContext();
  const store = mockStore({
    ingestionReports: { datasetProperties: {} },
    dashboard: { selectedCard: {} },
  });
  it("Ingestion Issues component renders", () => {
    const { getByTestId } = renderWithRouter(
      <UserContext.Provider value={{}}>
        <ReduxProvider reduxStore={store}>
          <IngestionIssues />
        </ReduxProvider>
      </UserContext.Provider>
    );
    expect(getByTestId("ingestionissues")).toHaveTextContent(
      "File Ingestion Issues"
    );
  });
  it("left Sidebar Ingestion Issues component renders", () => {
    const wrapper = mount(<IssueLeftPanel />);
    expect(wrapper.exists(".left-panel")).toBe(true);
  });
  it("Right Sidebar Ingestion Issues component renders", () => {
    const wrapper = mount(<IssueRightPanel />);
    expect(wrapper.exists("#rightSidebar")).toBe(true);
  });
});
