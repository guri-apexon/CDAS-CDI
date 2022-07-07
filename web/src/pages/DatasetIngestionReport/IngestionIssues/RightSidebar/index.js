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
const IssueRightPanel = ({ closePanel, openPanel, width, opened }) => {
  const [selectedTab, setSelectedTab] = useState(1);
  useEffect(() => {}, []);

  return (
    <aside id="rightSidebar">
      <div className="header">
        <Typography variant="title1">Records 22</Typography>
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
          {[1, 2, 3, 4].map((issue) => {
            return (
              <Accordion defaultExpanded>
                <AccordionSummary className="issue-header">
                  <Typography>
                    Header
                    <span>2</span>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ul>
                    {[1, 2].map((err) => {
                      return (
                        <li key={err}>
                          <small>sex:</small>
                          <span>Female</span>
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
          {[1, 2, 3, 4].map((issue) => {
            return (
              <Accordion defaultExpanded>
                <AccordionSummary className="issue-header">
                  <Typography>
                    Header
                    <span>2</span>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ul>
                    {[1, 2].map((err) => {
                      return (
                        <li key={err}>
                          <span>sex:</span>
                          <span>Female</span>
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
