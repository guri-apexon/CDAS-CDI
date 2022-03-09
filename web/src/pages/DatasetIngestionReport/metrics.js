/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import Hero from "apollo-react/components/Hero";
import Grid from "apollo-react/components/Grid";
import BulletChart from "apollo-react/components/BulletChart";
import Typography from "apollo-react/components/Typography";
import MenuItem from "apollo-react/components/MenuItem";
import SelectButton from "apollo-react/components/SelectButton";
import Paper from "apollo-react/components/Box";
import Button from "apollo-react/components/Button";
import DateRangePicker from "apollo-react/components/DateRangePickerV2";
import Popper from "apollo-react/components/Popper";
import CummulativeSummary from "./metricsSummary/cummulativeSummary";
import IncrementalSummary from "./metricsSummary/incrementalSummary";
import IngestionIssuesModal from "./metricsSummary/ingestionIssuesModal";
import { getDatasetIngestionFileHistory } from "../../store/actions/IngestionReportAction";

const Metrics = ({ datasetProperties, issuetypes }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const selectRef = useRef();
  const dispatch = useDispatch();
  const { datasetId } = useParams();
  const historyData = [
    { filename: "File Name1", yield: [200, 400, 600] },
    { filename: "File Name2", yield: [300, 100, 500] },
    { filename: "File Name3", yield: [200, 300, 400] },
    { filename: "File Name4", yield: [150, 250, 500] },
    { filename: "File Name5", yield: [300, 200, 100] },
  ];

  const legendLabels = ["New", "Modified", "Unchanged"];

  const selectChangeView = (val) => {
    console.log(selectRef.current, "selectRef");
    if (val === "custom") {
      setAnchorEl(!anchorEl ? selectRef.current : null);
    } else {
      setAnchorEl(null);
    }
  };

  const getFileHistoryData = () => {
    dispatch(getDatasetIngestionFileHistory(datasetId));
  };

  useEffect(() => {
    getFileHistoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const MetricsSubtitle = () => {
    if (datasetProperties?.loadType?.toLowerCase() === "incremental") {
      return (
        <>
          <Typography darkMode style={{ lineHeight: "24px" }}>
            {`${datasetProperties?.totalIncrementalFileTransferred} Total incremental files transfered`}
          </Typography>
        </>
      );
    }
    return (
      <>
        <Typography style={{ lineHeight: "24px" }} darkMode>
          When there is no data to display
        </Typography>
        <Typography variant="body2" darkMode>
          12-Apr-2021 / 3:00 pm
        </Typography>
      </>
    );
  };

  return (
    <div className="ingestion-report-metrics">
      <Hero
        title={
          <Typography variant="title1" darkMode style={{ marginTop: "auto" }}>
            File transfer summary
          </Typography>
        }
        subtitle={<MetricsSubtitle />}
        className="file-transfer-kpi"
      >
        {datasetProperties?.loadType?.toLowerCase() !== "incremental" && (
          <CummulativeSummary
            setModalOpen={() => setModalOpen(true)}
            datasetProperties={datasetProperties}
          />
        )}
        {datasetProperties?.loadType?.toLowerCase() === "incremental" && (
          <IncrementalSummary
            setModalOpen={() => setModalOpen(true)}
            datasetProperties={datasetProperties}
          />
        )}
        <IngestionIssuesModal
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          issuetypes={issuetypes}
        />
      </Hero>
      <Grid container style={{ padding: 24, backgroundColor: "#f8f9fb" }}>
        <Grid item xs={12}>
          <Paper
            style={{ padding: 24, backgroundColor: "#fff" }}
            id="filehistory-box"
          >
            <div className="panel-header">
              <div className="left-part">
                <Typography
                  variant="title1"
                  style={{ fontSize: 16, marginTop: 0 }}
                >
                  File Transfer History
                </Typography>
                <Typography
                  variant="body2"
                  style={{ fontSize: 14, marginTop: 0 }}
                >
                  500 total files transfered
                </Typography>
              </div>
              <div className="right-part">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    style={{ fontSize: 14, marginRight: 10 }}
                  >
                    Change View:
                  </Typography>
                  <SelectButton
                    placeholder="Within past 10 days"
                    style={{ marginRight: 10 }}
                    onChange={selectChangeView}
                    ref={selectRef}
                  >
                    <MenuItem value="10">Within past 10 days</MenuItem>
                    <MenuItem value="20">Within past 30 days</MenuItem>
                    <MenuItem value="custom">Custom date range</MenuItem>
                  </SelectButton>
                </div>
                {/* <Popper open={true} anchorEl={anchorEl}>
                  <DateRangePicker
                    size="small"
                    helperText="Select a start and end date"
                  />
                </Popper> */}
                <div>
                  <Typography
                    variant="body2"
                    style={{ fontSize: 14, marginTop: 14 }}
                  >
                    {`Expected transfer frequency: ${datasetProperties?.ExpectedTransferFrequency}`}
                  </Typography>
                </div>
              </div>
            </div>
            <div className="panel-body">
              <BulletChart data={historyData} legendLabels={legendLabels} />
              <Button
                size="small"
                style={{ marginTop: 27, marginLeft: "-3px" }}
              >
                Load More
              </Button>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Metrics;
