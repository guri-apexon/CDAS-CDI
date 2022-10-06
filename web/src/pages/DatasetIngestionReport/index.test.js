import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { render, cleanup } from "@testing-library/react";
import TransferLog from "./transferLog";
import { ReduxProvider, renderWithRouter } from "../../utils/testData";
import Properties from "./properties";

afterEach(cleanup);
describe("TransferLog", () => {
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
    ingestionReports: { transferHistory: {} },
    dashboard: { selectedCard: {} },
  });
  it("Transfer Log component renders", () => {
    const { getByTestId } = renderWithRouter(
      <UserContext.Provider value={{}}>
        <ReduxProvider reduxStore={store}>
          <TransferLog />
        </ReduxProvider>
      </UserContext.Provider>
    );
    expect(getByTestId("transferlog")).toHaveTextContent("File Transfer Log");
  });
  it("Transfer Log Properties component renders", () => {
    const { getByTestId } = renderWithRouter(
      <ReduxProvider reduxStore={store}>
        <Properties datasetProperties={{}} />
      </ReduxProvider>
    );
    expect(getByTestId("trasferlogprop")).toHaveTextContent(
      "View dataset settings"
    );
  });
});
