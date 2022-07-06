/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-script-url */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import Box from "apollo-react/components/Box";
import Paper from "apollo-react/components/Paper";
import Typography from "apollo-react/components/Typography/Typography";
import Panel from "apollo-react/components/Panel/Panel";
import Table from "apollo-react/components/Table/Table";
import Checkbox from "apollo-react/components/Checkbox/Checkbox";
import { compareNumbers } from "apollo-react/components/Table";
import "./index.scss";

const rows = [
  {
    issue_type: "Issue Type1",
    records_no: 10,
    checked: true,
  },
  {
    issue_type: "Issue Type2",
    records_no: 20,
    checked: true,
  },
  {
    issue_type: "Issue Type3",
    records_no: 30,
    checked: false,
  },
  {
    issue_type: "Issue Type4",
    records_no: 40,
    checked: false,
  },
];

const IssueLeftPanel = ({ closePanel, openPanel, width, opened }) => {
  const [selectedAll, setSelectedAll] = useState(false);
  const [tableRows, setTableRows] = useState(rows);
  const [open, setOpen] = useState(opened || true);
  const selectAll = (e, v) => {
    setSelectedAll(v);
    setTableRows((prevRows) => prevRows.map((x) => ({ ...x, checked: v })));
  };
  const selectRow = (val, row) => {
    setTableRows((prevRows) =>
      prevRows.map((x) =>
        x.issue_type === row.issue_type ? { ...x, checked: val } : x
      )
    );
  };
  const checkBoxCell = ({ row, column: { accessor: key } }) => {
    return (
      <>
        <Checkbox
          className="selectall-checkbox"
          checked={row.checked}
          onChange={(e, v) => selectRow(v, row)}
        />
        {row[key]}
      </>
    );
  };
  const columns = [
    {
      header: (
        <>
          <Checkbox
            className="selectall-checkbox"
            checked={selectedAll}
            onChange={selectAll}
          />
          Issue Type
        </>
      ),
      accessor: "issue_type",
      customCell: checkBoxCell,
    },
    {
      header: "# of records",
      accessor: "records_no",
      sortFunction: compareNumbers,
      width: 120,
      customCell: ({ row, column: { accessor: key } }) => {
        return <span className="record-number">{row[key]}</span>;
      },
    },
  ];
  useEffect(() => {
    if (tableRows.length) {
      setSelectedAll(tableRows.every((x) => x.checked));
    }
  }, [tableRows]);

  return (
    <Panel
      className="left-panel"
      onClose={(e) => {
        closePanel();
      }}
      onOpen={(v) => {
        openPanel();
      }}
      open={open}
      width={width || 446}
    >
      <Table
        title="Filter"
        subtitle="Ingestion Issue Types"
        columns={columns}
        rows={tableRows}
        rowId="issue_type"
        hidePagination
      />
    </Panel>
  );
};

export default IssueLeftPanel;
