/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import moment from "moment";
import Hero from "apollo-react/components/Hero";
import Grid from "apollo-react/components/Grid";
import ClusterColumnChart from "apollo-react/components/ClusterColumnChart";
import Typography from "apollo-react/components/Typography";
import Modal from "apollo-react/components/Modal";
import TextField from "apollo-react/components/TextField";
import MenuItem from "apollo-react/components/MenuItem";
import SelectButton from "apollo-react/components/SelectButton";
import Paper from "apollo-react/components/Box";
import CummulativeSummary from "./metricsSummary/cummulativeSummary";
import IncrementalSummary from "./metricsSummary/incrementalSummary";
import IngestionIssuesModal from "./metricsSummary/ingestionIssuesModal";
import { getDatasetIngestionFileHistory } from "../../store/actions/IngestionReportAction";

const formatDate = (v) => {
  return v && moment(v, "YYYY-MM-DD HH:mm:ss").isValid()
    ? moment(v, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY / hh:mm a")
    : "";
};

const Metrics = ({ datasetProperties, issuetypes, handleChangeTab }) => {
  const { filehistory } = useSelector((state) => state.ingestionReports);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMenuText, setSelectedMenuText] = useState(
    "Within past 10 days"
  );
  const [errorInput, setErrorInput] = useState(false);
  const [customValue, setCustomValue] = useState(null);
  const dispatch = useDispatch();
  const { datasetId } = useParams();
  const connectionTypeCheck = ["sftp", "ftps"];

  const changeCustomDays = (val) => {
    if (val < 1 || val > 120) {
      setErrorInput(true);
      return false;
    }
    setCustomValue(val);
    setErrorInput(false);
    return null;
  };

  const getFileHistoryData = (days = "") => {
    dispatch(getDatasetIngestionFileHistory(datasetId, days));
    setMenuOpen(false);
  };

  const selectChangeView = (val) => {
    if (val === "custom") {
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
      getFileHistoryData(val);
      setSelectedMenuText(`Within past ${val} days`);
    }
  };

  useEffect(() => {
    getFileHistoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTotalSize(filehistory?.totalSize);
    const histories = [];
    if (datasetProperties?.loadType?.toLowerCase() === "incremental") {
      filehistory?.records?.forEach((record) => {
        histories.push({
          label: `${formatDate(record.lastsucceeded)}`,
          label2: ":test",
          data: [
            {
              Total: (record.new_records + record.modified_records) / 1000,
              New: record.new_records / 1000,
              Modified: record.modified_records / 1000,
            },
          ],
        });
      });
    } else if (datasetProperties?.loadType?.toLowerCase() === "full") {
      filehistory?.records?.forEach((record) => {
        histories.push({
          label: `${formatDate(record.lastsucceeded)}`,
          data: [
            {
              Total: (record.new_records + record.modified_records) / 1000,
              New: record.new_records / 1000,
              Modified: record.modified_records / 1000,
              Unchanged: record.new_records / 1000,
            },
          ],
        });
      });
    }
    if (histories.length > 0) {
      setHistoryData(histories);
    } else {
      setHistoryData([]);
    }
  }, [datasetProperties?.loadType, filehistory]);

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
          {datasetProperties?.FileName || ""}
        </Typography>
        <Typography variant="body2" darkMode>
          {formatDate(datasetProperties?.DateofLastSuccessfulProcess) || ""}
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
            handleChangeTab={handleChangeTab}
          />
        )}
        {datasetProperties?.loadType?.toLowerCase() === "incremental" && (
          <IncrementalSummary
            setModalOpen={() => setModalOpen(true)}
            datasetProperties={datasetProperties}
            handleChangeTab={handleChangeTab}
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
                  {`<${totalSize}> files transfered`}
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
                    size="small"
                    placeholder="Within past 10 days"
                    style={{ marginRight: 10 }}
                    onChange={selectChangeView}
                    displayText={selectedMenuText}
                    noDeselect
                  >
                    <MenuItem value="10">Within past 10 days</MenuItem>
                    <MenuItem value="30">Within past 30 days</MenuItem>
                    <MenuItem value="custom">Custom date range</MenuItem>
                  </SelectButton>
                </div>
                {connectionTypeCheck.indexOf(
                  datasetProperties?.SourceOrigin?.toLowerCase()
                ) !== -1 && (
                  <div>
                    <Typography
                      variant="body2"
                      style={{ fontSize: 14, marginTop: 14 }}
                    >
                      {`Expected transfer frequency: ${
                        datasetProperties?.ExpectedTransferFrequency || ""
                      }`}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
            <div
              className="panel-body"
              style={{ overflow: "hidden", overflowX: "auto" }}
            >
              {historyData.length > 0 ? (
                <ClusterColumnChart
                  // {...(historyData.length > 4 && {
                  //   width:
                  //     historyData.length > 10
                  //       ? historyData.length * 80 + 1000
                  //       : "1560",
                  // })}
                  data={historyData}
                  suffix="k"
                  yTicks={6}
                />
              ) : (
                <div
                  style={{
                    height: "50vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    style={{ fontSize: 20, lineHeight: "48px" }}
                  >
                    No data to display
                  </Typography>
                </div>
              )}
            </div>
          </Paper>
        </Grid>
      </Grid>
      <Modal
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setCustomValue(null);
          setSelectedMenuText(selectedMenuText);
        }}
        title="Choose Custom Days"
        message={
          <TextField
            type="number"
            label="Choose upto past 120 days"
            value={customValue}
            inputProps={{ min: 1, max: 120, pattern: "[0-9]" }}
            onChange={(e) => changeCustomDays(e.target.value)}
            helperText={errorInput ? "Select valid input" : null}
            error={errorInput}
          />
        }
        buttonProps={[
          {
            label: "Ok",
            disabled: errorInput || !customValue,
            onClick: () => {
              getFileHistoryData(customValue);
              setSelectedMenuText(`Within past ${customValue} days`);
            },
          },
        ]}
      />
    </div>
  );
};

export default Metrics;
