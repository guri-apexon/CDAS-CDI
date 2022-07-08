import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import Table from "apollo-react/components/Table";

import { moreColumnsWithFrozen } from "./columns.data";

import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../../components/Common/usePermission";

const DatasetTable = ({ rows, CustomHeader }) => {
  const [columnsState, setColumns] = useState(moreColumnsWithFrozen);

  const dashboard = useSelector((state) => state.dashboard);
  const { prot_id: protId } = dashboard?.selectedCard;

  const history = useHistory();

  const { canEnabled: canReadIngestionIssues } = useStudyPermission(
    Categories.MENU,
    Features.CDI_INGESTION_ISSUES,
    protId
  );

  return (
    <Table
      key="studyDatasets"
      title="Dataset Pipeline Summary"
      // subtitle={
      //   <div style={{ position: "relative" }}>
      //     <DatasetsIcon
      //       style={{
      //         position: "relative",
      //         top: 2,
      //         marginRight: 5,
      //         width: "14px",
      //         height: "14px",
      //       }}
      //     />
      //     {`${totalCount} datasets`}
      //   </div>
      // }
      columns={columnsState}
      rows={rows.map((row) => ({
        ...row,
        canReadIngestionIssues,
        history,
      }))}
      defaultRowsPerPage={10}
      // initialSortedColumn="datasetname"
      rowsPerPageOptions={[10, 50, 100, "All"]}
      tablePaginationProps={{
        labelDisplayedRows: ({ from, to, count }) =>
          `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
        truncate: true,
      }}
      CustomHeader={(props) => <CustomHeader {...props} />}
      columnSettings={{
        enabled: true,
        onChange: (columns) => {
          //   setHasUpdated(true);
          setColumns(columns);
        },
        defaultColumns: moreColumnsWithFrozen,
        frozenColumnsEnabled: true,
      }}
    />
  );
};

export default DatasetTable;