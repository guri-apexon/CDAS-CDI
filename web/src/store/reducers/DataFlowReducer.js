import produce from "immer";

export const initialState = {
  loading: false,
  description: "",
  dataStructure: "tabular",
  locationType: "sftp",
};

const DataFlowReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      default:
        newState.loading = false;
        break;
    }
  });

export default DataFlowReducer;
