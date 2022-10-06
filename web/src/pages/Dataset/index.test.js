import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { render, cleanup } from "@testing-library/react";
import Dataset from "./Dataset";
import { ReduxProvider, renderWithRouter } from "../../utils/testData";
import { MessageContext } from "../../components/Providers/MessageProvider";

afterEach(cleanup);
describe("Dataset", () => {
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
    dataFlow: { dataFlowdetail: {} },
    dashboard: { selectedCard: {}, selectedDataFlow: {} },
    dataPackage: { selectedDSDetails: {}, packagesList: [] },
    dataSets: { selectedDataset: {}, formDataSQL: {}, datasetColumns: [] },
  });
  it("Dataset component renders", () => {
    const { getByTestId } = renderWithRouter(
      <MessageContext.Provider value={{}}>
        <ReduxProvider reduxStore={store}>
          <Dataset />
        </ReduxProvider>
      </MessageContext.Provider>
    );
    expect(getByTestId("datasetcomponent")).toHaveTextContent("Dataset name");
  });
});
