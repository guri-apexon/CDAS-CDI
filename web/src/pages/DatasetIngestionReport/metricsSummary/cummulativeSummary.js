/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import DonutChartV2 from "apollo-react/components/DonutChartV2";
import BarChart from "apollo-react/components/BarChart";
import Typography from "apollo-react/components/Typography";
import Link from "apollo-react/components/Link";
import Divider from "apollo-react/components/Divider";
import { useHistory } from "react-router";

const CummulativeSummary = ({
  datasetProperties,
  setModalOpen,
  handleChangeTab,
}) => {
  const history = useHistory();
  const data = [
    {
      type: "New Records",
      a:
        datasetProperties?.totalRecords > 0
          ? ((datasetProperties?.newRecords || 0) * 100) /
            datasetProperties?.totalRecords
          : 0,
    },
    {
      type: "Modified Records",
      a:
        datasetProperties?.totalRecords > 0
          ? ((datasetProperties?.modifiedRecords || 0) * 100) /
            datasetProperties?.totalRecords
          : 0,
    },
  ];
  const postIngestionIssues = datasetProperties?.postIngestionIssues || 0;
  const recordsWithIssues = datasetProperties?.recordsWithIssues || 0;
  const totalRecords = datasetProperties?.totalRecords || 0;
  const recordsWithIssuesPer =
    totalRecords > 0 ? (recordsWithIssues * 100) / totalRecords : 0;
  console.log("datasetProperties", datasetProperties);
  return (
    <div className="summary-body">
      <div className="post-ingestion-issues">
        <Typography variant="h2" gutterBottom darkMode>
          {postIngestionIssues}
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
                }}
              >
                Records with Issues
              </Typography>
            </>
          }
        />
        <div className="post-ingestion-issues">
          <Typography variant="h2" gutterBottom darkMode>
            {`${datasetProperties?.totalRecords || 0}`}
          </Typography>
          <Typography gutterBottom darkMode style={{ marginBottom: 32 }}>
            Total Records
          </Typography>
          <Link
            onClick={() =>
              history.push(
                `/dashboard/ingestion-issues/${datasetProperties?.datasetid}`
              )
            }
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
  );
};
export default CummulativeSummary;
