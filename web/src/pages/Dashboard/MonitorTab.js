/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { neutral8 } from "apollo-react/colors";
import Hero from "apollo-react/components/Hero";
import DataVizCard from "apollo-react/components/DataVizCard";
import Grid from "apollo-react/components/Grid";
import Typography from "apollo-react/components/Typography";
import SegmentedControl from "apollo-react/components/SegmentedControl";
import SegmentedControlGroup from "apollo-react/components/SegmentedControlGroup";
import StatusExclamationIcon from "apollo-react-icons/StatusExclamation";
import StatusNegativeIcon from "apollo-react-icons/StatusNegative";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import InfoIcon from "apollo-react-icons/Info";
import Peek from "apollo-react/components/Peek";

import { ReactComponent as StaleIcon } from "../../components/Icons/Stale.svg";
import { ReactComponent as IssueIcon } from "../../components/Icons/Issue.svg";

import "./Dashboard.scss";

export default function MonitorTab() {
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const [control, setSegmentControl] = useState("all");
  const [summary] = useState({
    failed_loads: 0,
    quarantined_files: 0,
    files_exceeding: 0,
    fileswith_issues: 0,
    stale_datasets: 0,
  });
  const handlePeekOpen = (name, description) => {
    setOpen(true);
    setCurRow({ name, description });
  };
  const onSegmentChange = (value) => {
    setSegmentControl(value);
  };
  return (
    <div>
      <Hero>
        <div className="topContainer">
          <Typography
            variant="title1"
            style={{
              lineHeight: "32px",
              fontWeight: 600,
              display: "inline-flex",
            }}
            darkMode
          >
            Study Monitor Summary
          </Typography>
          <SegmentedControlGroup
            value={control}
            exclusive
            style={{ margin: "auto 20%" }}
            onChange={(event, value) => onSegmentChange(value)}
          >
            <SegmentedControl value="all">All</SegmentedControl>
            <SegmentedControl value="0">Production</SegmentedControl>
            <SegmentedControl value="1">Test</SegmentedControl>
          </SegmentedControlGroup>
        </div>
        <div className="dashboardSummary">
          <div className="dashInfo">
            <div className="dashCounter">
              <StatusExclamationIcon className="conter-icon" />
              <Typography variant="h1" darkMode>
                {summary.failed_loads}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Failed Loads
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Failed Loads",
                    "Files that did not load due to file/table issues"
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <StatusNegativeIcon className="conter-icon" />
              <Typography variant="h1" darkMode>
                {summary.quarantined_files}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Quarantined Files
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Quarantined Files",
                    "Files being processed for value level conformance rules assigned the action of 'reject'."
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <SwapVertIcon className="conter-icon" />
              <Typography variant="h1" darkMode>
                {summary.files_exceeding}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Files exceeding % change
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Files exceeding % change",
                    "Files in which the change in the number of records received exceeded the configured % row count decrease allowed"
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <IssueIcon className="conter-icon" style={{ fill: "#000000" }} />
              <Typography variant="h1" darkMode>
                {summary.fileswith_issues}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Files with Ingestion Issues
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Files with Ingestion Issues",
                    "Files that were successfully loaded, but validation issues were found"
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <StaleIcon className="conter-icon" />
              <Typography variant="h1" darkMode>
                {summary.stale_datasets}
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 5 }}>
                Stale Datasets
              </Typography>
              <InfoIcon
                onMouseOver={() =>
                  handlePeekOpen(
                    "Stale Datasets",
                    "Datasets for which a file has not been received within the specified number of days"
                  )
                }
                onMouseOut={() => setOpen(false)}
              />
            </div>
          </div>
          <Peek
            open={open}
            followCursor
            placement="bottom"
            content={
              <div style={{ maxWidth: 400 }}>
                <Typography
                  variant="title2"
                  gutterBottom
                  style={{ fontWeight: 600 }}
                >
                  {curRow.name}
                </Typography>
                <Typography variant="body2" style={{ color: neutral8 }}>
                  {curRow.description}
                </Typography>
              </div>
            }
          />
        </div>
      </Hero>
      <Grid
        container
        spacing={1}
        style={{ padding: "12px 5px 24px 5px", backgroundColor: "#f8f9fb" }}
      >
        <Grid item xs={12}>
          <DataVizCard title="Card Title" subtitle="Optional subtitle" />
        </Grid>
      </Grid>
    </div>
  );
}
