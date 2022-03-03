/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React from "react";
import Hero from "apollo-react/components/Hero";
import Grid from "apollo-react/components/Grid";
import DataVizCard from "apollo-react/components/DataVizCard";
import DonutChart from "apollo-react/components/DonutChart";
import BarChart from "apollo-react/components/BarChart";
import Typography from "apollo-react/components/Typography";
import Link from "apollo-react/components/Link";
import Divider from "apollo-react/components/Divider";

const Metrics = () => {
  const data = [
    { type: "New Records", yield: 1000 },
    { type: "Modified Records", yield: 500 },
  ];
  return (
    <div className="ingestion-report-metrics">
      <Hero
        title="File transfer summary"
        subtitle="When there is no data to display"
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
            <DonutChart
              percent={50}
              stroke="#fff"
              subtitle="Records with Issues"
            />
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
          <div className="barchart-records">
            <Typography variant="body2" style={{ marginBottom: 20 }} darkMode>
              Number of Records Changed by status from Previous Transfer
            </Typography>
            <BarChart suffix="%" data={data} width={350} height={250} />
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
            title="Card Title"
            href="javascript:void(0);"
            subtitle="Optional subtitle"
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Metrics;
