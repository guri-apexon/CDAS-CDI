import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import Paper from "apollo-react/components/Box";
import Grid from "apollo-react/components/Grid";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Typography from "apollo-react/components/Typography";
import Button from "apollo-react/components/Button";
import CopyIcon from "apollo-react-icons/Copy";
import IconButton from "apollo-react/components/IconButton";
import Tooltip from "apollo-react/components/Tooltip";
import Modal from "apollo-react/components/Modal";
import { ReactComponent as DataFlowIcon } from "../../../components/Icons/dataflow.svg";
import { ReactComponent as DatasetIcon } from "../../../components/Icons/dataset.svg";
import { ReactComponent as FileIcon } from "../../../components/Icons/file.svg";
import { ReactComponent as DataPackageIcon } from "../../../components/Icons/datapackage.svg";
import { redirectToDataSet } from "../../../store/actions/DataPackageAction";
import { updateDSState } from "../../../store/actions/DataFlowAction";
import "./properties.scss";

const formatDate = (v) => {
  return v && moment(v, "YYYY-MM-DD HH:mm:ss").isValid()
    ? moment(v, "YYYY-MM-DD HH:mm:ss").format("DD-MMM-YYYY / hh:mm a")
    : "";
};

const IssuesProperties = ({ datasetProperties }) => {
  const history = useHistory();
  const params = useParams();
  const dispatch = useDispatch();
  const [copyText, setCopyText] = useState("Copy");
  const [loading, setLoading] = useState(false);
  const { datasetId } = params;
  const connectionTypeCheck = ["sftp", "ftps"];
  const {
    DatasetName,
    DataFlowName,
    datapackageid,
    dataflowid,
    DataPackageNamingConvention,
    VendorContactInformation,
    Vendor,
    DateLastChecked,
    DateofLastSuccessfulProcess,
    SourceOrigin,
    ExpectedDateofNextTransfer,
    ExpectedTransferFrequency,
    loadType,
    FileName,
  } = datasetProperties;
  const copyVendor = async () => {
    await navigator.clipboard
      .writeText(VendorContactInformation)
      .then(() => {
        setCopyText("Copied");
      })
      .catch((err) => {
        console.log("clipboard err", err);
      });
  };
  // useEffect(() => {
  //   if (datasetProperties?.dataflowid) {
  //     setLoading(false);
  //   }
  // }, [datasetProperties]);
  return (
    <section className="properties-wrapper">
      <Paper id="properties-box">
        {loading ? (
          <div className="flex loader">
            <ApolloProgress />
          </div>
        ) : (
          <>
            <div className="panel-header">
              <Typography variant="title1">File Properties</Typography>
            </div>
            <div className="panel-body">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <div className="label">Vendor Name</div>
                  <div className="text">{Vendor || "------"}</div>
                </Grid>
                <Grid item xs={12}>
                  <div className="label">Vendor Contact Information</div>
                  <div className="text">
                    {datasetProperties?.VendorContactInformation || "------"}
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
                  <div className="text">{formatDate(DateLastChecked)}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Date of Last Succesful Process</div>
                  <div className="text">
                    {formatDate(DateofLastSuccessfulProcess)}
                  </div>
                </Grid>
                {connectionTypeCheck.indexOf(SourceOrigin?.toLowerCase()) !==
                  -1 && (
                  <>
                    <Grid item xs={6}>
                      <div className="label">
                        Expected Date of Next Transfer
                      </div>
                      <div className="text">
                        {formatDate(ExpectedDateofNextTransfer)}
                      </div>
                    </Grid>

                    <Grid item xs={6}>
                      <div className="label">Expected Transfer Frequency</div>
                      <div className="text">
                        {ExpectedTransferFrequency || "------"}
                      </div>
                    </Grid>
                  </>
                )}
                <Grid item xs={6}>
                  <div className="label">Load Type</div>
                  <div className="text">{loadType}</div>
                </Grid>
                <Grid item xs={12}>
                  <div className="label">File Naming Convention</div>
                  <div className="text">
                    <FileIcon className="properties-icon" />
                    {FileName || "------"}
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Dataset Name</div>
                  <div className="text">
                    <DatasetIcon className="properties-icon" />
                    {DatasetName || "------"}
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">
                    Data Package Naming Convention (zip files)
                  </div>
                  <div className="text">
                    <DataPackageIcon className="properties-icon" />
                    {DataPackageNamingConvention || "------"}
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className="label">Data Flow Name</div>
                  <div className="text">
                    <DataFlowIcon className="properties-icon" />
                    {DataFlowName || "------"}
                  </div>
                </Grid>
              </Grid>
            </div>
          </>
        )}
      </Paper>
    </section>
  );
};

export default IssuesProperties;
