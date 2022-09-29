import React, { useState, useEffect } from "react";
import Table from "apollo-react/components/Table/Table";
import Modal from "apollo-react/components/Modal/Modal";
import "./index.scss";

const PreviewColumns = ({ previewSQL }) => {
  const [modalOpen, setModalOpen] = useState(true);
  const [tableRows, setTableRows] = useState([]);
  useEffect(() => {
    if (previewSQL.length) {
      setTimeout(() => {
        setModalOpen(true);
        setTableRows([...previewSQL].splice(0, 10));
      }, 500);
    }
  }, [previewSQL]);

  if (!tableRows.length) {
    return false;
  }
  return (
    <Modal
      open={modalOpen}
      title="Sql Columns"
      onClose={() => setModalOpen(false)}
      message="No file with unblinded or unmasked data should be configured"
      buttonProps={[
        {
          label: "OK",
          variant: "primary",
          onClick: () => setModalOpen(false),
        },
      ]}
      id="previewSqlColumns"
    >
      <div className="preview-table">
        <Table
          col
          columns={
            tableRows.length &&
            Object.keys(tableRows[0]).map((e) => ({
              header: e,
              accessor: e,
            }))
          }
          rows={tableRows}
          hasScroll={true}
          columnSettings={{
            enabled: true,
            frozenColumnsEnabled: true,
          }}
          maxHeight="calc(100vh - 293px)"
          hidePagination
        />
      </div>
    </Modal>
  );
};

export default PreviewColumns;
