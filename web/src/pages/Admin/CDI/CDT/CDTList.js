/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  compareStrings,
  compareNumbers,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";
import FilterIcon from "apollo-react-icons/Filter";
import Link from "apollo-react/components/Link";
import Tooltip from "apollo-react/components/Tooltip";
import Switch from "apollo-react/components/Switch";
import Modal from "apollo-react/components/Modal";
import MenuItem from "apollo-react/components/MenuItem";
import Select from "apollo-react/components/Select";
import TextField from "apollo-react/components/TextField";

import Progress from "../../../../components/Common/Progress/Progress";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import {
  TextFieldFilter,
  createSourceFromKey,
  createAutocompleteFilter,
  createStatusArraySearchFilter,
  createStringArraySearchFilter,
  getUserId,
} from "../../../../utils/index";
import { getCDTList } from "../../../../store/actions/CDIAdminAction";
import {
  activateDK,
  inActivateDK,
  getENSList,
  addDK,
  updateDK,
} from "../../../../services/ApiServices";

import "./CDTList.scss";

const statusList = ["Active", "Inactive"];

const StatusCell =
  (handleStatusChange) =>
  ({ row, column: { accessor } }) => {
    const value = row[accessor];
    return (
      <Tooltip
        title={`${value === 1 ? "Active" : "Inactive"}`}
        disableFocusListener
      >
        <Switch
          className="table-checkbox"
          checked={value === 1 ? true : false}
          onChange={(e) => handleStatusChange(e, row.dkId, value)}
          size="small"
        />
      </Tooltip>
    );
  };

const LinkCell =
  (handleLink) =>
  ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    return <Link onClick={(e) => handleLink(e, row.dkId)}>{rowValue}</Link>;
  };

const generateColumns = (
  tableRows = [],
  handleStatusChange = null,
  handleLink = null
) => {
  return [
    {
      header: "",
      accessor: "dkId",
      hidden: true,
    },
    {
      header: "Clinical Data Name",
      accessor: "dkName",
      customCell: LinkCell(handleLink),
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("dkName"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "Description",
      accessor: "dkDesc",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("dkDesc"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "External System Name",
      accessor: "dkESName",
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("dkESName"),
      filterComponent: createAutocompleteFilter(
        createSourceFromKey(tableRows, "dkESName")
      ),
    },
    {
      header: "Status",
      accessor: "dkStatus",
      customCell: StatusCell(handleStatusChange),
      sortFunction: compareNumbers,
      filterFunction: createStatusArraySearchFilter("dkStatus"),
      filterComponent: createSelectFilterComponent(statusList, {
        size: "small",
        multiple: true,
      }),
      width: 120,
    },
  ];
};

export default function CDTList() {
  const messageContext = useContext(MessageContext);
  const [tableRows, setTableRows] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [ens, setENS] = useState("");
  const [ensId, setENSId] = useState("");
  const [cName, setCName] = useState("");
  const [status, setStatus] = useState(true);
  const [desc, setDesc] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [nameError, setNameError] = useState(false);
  const [reqNameError, setReqNameError] = useState(false);
  const [reqENSError, setReqENSError] = useState(false);
  const columns = generateColumns(tableRows);
  const [columnsState, setColumns] = useState([...columns]);
  const dispatch = useDispatch();
  const { cdtList, loading } = useSelector((state) => state.cdiadmin);
  const [ensList, setENSList] = useState([]);

  const getData = () => {
    dispatch(getCDTList());
  };

  const hideViewData = async () => {
    setViewModal(false);
    setTimeout(() => {
      setSelectedRow(null);
      setENS("");
      setCName("");
      setStatus(true);
      setDesc("");
      setNameError(false);
      setReqENSError(false);
      setReqNameError(false);
    }, 500);
  };

  useEffect(() => {
    setTableRows(cdtList);
  }, [loading, cdtList]);

  useEffect(() => {
    if (cdtList.length < 1) {
      getData();
    }
  }, []);

  const handleStatusChange = async (e, dkId, currStatus) => {
    e.preventDefault();
    if (currStatus === 0) {
      await activateDK(dkId, 1);
      getData();
    } else {
      const update = await inActivateDK(dkId, 0);
      if (update) {
        if (update.status === 0) {
          messageContext.showErrorMessage(update.data);
        } else {
          getData();
        }
      }
    }
  };

  const getENSlists = async () => {
    if (ensList.length <= 0) {
      const list = await getENSList();
      setENSList([...list]);
    }
  };

  const handleLink = async (e, Id) => {
    e.preventDefault();
    const selected = await cdtList.find((d) => d.dkId === Id);
    await getENSlists();
    const { dkName, dkStatus, dkDesc, dkESName } = await selected;
    const picked = ensList.find((d) => d.label === dkESName);
    // console.log("handleLink", "test", selected, picked);
    setSelectedRow(Id);
    setENS(dkESName);
    setCName(dkName);
    setDesc(dkDesc);
    setStatus(dkStatus === 1 ? true : false);
    if (picked) {
      setENSId(picked.value);
    }
    setViewModal(true);
  };

  useEffect(() => {
    setTableRows(cdtList);
    const col = generateColumns(cdtList, handleStatusChange, handleLink);
    setColumns([...col]);
  }, [loading, cdtList]);

  const handleAddCDT = async () => {
    setViewModal(true);
    await getENSlists();
  };

  const handleSelection = (e) => {
    const { value } = e.target;
    const selected = ensList.find((d) => d.label === value);
    setENS(selected.label);
    setENSId(selected.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setCName(value);
    } else if (name === "desc") {
      setDesc(value);
    }
  };

  const handleStatusUpdate = () => {
    setStatus(!status);
  };

  // eslint-disable-next-line consistent-return
  const handleSave = async () => {
    const regexp = /^[a-zA-Z0-9-_]+$/;
    const userId = getUserId();

    if (cName === "") {
      setReqNameError(true);
      if (ens === "") {
        setReqENSError(true);
      }
      return false;
    }

    if (cName && cName.search(regexp) === -1) {
      setNameError(true);
      return false;
    }

    setReqNameError(false);
    setNameError(false);

    if (ens === "") {
      setReqENSError(true);
      return false;
    }

    setReqENSError(false);

    if (selectedRow) {
      // console.log("update", cName, selectedRow, status, desc, ensId, ens);

      updateDK({
        dkId: selectedRow,
        dkName: cName,
        dkDesc: desc,
        dkExternalId: ensId,
        dkESName: ens,
        dkStatus: status === true ? 1 : 0,
        userId,
      }).then((res) => {
        if (res.status === 1) {
          hideViewData();
          messageContext.showSuccessMessage("Updated successfully");
          getData();
        }
        if (res.status === 0) {
          hideViewData();
          messageContext.showErrorMessage(res.data);
        }
      });
    } else {
      // console.log("create", cName, status, desc, ensId, ens);
      addDK({
        dkName: cName,
        dkDesc: desc,
        dkExternalId: ensId,
        dkESName: ens,
        dkStatus: status === true ? 1 : 0,
      }).then((res) => {
        if (res.status === 1) {
          hideViewData();
          messageContext.showSuccessMessage("Created successfully");
          getData();
        }
        if (res.status === 0) {
          hideViewData();
          messageContext.showErrorMessage(res.data);
        }
      });
    }
  };

  const CustomButtonHeader = ({ toggleFilters, addCDT }) => (
    <div>
      <Button
        size="small"
        variant="secondary"
        icon={PlusIcon}
        onClick={addCDT}
        style={{ marginRight: "8px", border: "none", boxShadow: "none" }}
      >
        Add data type
      </Button>
      <Button
        size="small"
        variant="secondary"
        icon={FilterIcon}
        onClick={toggleFilters}
      >
        Filter
      </Button>
    </div>
  );

  const getTableData = React.useMemo(
    () => (
      <>
        {loading ? (
          <Progress />
        ) : (
          <>
            <Table
              isLoading={loading}
              title="Clinical Data Types"
              subtitle={`${tableRows.length} items`}
              columns={columnsState}
              rows={tableRows}
              rowId="dkId"
              hasScroll={true}
              maxHeight="calc(100vh - 162px)"
              rowsPerPageOptions={[10, 50, 100, "All"]}
              initialSortedColumn="dkName"
              initialSortOrder="asc"
              tablePaginationProps={{
                labelDisplayedRows: ({ from, to, count }) =>
                  `${
                    count === 1 ? "Item " : "Items"
                  } ${from}-${to} of ${count}`,
                truncate: true,
              }}
              showFilterIcon
              CustomHeader={(props) => (
                <CustomButtonHeader {...props} addCDT={handleAddCDT} />
              )}
            />
          </>
        )}
      </>
    ),
    [tableRows, loading]
  );

  return (
    <div className="cdt-list-wrapper">
      <div className="cdt-table">
        <div className="table">{getTableData}</div>
      </div>
      <Modal
        open={viewModal}
        title={<>{`${selectedRow ? "Edit" : "Create"} Clinical Data Type`}</>}
        onClose={hideViewData}
        message={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <>
            <div style={{ width: "647px" }}>
              <div style={{ display: "flex" }}>
                <div style={{ width: 489 }}>
                  <TextField
                    label="Clinical Data Name"
                    placeholder="Enter Clinical Data Name"
                    value={cName}
                    name="name"
                    onChange={(e) => handleChange(e)}
                    required
                    fullWidth
                    helperText={
                      (nameError && "Only Alphanumeric and '_' are allowed") ||
                      (reqNameError && "Data Type Name shouldn't be empty")
                    }
                    error={nameError || reqNameError}
                  />
                </div>
                {!selectedRow && (
                  <div style={{ display: "flex" }}>
                    <div className="switch-label">Active</div>
                    <div className="switch">
                      <Switch
                        className="MuiSwitch"
                        checked={status}
                        name="status"
                        onChange={handleStatusUpdate}
                        size="small"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex" }}>
                <div className="esn-box">
                  <Select
                    label="External System Name"
                    value={ens}
                    onChange={(e) => handleSelection(e)}
                    canDeselect={false}
                    placeholder="Select system name"
                    fullWidth
                    required
                    helperText={
                      reqENSError && "External System shouldn't be empty"
                    }
                    error={reqENSError}
                  >
                    {ensList.map((option) => (
                      <MenuItem key={option.value} value={option.label}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                <div className="desc-box">
                  <TextField
                    label="Description"
                    placeholder="Enter Description"
                    value={desc}
                    name="desc"
                    minHeight={40}
                    onChange={(e) => handleChange(e)}
                    optional
                    sizeAdjustable
                  />
                </div>
              </div>
            </div>
          </>
        }
        buttonProps={[
          { label: "Cancel", onClick: hideViewData },
          { label: "Save", onClick: handleSave },
        ]}
        id="createDataKind"
      />
    </div>
  );
}
