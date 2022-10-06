import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { render, cleanup } from "@testing-library/react";
import ColumnsTab from "./ColumnsTab";
import { ReduxProvider, renderWithRouter } from "../../../utils/testData";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import DSColumnTable from "./DSColumnTable";

afterEach(cleanup);
describe("ColumnsTab", () => {
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
    dataSets: {
      selectedDataset: {},
      formDataSQL: {},
      datasetColumns: [],
      sqlColumns: [],
    },
  });
  it("Dataset columns component renders", () => {
    const { getByTestId } = renderWithRouter(
      <MessageContext.Provider value={{ showErrorMessage: jest.fn() }}>
        <ReduxProvider reduxStore={store}>
          <ColumnsTab setDatasetColumnsExist={jest.fn()} />
        </ReduxProvider>
      </MessageContext.Provider>
    );
    expect(getByTestId("columnscomponent")).toHaveTextContent(
      "Dataset Column Settings"
    );
  });
  it("Dataset columns table component renders", () => {
    const { getByTestId } = renderWithRouter(
      <MessageContext.Provider value={{ showErrorMessage: jest.fn() }}>
        <ReduxProvider reduxStore={store}>
          <DSColumnTable
            formattedData={[]}
            setDatasetColumnsExist={jest.fn()}
          />
        </ReduxProvider>
      </MessageContext.Provider>
    );
    expect(getByTestId("dscolumnstable")).toHaveTextContent(
      "Dataset Column Settings"
    );
  });
});
