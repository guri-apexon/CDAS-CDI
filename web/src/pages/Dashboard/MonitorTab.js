/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import Hero from "apollo-react/components/Hero";
import DataVizCard from "apollo-react/components/DataVizCard";
import Grid from "apollo-react/components/Grid";
import Typography from "apollo-react/components/Typography";
import SegmentedControl from "apollo-react/components/SegmentedControl";
import SegmentedControlGroup from "apollo-react/components/SegmentedControlGroup";
import StatusExclamationIcon from "apollo-react-icons/StatusExclamation";
import InfoIcon from "apollo-react-icons/Info";
import Peek from "apollo-react/components/Peek";

import "./Dashboard.scss";

export default function MonitorTab() {
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
            value="all"
            exclusive
            style={{ margin: "auto 20%" }}
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
                2
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 8 }}>
                Failed Loads
              </Typography>
              <InfoIcon />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <StatusExclamationIcon className="conter-icon" />
              <Typography variant="h1" darkMode>
                2
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 8 }}>
                Failed Loads
              </Typography>
              <InfoIcon />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <StatusExclamationIcon className="conter-icon" />
              <Typography variant="h1" darkMode>
                2
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 8 }}>
                Failed Loads
              </Typography>
              <InfoIcon />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <StatusExclamationIcon className="conter-icon" />
              <Typography variant="h1" darkMode>
                2
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 8 }}>
                Failed Loads
              </Typography>
              <InfoIcon />
            </div>
          </div>
          <div className="dashInfo">
            <div className="dashCounter">
              <StatusExclamationIcon className="conter-icon" />
              <Typography variant="h1" darkMode>
                2
              </Typography>
            </div>
            <div className="dashInfoLabel">
              <Typography darkMode style={{ marginRight: 8 }}>
                Failed Loads
              </Typography>
              <InfoIcon />
            </div>
          </div>
          {/* <Peek
            variant="dark"
            placement="bottom"
            open
            style={{ marginRight: 48 }}
            content={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <Typography variant="caption" darkMode>
                asdfasdfsadf asdfsadkfljsakjflsakjlfksldfk
              </Typography>
            }
          /> */}
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
