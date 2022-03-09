import React, { useEffect, useState } from "react";
import Modal from "apollo-react/components/Modal";
import Table, {
  compareStrings,
  compareNumbers,
} from "apollo-react/components/Table";

const IngestionIssuesModal = ({ open, handleClose, issuetypes }) => {
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState("");
  const columns = [
    {
      header: "Ingestion Issue Type",
      sortFunction: compareStrings,
      accessor: "issue_type",
    },
    {
      header: "Total # of Issues",
      sortFunction: compareNumbers,
      accessor: "no_issues",
    },
  ];
  // console.log(issuetypes, "issuetypes");

  useEffect(() => {
    if (issuetypes) {
      const records = issuetypes?.records?.map((rec) => ({
        ...rec,
        issue_type:
          rec?.incremental?.toLowerCase() === "y"
            ? rec.incrementalIssueType
            : rec.cumIngestionIssueType,
        no_issues:
          rec?.incremental?.toLowerCase() === "y"
            ? rec.incrementalTotalIssues
            : rec.cumTotalNoOfIssuess,
      }));
      setRows(records);
      setTotalCount(issuetypes.totalSize);
    }
  }, [issuetypes]);

  return (
    <div>
      <Modal
        open={open}
        onClose={() => handleClose()}
        title="Types of Ingestion Issues"
        subtitle={`${totalCount} Ingestion Issue Types`}
        style={{ minWidth: 440 }}
        buttonProps={[
          { label: "Close", onClick: handleClose, variant: "primary" },
        ]}
        className="ingestionissueModal"
        id="neutral"
      >
        <Table
          columns={columns}
          rows={rows}
          rowId="issue_type"
          initialSortedColumn="no_issues"
          initialSortOrder="asc"
          hidePagination
        />
      </Modal>
    </div>
  );
};

export default IngestionIssuesModal;
