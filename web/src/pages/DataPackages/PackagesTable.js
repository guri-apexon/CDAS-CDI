/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Tooltip from "apollo-react/components/Tooltip";
import IconButton from "apollo-react/components/IconButton";
import TreeItem from "apollo-react/components/TreeItem";
import TreeView from "apollo-react/components/TreeView";
import ArrowDown from "apollo-react-icons/ArrowDown";
import ArrowRight from "apollo-react-icons/ArrowRight";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import StatusDotSolid from "apollo-react-icons/StatusDotSolid";
import Status from "apollo-react/components/Status";
import Typography from "apollo-react/components/Typography";
import Tag from "apollo-react/components/Tag";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import { ReactComponent as DataPackageIcon } from "../../components/Icons/datapackage.svg";
import {
  deletePackage,
  redirectToDataSet,
  updateStatus,
} from "../../store/actions/DataPackageAction";

const PackagesList = ({ data, userInfo }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableData, setTableData] = useState([]);
  const ContextMenu = (props) => {
    const setActive = (packageId, status) => {
      if (packageId) {
        dispatch(
          updateStatus({
            package_id: packageId,
            active: status === 1 ? "0" : "1",
            user_id: userInfo.user_id,
          })
        );
      }
    };
    const deleteAction = (packageId) => {
      if (packageId) {
        dispatch(
          deletePackage({ package_id: packageId, user_id: userInfo.user_id })
        );
      }
    };
    const menuItems = [
      {
        text: `Set data package ${props.active === 1 ? "inactive" : "active"}`,
        onClick: () => setActive(props.datapackageid, props.active),
      },
      {
        text: "Set all dataset to active",
        // onClick: () => onRowEdit(props.datapackageid),
      },
      {
        text: "Set all datasets to inactive",
        // onClick: () => onRowEdit(props.datapackageid),
      },
      {
        text: "Delete data package",
        onClick: () => deleteAction(props.datapackageid),
      },
    ];
    return (
      <>
        <Tooltip title="Actions" disableFocusListener>
          <IconMenuButton id="actions" menuItems={menuItems} size="small">
            <EllipsisVertical />
          </IconMenuButton>
        </Tooltip>
      </>
    );
  };
  const DataSetTitle = (props) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="caption" className="datasetType">
        {props.type.toUpperCase()}
      </Typography>
      <Status
        variant="positive"
        label={props.active ? "Active" : "Inactive"}
        size="small"
        className={`datasetStatus ${props.active ? "active" : "inactive"}`}
        icon={StatusDotSolid}
      />
    </div>
  );
  const renderChildTree = ({ datasetid, mnemonic, type, active }) => (
    <TreeItem
      key={datasetid}
      nodeId={datasetid}
      label={mnemonic}
      count={<DataSetTitle type={type} active={active} />}
    />
  );
  const addDataSet = (dataflowid, datapackageid) => {
    dispatch(redirectToDataSet(dataflowid, datapackageid));
    history.push("/datasets-management");
  };
  const DataPackageTitle = (props) => (
    <div>
      <Typography variant="caption" className="datasetCount">
        {props.count}
      </Typography>
      <Tooltip title="Add Dataset" placement="bottom">
        <IconButton size="small" onClick={() => addDataSet(props.dataflowid, props.datapackageid)}>
          <AddCircleIcon />
        </IconButton>
      </Tooltip>
      <Tag
        label={props.active ? "Active" : "Inactive"}
        variant={props.active ? "green" : "grey"}
      />
      <ContextMenu {...props} />
    </div>
  );
  const renderTree = ({
    datapackageid,
    name,
    datasets,
    active,
    dataflowid,
  }) => (
    <TreeItem
      key={datapackageid}
      nodeId={datapackageid}
      label={name}
      count={
        <DataPackageTitle
          active={active}
          datapackageid={datapackageid}
          dataflowid={dataflowid}
          name={name}
          count={datasets.length || 0}
        />
      }
      icon={
        <>
          {expandedRows.indexOf(datapackageid) === -1 && (
            <ArrowRight
              style={{
                padding: "4px 4px 4px 0px",
                fontSize: "16px !important",
                paddingLeft: "5px !important",
              }}
            />
          )}
          {expandedRows.indexOf(datapackageid) > -1 && (
            <ArrowDown
              style={{
                padding: "4px 4px 4px 0px",
                fontSize: "16px !important",
                paddingLeft: "5px !important",
              }}
            />
          )}
          <DataPackageIcon
            style={{
              marginTop: "1px",
              marginLeft: "-4px",
              marginRight: "-16px",
              color: "#595959",
            }}
          />
        </>
      }
      // eslint-disable-next-line react/no-children-prop
      children={<DataPackageTitle />}
    >
      {Array.isArray(datasets)
        ? datasets.map((node) => renderChildTree(node))
        : null}
    </TreeItem>
  );
  useEffect(() => {
    const newData = data.packagesList || [];
    const updatedData = newData;
    setTableData(updatedData);
  }, [data.packagesList]);
  const handleToggle = (e, nodeIds) => {
    setExpandedRows(nodeIds);
  };
  const handleSelect = (e, nodeIds) => {
    setSelectedRows(nodeIds);
  };
  return (
    <>
      <div style={{ maxWidth: 400 }}>
        <TreeView
          // expanded={expandedRows}
          // selected={selectedRows}
          // onNodeToggle={(e, nodeIds) => handleToggle(e, nodeIds)}
          max={99}
        >
          {tableData.map((node) => renderTree(node))}
        </TreeView>
      </div>
    </>
  );
};
export default PackagesList;
