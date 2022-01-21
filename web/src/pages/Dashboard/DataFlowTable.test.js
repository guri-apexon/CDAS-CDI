import { render, getByText } from "@testing-library/react";
import DataFlowTable from "./DataFlowTable";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";


describe('DataFlowTable',()=>{
    let wrapper;
    beforeEach(() => {
        const middlewares = [];
        const mockStore = configureStore(middlewares);
        const initialState = {
            flowData: [],
            loading: false,
            refreshData: false,
        };
        const store = mockStore({
            dashboard: initialState
        });
        wrapper = mount(
            <Provider store={store}>
              <DataFlowTable />
            </Provider>
          );
      });
      
    it("Rendering DataFlowTable Component", () => {
        render(wrapper);
        wrapper.unmount();
        });
    
    test("No Data Flows Data available", () => {
        const _h3 = wrapper.find("table h3");
        setTimeout(()=>{
            expect(_h3.text()).toBe("No Data Flows");
            wrapper.unmount();
        })
    });

    it('check for add dataflow button in Header',()=>{
        const { queryByText } = render(wrapper);
        expect(queryByText('Add data flow')).toBeTruthy()
        wrapper.unmount();
    })

    it('to display count of dataflows of a study',()=>{
        expect(wrapper.text().includes('Data Flow' | 'Data Flows')).toBeTruthy()
        wrapper.unmount();
    })

})