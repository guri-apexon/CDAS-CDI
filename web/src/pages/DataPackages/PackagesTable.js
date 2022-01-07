/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Tooltip from "apollo-react/components/Tooltip";
import IconButton from "apollo-react/components/IconButton";
import TreeItem from "apollo-react/components/TreeItem";
import TreeView from "apollo-react/components/TreeView";
import ArrowDown from "apollo-react-icons/ArrowDown";
import ArrowRight from "apollo-react-icons/ArrowRight";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import Typography from "apollo-react/components/Typography";
import Tag from "apollo-react/components/Tag";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import { ReactComponent as DataPackageIcon } from "../../components/Icons/datapackage.svg";
import {
  deletePackage,
  updateStatus,
} from "../../store/actions/DataPackageAction";

const PackagesList = ({ data, userInfo }) => {
  const dispatch = useDispatch();
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
  }
  const renderChildTree = ({ datasetsid, name }) => (
    <TreeItem key={datasetsid} nodeId={datasetsid} label={name} />
  );
  const DataPackageTitle = (props) => (
    <div>
      <Typography variant="caption" className="datasetCount">0</Typography>
      <Tooltip title="Add Dataset" placement="bottom">
        <IconButton size="small">
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
  const renderTree = ({ datapackageid, name, childNodes, active }) => (
    <TreeItem
      key={datapackageid}
      nodeId={datapackageid}
      label={name}
      count={<DataPackageTitle active={active} datapackageid={datapackageid} name={name} />}
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
      {Array.isArray(childNodes)
        ? childNodes.map((node) => renderChildTree(node))
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
  console.log(expandedRows, "expandedRows");
  return (
    <>
      <div style={{ maxWidth: 400 }}>
        <TreeView
          expanded={expandedRows}
          selected={selectedRows}
          variant="folder"
          onNodeToggle={handleToggle}
          multiSelect
        >
          {tableData.map((node) => renderTree(node))}
        </TreeView>
      </div>
    </>
  );
};
export default PackagesList;
