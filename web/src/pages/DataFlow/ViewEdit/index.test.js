import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { render, cleanup } from "@testing-library/react";
import DataFlow from "./index";
import { ReduxProvider, renderWithRouter } from "../../../utils/testData";
import { MessageContext } from "../../../components/Providers/MessageProvider";

afterEach(cleanup);
describe("Edit Dataflow", () => {
  const realLocation = window.location;

  beforeAll(() => {
    delete window.location;
    window.location = { assign: jest.fn(), reload: jest.fn() };
  });

  afterAll(() => {
    window.location = realLocation;
  });

  const mockStore = configureStore();
  const store = mockStore({
    dataFlow: { dataFlowdetail: {}, dataFlowData: { selectedLocation: {} } },
    dashboard: { selectedCard: {}, selectedDataFlow: {} },
    dataPackage: { selectedDSDetails: {}, packagesList: [] },
    dataSets: { selectedDataset: {}, formDataSQL: {}, datasetColumns: [] },
  });
  it("Edit Dataflow component renders", () => {
    const { getByTestId } = renderWithRouter(
      <MessageContext.Provider value={{}}>
        <ReduxProvider reduxStore={store}>
          <DataFlow />
        </ReduxProvider>
      </MessageContext.Provider>
    );
    expect(getByTestId("viewedittestid")).toBeTruthy();
  });
});
