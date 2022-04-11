import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";
import Paper from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import Typography from "apollo-react/components/Typography";
import Button from "apollo-react/components/Button";
import CopyIcon from "apollo-react-icons/Copy";
import IconButton from "apollo-react/components/IconButton";
import Tooltip from "apollo-react/components/Tooltip";
import Modal from "apollo-react/components/Modal";
import { ReactComponent as DataFlowIcon } from "../../components/Icons/dataflow.svg";
import { ReactComponent as DataPackageIcon } from "../../components/Icons/datapackage.svg";

const formatDate = (v) => {
  return v && moment(v, "YYYY-MM-DD HH:mm:ss").isValid()
    ? moment(v, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY / hh:mm a")
    : "";
};

const Properties = ({ datasetProperties }) => {
  const history = useHistory();
  const params = useParams();
  const [copyText, setCopyText] = useState("Copy");
  const [modalOpen, setModalOpen] = useState(false);
  const { datasetId } = params;
  const connectionTypeCheck = ["sftp", "ftps"];
  const copyVendor = () => {
    navigator.clipboard.writeText(datasetProperties?.VendorContactInformation);
    setCopyText("Copied");
  };
  const redirectToDataset = () => {
    history.push(`/dashboard/dataset/${datasetId}`, datasetId);
  };
  return (
    <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 24 }}>
      <Paper
        style={{ padding: 24, backgroundColor: "#fff" }}
        id="properties-box"
      >
        <div className="panel-header">
          <Typography variant="title1" style={{ fontSize: 16, marginTop: 0 }}>
            Dataset Properties
          </Typography>
          <Button
            variant="text"
            onClick={() => setModalOpen(true)}
            size="small"
            style={{ marginRight: 10 }}
          >
            View Dataset Settings
          </Button>
        </div>
        <div className="panel-body">
          <Grid container style={{ width: "calc(50% + 16px)" }} spacing={2}>
            <Grid item xs={12}>
              <div className="label">Vendor Contact Information</div>
              <div className="text">
                {datasetProperties?.VendorContactInformation}
                {datasetProperties?.VendorContactInformation && (
                  <Tooltip title={copyText} placement="top">
                    <IconButton color="primary" size="small">
                      <CopyIcon
                        onClick={() => copyVendor()}
                        onMouseOut={() => setCopyText("Copy")}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="label">Date Last Checked</div>
              <div className="text">
                {formatDate(datasetProperties?.DateLastChecked)}
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="label">Date of Last Succesful Process</div>
              <div className="text">
                {formatDate(datasetProperties?.DateofLastSuccessfulProcess)}
              </div>
            </Grid>
            {connectionTypeCheck.indexOf(
              datasetProperties?.SourceOrigin?.toLowerCase()
            ) !== -1 && (
              <>
                <Grid item xs={6}>
                  <div className="label">Expected Date of Next Transfer</div>
                  <div className="text">
                    {formatDate(datasetProperties?.ExpectedDateofNextTransfer)}
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="label">Expected Transfer Frequency</div>
                  <div className="text">
                    {datasetProperties?.ExpectedTransferFrequency}
                  </div>
                </Grid>
              </>
            )}
            <Grid item xs={6}>
              <div className="label">Load Type</div>
              <div className="text">
                {datasetProperties?.loadType?.toLowerCase() === "incremental"
                  ? datasetProperties?.loadType
                  : "Cumulative"}
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="label">Source Origin</div>
              <div className="text">{datasetProperties?.SourceOrigin}</div>
            </Grid>
            <Grid item xs={12}>
              <div className="label">
                <DataFlowIcon className="properties-icon" />
                Data Flow Name
              </div>
              <div className="text">{datasetProperties?.DataFlowName}</div>
            </Grid>
            {connectionTypeCheck.indexOf(
              datasetProperties?.SourceOrigin?.toLowerCase()
            ) !== -1 && (
              <Grid item xs={12}>
                <div className="label">
                  <DataPackageIcon className="properties-icon" />
                  Data Package Naming Convention (zip files)
                </div>
                <div className="text">
                  {datasetProperties?.DataPackageNamingConvention}
                </div>
              </Grid>
            )}
          </Grid>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="You are about to leave dashboard page?"
          id="neutral"
          buttonProps={[
            {},
            { label: "Continue", onClick: () => redirectToDataset() },
          ]}
        />
      </Paper>
    </div>
  );
};

export default Properties;
