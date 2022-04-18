/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import DonutChartV2 from "apollo-react/components/DonutChartV2";
import Typography from "apollo-react/components/Typography";
import Link from "apollo-react/components/Link";
import Divider from "apollo-react/components/Divider";

const IncrementalSummary = ({
  datasetProperties,
  setModalOpen,
  handleChangeTab,
}) => {
  const postIngestionIssues = datasetProperties?.postIngestionIssues || 0;
  const recordsWithIssues = datasetProperties?.recordsWithIssues || 0;
  const totalRecords = datasetProperties?.totalRecords || 0;
  const recordsWithIssuesPer =
    totalRecords > 0 ? (recordsWithIssues * 100) / totalRecords : 0;
  const filesWithIssues = datasetProperties?.filesWithIssues || 0;
  const totalFileIngested = datasetProperties?.totalFileIngested || 0;
  const filesWithIssuesPer =
    totalFileIngested > 0 ? (filesWithIssues * 100) / totalFileIngested : 0;
  return (
    <div className="summary-body" style={{ marginTop: 28 }}>
      <div className="post-ingestion-issues">
        <Typography variant="h2" gutterBottom darkMode>
          {postIngestionIssues}
        </Typography>
        <Typography
          gutterBottom
          darkMode
          style={{ marginBottom: 24, fontWeight: 300 }}
        >
          Post Ingestion Issues
        </Typography>
        <Link
          onClick={() => setModalOpen(true)}
          style={{ color: "#fff", fontSize: 14, fontWeight: 400 }}
        >
          View issue types
        </Link>
        <Divider type="axis" className="divider-dotted" />
      </div>
      <div className="records-with-issues">
        <DonutChartV2
          className="records-with-issue-chart"
          percent={recordsWithIssuesPer}
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
                {recordsWithIssues}
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
                  fontWeight: 300,
                }}
              >
                Records with Issues
              </Typography>
            </>
          }
        />
        <div className="post-ingestion-issues">
          <Typography variant="h2" gutterBottom darkMode>
            {totalRecords}
          </Typography>
          <Typography
            gutterBottom
            darkMode
            style={{ marginBottom: 32, fontWeight: 300 }}
          >
            Total Records
          </Typography>

          <Link
            onClick={() => console.log("link clicked")}
            style={{ color: "#fff", fontSize: 14, fontWeight: 400 }}
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
          {datasetProperties?.filesNotIngested || 0}
        </Typography>
        <Typography
          gutterBottom
          darkMode
          style={{ marginBottom: 24, fontWeight: 300 }}
        >
          Files not ingested
        </Typography>
        <Link
          onClick={() => handleChangeTab("failed")}
          style={{ color: "#fff", fontSize: 14, fontWeight: 400 }}
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
          percent={filesWithIssuesPer}
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
                {filesWithIssues}
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
                  fontWeight: 300,
                }}
              >
                Files with Issues
              </Typography>
            </>
          }
        />
        <div className="post-ingestion-issues">
          <Typography variant="h2" gutterBottom darkMode>
            {totalFileIngested}
          </Typography>
          <Typography
            gutterBottom
            darkMode
            style={{ marginBottom: 32, fontWeight: 300 }}
          >
            Total files ingested
          </Typography>

          <Link
            onClick={() => handleChangeTab("ingestion_issues")}
            style={{ color: "#fff", fontSize: 14, fontWeight: 400 }}
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
