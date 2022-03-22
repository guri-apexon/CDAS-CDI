import { createContext, useEffect, useMemo, useState } from "react";

export const DataflowContext = createContext();

const DataflowContextProvider = ({ children }) => {
  // the value that will be given to the context
  const [datasetSubmit, setDatasetSubmit] = useState(false);
  const contextValue = useMemo(
    () => ({ datasetSubmit, setDatasetSubmit }),
    [datasetSubmit, setDatasetSubmit]
  );
  useEffect(() => {
    console.log("datasetSubmit", datasetSubmit);
  }, [datasetSubmit]);

  return (
    <DataflowContext.Provider value={contextValue}>
      {children}
    </DataflowContext.Provider>
  );
};

export default DataflowContextProvider;
