/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React from "react";
import Hero from "apollo-react/components/Hero";
import Grid from "apollo-react/components/Grid";
import DataVizCard from "apollo-react/components/DataVizCard";
import DonutChartV2 from "apollo-react/components/DonutChartV2";
import BarChart from "apollo-react/components/BarChart";
import BulletChart from "apollo-react/components/BulletChart";
import Typography from "apollo-react/components/Typography";
import Link from "apollo-react/components/Link";
import Divider from "apollo-react/components/Divider";

const Metrics = ({ datasetProperties }) => {
  const data = [
    { type: "New Records", a: 25 },
    { type: "Modified Records", a: 15 },
  ];
  const historyData = [
    { filename: "File Name1", yield: [200, 400, 600] },
    { filename: "File Name2", yield: [300, 100, 500] },
    { filename: "File Name3", yield: [200, 300, 400] },
    { filename: "File Name4", yield: [150, 250, 500] },
    { filename: "File Name5", yield: [300, 200, 100] },
  ];

  const legendLabels = ["New", "Modified", "Unchanged"];

  return (
    <div className="ingestion-report-metrics">
      <Hero
        title={
          <Typography variant="title1" darkMode style={{ marginTop: "auto" }}>
            File transfer summary
          </Typography>
        }
        subtitle={
          <>
            <Typography darkMode>When there is no data to display</Typography>
            <Typography variant="body2" darkMode>
              12-Apr-2021 / 3:00 pm
            </Typography>
          </>
        }
        className="file-transfer-kpi"
      >
        <div className="summary-body">
          <div className="post-ingestion-issues">
            <Typography variant="h2" gutterBottom darkMode>
              2200
            </Typography>
            <Typography gutterBottom darkMode style={{ marginBottom: 32 }}>
              Post Ingestion Issues
            </Typography>
            <Link
              onClick={() => console.log("link clicked")}
              style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}
            >
              View issue types
            </Link>
            <Divider type="axis" className="divider-dotted" />
          </div>
          <div className="records-with-issues">
            <DonutChartV2
              className="records-with-issue-chart"
              percent={50}
              stroke="#fff"
              width={162}
              height={168}
              style={{ width: 162, height: 168, paddingTop: 0 }}
              subtitle={
                <>
                  <Typography
                    gutterBottom
                    darkMode
                    style={{
                      marginBottom: 2,
                      fontSize: 34,
                      fontWeight: 600,
                      lineHeight: "56px",
                      position: "relative",
                      top: 35,
                    }}
                  >
                    1000
                  </Typography>
                  <Typography
                    gutterBottom
                    darkMode
                    style={{
                      marginBottom: 2,
                      fontSize: 16,
                      lineHeight: "18px",
                      position: "relative",
                      top: 28,
                      right: "-32px",
                      width: 97,
                    }}
                  >
                    Records with Issues
                  </Typography>
                </>
              }
            />
            <div className="right-se">
              <Typography gutterBottom darkMode style={{ marginBottom: 14 }}>
                2,000 Total Records
              </Typography>
              <Link
                onClick={() => console.log("link clicked")}
                style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}
              >
                View issues in file
              </Link>
              <Divider type="axis" className="divider-dotted" />
            </div>
          </div>
          <div className="barchart-records">
            <Typography
              variant="body2"
              style={{ marginBottom: 20, width: 246 }}
              darkMode
            >
              Number of Records Changed by status from Previous Transfer
            </Typography>
            <BarChart suffix="%" data={data} width={308} height={250} />
          </div>
        </div>
      </Hero>
      <Grid
        container
        spacing={3}
        style={{ padding: "12px 24px 24px 24px", backgroundColor: "#f8f9fb" }}
      >
        <Grid item xs={12}>
          <DataVizCard
            title="File Transfer History"
            subtitle="500 total files transfered"
          >
            <BulletChart data={historyData} legendLabels={legendLabels} />
          </DataVizCard>
        </Grid>
      </Grid>
    </div>
  );
};

export default Metrics;
