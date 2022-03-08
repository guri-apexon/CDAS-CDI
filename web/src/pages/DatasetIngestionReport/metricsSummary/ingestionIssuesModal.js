import React from "react";
import Modal from "apollo-react/components/Modal";
import Table, {
  compareStrings,
  compareNumbers,
} from "apollo-react/components/Table";

const IngestionIssuesModal = ({ open, handleClose }) => {
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
  const rows = [
    {
      issue_type: "LOV issues",
      no_issues: 14,
    },
    {
      issue_type: "LOV issues",
      no_issues: 14,
    },
  ];
  return (
    <div>
      <Modal
        open={open}
        onClose={() => handleClose()}
        title="Types of Ingestion Issues"
        subtitle="10 Ingestion Issue Types"
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
