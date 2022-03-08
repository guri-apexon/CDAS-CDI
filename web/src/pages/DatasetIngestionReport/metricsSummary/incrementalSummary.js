/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import DonutChartV2 from "apollo-react/components/DonutChartV2";
import Typography from "apollo-react/components/Typography";
import Link from "apollo-react/components/Link";
import Divider from "apollo-react/components/Divider";

const IncrementalSummary = ({ datasetProperties, setModalOpen }) => {
  return (
    <div className="summary-body" style={{ marginTop: 40 }}>
      <div className="post-ingestion-issues">
        <Typography variant="h2" gutterBottom darkMode>
          2200
        </Typography>
        <Typography gutterBottom darkMode style={{ marginBottom: 32 }}>
          Post Ingestion Issues
        </Typography>
        <Link
          onClick={() => setModalOpen(true)}
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
            View ingestion issue report
          </Link>
          <Divider
            type="axis"
            style={{ width: 178 }}
            className="divider-dotted"
          />
        </div>
      </div>
      <div className="post-ingestion-issues">
        <Typography variant="h2" gutterBottom darkMode>
          10
        </Typography>
        <Typography gutterBottom darkMode style={{ marginBottom: 32 }}>
          Files not ingested
        </Typography>
        <Link
          onClick={() => console.log("link clicked")}
          style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}
        >
          View files with fatal issues
        </Link>
        <Divider
          type="axis"
          style={{ width: 172 }}
          className="divider-dotted"
        />
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
                25
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
                Files with Issues
              </Typography>
            </>
          }
        />
        <div className="right-se">
          <Typography gutterBottom darkMode style={{ marginBottom: 14 }}>
            50 Total files ingested
          </Typography>
          <Link
            onClick={() => console.log("link clicked")}
            style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}
          >
            View files with issues
          </Link>
          <Divider
            type="axis"
            style={{ width: 140 }}
            className="divider-dotted"
          />
        </div>
      </div>
    </div>
  );
};
export default IncrementalSummary;
