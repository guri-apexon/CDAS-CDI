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

const DatasetTable = ({
  rows,
  CustomHeader,
  sortColumn = "",
  sortOrder = "",
  fromAllMonitor = false,
}) => {
  const [columnsState, setColumns] = useState(moreColumnsWithFrozen);

  const dashboard = useSelector((state) => state.dashboard);
  const { prot_id: protId } = dashboard?.selectedCard;

  const history = useHistory();

  let { canEnabled: canReadIngestionIssues } = useStudyPermission(
    Categories.MENU,
    Features.CDI_INGESTION_ISSUES,
    protId
  );

  if (fromAllMonitor) {
    canReadIngestionIssues = true;
  }
  const mappedRows = rows.map((row) => ({
    ...row,
    dataflow_type: row.testdataflow === 0 ? "Production" : "Test",
    canReadIngestionIssues,
    history,
    fromAllMonitor: fromAllMonitor || false,
  }));

  return (
    <Table
      key="studyDatasets"
      title="Dataset Pipeline Summary"
      hasScroll={true}
      columns={columnsState}
      rows={mappedRows}
      defaultRowsPerPage={10}
      initialSortedColumn={sortColumn || "processstatus"}
      initialSortOrder={sortOrder || "asc"}
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
