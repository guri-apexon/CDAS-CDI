/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-script-url */
import React, { useState, useEffect } from "react";
import Close from "apollo-react-icons/Close";
import Typography from "apollo-react/components/Typography/Typography";
import "./index.scss";
import IconButton from "apollo-react/components/IconButton";
import ButtonGroup from "apollo-react/components/ButtonGroup/ButtonGroup";
import Accordion from "apollo-react/components/Accordion";
import AccordionDetails from "apollo-react/components/AccordionDetails";
import AccordionSummary from "apollo-react/components/AccordionSummary";

const ListHeader = ({ menu }) => {
  return (
    <div className="list-header">
      {menu.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
};
const IssueRightPanel = ({
  closePanel,
  openPanel,
  width,
  opened,
  rowDetails,
  selectedIssues,
}) => {
  const [selectedTab, setSelectedTab] = useState(1);
  const [columns, setColumns] = useState([]);
  const [rowFilters, setRowFilters] = useState([]);
  const [colFilters, setColFilters] = useState([]);
  const colFilter = (col) => colFilters.includes(col);
  const getColumnsIssue = (column) => {
    if (rowFilters?.length && column) {
      return rowFilters.filter(colFilter).map((x) => x.issue_type);
    }
    return [];
  };

  const subset = (source, keys) =>
    Object.keys(source)
      ?.filter((key) => keys.indexOf(key) !== -1)
      ?.reduce((result, key) => {
        result[key] = source[key];
        return result;
      }, {});

  useEffect(() => {
    const { _rowno, rowIndex, _error, ...rest } = rowDetails;
    setColumns(rest);
    if (_rowno) {
      const data = selectedIssues.filter((x) =>
        x.errorrownumbers.includes(_rowno)
      );
      setRowFilters(data);
      try {
        const attrs = selectedIssues?.map((r) => r.originalattributename); // get the attributes to be processed
        const errorSubset = subset(JSON.parse(_error), attrs); // remove unwanted keys
        const colsToFilter = Object.keys(errorSubset)
          .map((k) => errorSubset[k].map((e) => e?.split(":")[1]))
          .flat(); // create an array of columns to be shown
        setColFilters(colsToFilter);
      } catch (error) {
        setColFilters([]);
      }
    }
  }, [rowDetails]);

  return (
    <aside id="rightSidebar">
      <div className="header">
        <Typography variant="title1">
          Record&nbsp;
          {rowDetails._rowno}
        </Typography>
        <Typography variant="title">Record issues</Typography>
        <IconButton className="close" size="small">
          <Close onClick={closePanel} />
        </IconButton>
        <ButtonGroup
          className="tabs-btns"
          buttonProps={[
            {
              variant: selectedTab === 1 ? "primary" : "secondary",
              label: "Issues",
              size: "small",
              onClick: () => setSelectedTab(1),
            },
            {
              variant: selectedTab === 2 ? "primary" : "secondary",
              label: "Columns",
              size: "small",
              onClick: () => setSelectedTab(2),
            },
          ]}
        />
      </div>
      {selectedTab === 1 && (
        <div className="issues-list">
          <ListHeader menu={["Issue name", "Columns with issues"]} />
          {rowFilters.map((issue, i) => {
            return (
              <Accordion defaultExpanded={i === 0}>
                <AccordionSummary className="issue-header">
                  <Typography>
                    {issue.issue_type}
                    <span>
                      {issue.errorcolumnnames?.filter(colFilter).length}
                    </span>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ul>
                    {issue.errorcolumnnames?.filter(colFilter).map((col) => {
                      return (
                        <li key={col}>
                          <small>{`${col}:`}</small>
                          <span>{columns[col]}</span>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      )}
      {selectedTab === 2 && (
        <div className="columns-list">
          <ListHeader menu={["Column name", "Issues"]} />
          {columns &&
            Object.keys(columns)
              .filter(colFilter)
              .map((col, i) => {
                const columnIssues = getColumnsIssue(col);
                return (
                  <Accordion defaultExpanded={i === 0}>
                    <AccordionSummary className="issue-header">
                      <Typography>
                        {col}
                        <span>{columnIssues.length}</span>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ul>
                        <li>
                          <span>Value:&nbsp;</span>
                          <span>{columns[col]}</span>
                        </li>
                        {columnIssues.map((err) => {
                          return (
                            <li key={err}>
                              <span>{err}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
        </div>
      )}
    </aside>
  );
};

export default IssueRightPanel;
