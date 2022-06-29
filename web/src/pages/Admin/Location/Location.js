/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { change } from "redux-form";
import Button from "apollo-react/components/Button";
import Link from "apollo-react/components/Link";
import PlusIcon from "apollo-react-icons/Plus";
import FilterIcon from "apollo-react-icons/Filter";
import Loader from "apollo-react/components/Loader";
import Table, {
  createStringSearchFilter,
  compareStrings,
  compareNumbers,
  createSelectFilterComponent,
} from "apollo-react/components/Table";
import Tooltip from "apollo-react/components/Tooltip";
import Switch from "apollo-react/components/Switch";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import LocationModal from "../../../components/Common/LocationModal";
import {
  getLocationsData,
  getLocationPasswordData,
} from "../../../store/actions/CDIAdminAction";
import {
  TextFieldFilter,
  createAutocompleteFilter,
  createStringArraySearchFilter,
  createSourceFromKey,
  createStatusArraySearchFilter,
  Capitalize,
  truncateString,
} from "../../../utils/index";
import {
  checkLocationExistsInDataFlow,
  statusUpdate,
} from "../../../services/ApiServices";
import { locationExistInDFMsg } from "../../../constants";
import "./Location.scss";

import usePermission, {
  Categories,
  Features,
} from "../../../components/Common/usePermission";

const LinkCell = ({ row, column: { accessor } }) => {
  const value = row[accessor];
  const { onRowCick } = row;
  return <Link onClick={() => onRowCick(row)}>{value}</Link>;
};

const ConnCell = ({ row, column: { accessor } }) => {
  const value = row[accessor];
  return truncateString(value, 53);
};

const DataStructCell = ({ row, column: { accessor } }) => {
  const value = row[accessor];
  return Capitalize(value);
};

const StatusCell =
  (handleStatusChange) =>
  ({ row, column: { accessor } }) => {
    const { canUpdateLocation } = row;
    const value = row[accessor];
    return (
      <Tooltip
        title={`${value === 1 ? "Active" : "Inactive"}`}
        disableFocusListener
      >
        <Switch
          className="table-checkbox"
          style={{ marginLeft: "-8px" }}
          checked={value === 1 ? true : false}
          onChange={(e) => handleStatusChange(e, row.src_loc_id)}
          size="small"
          disabled={!canUpdateLocation}
        />
      </Tooltip>
    );
  };

const statusList = ["Active", "Inactive"];
const generateColumns = (tableRows = [], handleStatusChange = null) => {
  return [
    {
      header: "Location Name (Alias)",
      accessor: "loc_alias_nm",
      customCell: LinkCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("loc_alias_nm"),
      filterComponent: TextFieldFilter,
      frozen: true,
      width: 180,
    },
    {
      header: "IP Server/Connection URL",
      accessor: "cnn_url",
      customCell: ConnCell,
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("cnn_url"),
      filterComponent: TextFieldFilter,
      frozen: true,
      width: 320,
    },
    {
      header: "Location Type",
      accessor: "loc_typ",
      frozen: true,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("loc_typ"),
      filterComponent: createAutocompleteFilter(
        createSourceFromKey(tableRows, "loc_typ")
      ),
    },
    {
      header: "Data Structure",
      accessor: "data_strc",
      sortFunction: compareStrings,
      customCell: DataStructCell,
      filterFunction: createStringArraySearchFilter("data_strc"),
      filterComponent: createAutocompleteFilter(
        createSourceFromKey(tableRows, "data_strc")
      ),
    },
    {
      header: "Username",
      accessor: "usr_nm",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("usr_nm"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "External System",
      accessor: "extrnl_sys_nm",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("extrnl_sys_nm"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "Status",
      accessor: "active",
      customCell: StatusCell(handleStatusChange),
      sortFunction: compareNumbers,
      width: 13,
      filterFunction: createStatusArraySearchFilter("active"),
      filterComponent: createSelectFilterComponent(statusList, {
        size: "small",
        multiple: true,
      }),
    },
  ];
};

const Location = () => {
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const { locations, loading, upserted, upsertLoading, locationPassword } =
    useSelector((state) => state.cdiadmin);

  const { canUpdate: canUpdateLocation, canCreate: canCreateLocation } =
    usePermission(Categories.CONFIGURATION, Features.LOCATION_SETUP);

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [totalLocations, setTotalLocations] = useState(0);
  const [tableRows, setTableRows] = useState([]);
  const [password, setPassword] = useState("");

  const [, setHasUpdated] = useState(false);
  const columns = generateColumns(tableRows);
  const [columnsState, setColumns] = useState([...columns]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState({});
  const [locationViewMode, setLocationViewMode] = useState(false);
  const [locationEditMode, setLocationEditMode] = useState(false);

  const getData = () => {
    dispatch(getLocationsData("all"));
  };

  const LocationPasswordData = async (val) => {
    await dispatch(getLocationPasswordData(val));
    setPassword(locationPassword);
  };

  const onRowCick = (row) => {
    setSelectedLoc(row);
    dispatch(change("AddLocationForm", "locationID", row?.src_loc_id));
    dispatch(change("AddLocationForm", "locationName", row?.loc_alias_nm));
    dispatch(change("AddLocationForm", "active", row?.active));
    dispatch(change("AddLocationForm", "locationType", row?.loc_typ));
    dispatch(change("AddLocationForm", "ipServer", row?.ip_servr));
    dispatch(change("AddLocationForm", "dataStructure", row?.data_strc));
    dispatch(change("AddLocationForm", "userName", row?.usr_nm));
    dispatch(
      change(
        "AddLocationForm",
        "password",
        row?.pswd === "Yes" ? LocationPasswordData(row?.src_loc_id) : row.pswd
      )
    );
    dispatch(change("AddLocationForm", "connURL", row?.cnn_url));
    dispatch(change("AddLocationForm", "port", row?.port));
    dispatch(change("AddLocationForm", "dbName", row?.db_nm));
    dispatch(
      change("AddLocationForm", "externalSystemName", row?.extrnl_sys_nm)
    );

    setLocationViewMode(true);

    setLocationOpen(true);
  };

  const changeLocationEditMode = (val) => {
    setLocationViewMode(!val);
    setLocationEditMode(val);
  };

  const handleModalClose = () => {
    setLocationOpen(false);
    setLocationViewMode(false);
    setLocationEditMode(false);
  };

  const handleStatusChange = async (e, id) => {
    e.preventDefault();
    const value = e.target.checked;
    setStatusUpdating(true);
    if (value === false) {
      const checkInDf = await checkLocationExistsInDataFlow(id);
      if (checkInDf > 0) {
        messageContext.showErrorMessage(locationExistInDFMsg, 56);
        setStatusUpdating(false);
        return null;
      }
    }
    setStatusUpdating(true);
    const update = await statusUpdate(id, value);
    if (update) {
      if (update.status === 0) {
        messageContext.showErrorMessage(update.data, 56);
      }
      const records = locations?.records || [];
      const copyRecords = JSON.parse(JSON.stringify(records));
      const updatedObject = update?.data?.[0];
      const index = copyRecords.findIndex(
        ({ src_loc_id: locId }) => locId === updatedObject?.src_loc_id
      );
      if (index !== -1) {
        copyRecords[index].active = updatedObject?.active;
        setTableRows(copyRecords);
        const col = generateColumns(copyRecords, handleStatusChange);
        setColumns([...col]);
      }
    }
    setStatusUpdating(false);
    return null;
  };

  useEffect(() => {
    getData();
    handleModalClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upserted]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTableRows(locations?.records ?? []);
    setTotalLocations(locations.totalSize ?? 0);
    const col = generateColumns(locations?.records, handleStatusChange);
    setColumns([...col]);
  }, [loading, locations]);

  const CustomHeader = ({ toggleFilters }) => (
    <div>
      {canCreateLocation && (
        <Button
          id="addLocationBtn"
          icon={<PlusIcon />}
          onClick={() => setLocationOpen(true)}
          size="small"
          style={{ marginRight: 16 }}
        >
          Add location
        </Button>
      )}
      <Button
        size="small"
        id="filterBtn"
        variant="secondary"
        icon={FilterIcon}
        onClick={toggleFilters}
      >
        Filter
      </Button>
    </div>
  );

  return (
    <>
      {upsertLoading && <Loader />}
      <LocationModal
        locationModalOpen={locationOpen}
        selectedLoc={selectedLoc}
        changeLocationEditMode={(val) => changeLocationEditMode(val)}
        handleModalClose={() => handleModalClose()}
        locationEditMode={locationEditMode}
        locationViewMode={locationViewMode}
        canUpdate={canUpdateLocation}
        canCreate={canCreateLocation}
        isNew={!locationEditMode && !locationViewMode}
      />
      <Table
        title="Locations"
        isLoading={loading || statusUpdating}
        subtitle={`${totalLocations} locations`}
        columns={columnsState}
        rows={tableRows.map((row) => ({
          ...row,
          onRowCick,
          canUpdateLocation,
        }))}
        rowId="src_loc_id"
        initialSortedColumn="loc_alias_nm"
        initialSortOrder="asc"
        rowsPerPageOptions={[10, 50, 100, "All"]}
        tablePaginationProps={{
          labelDisplayedRows: ({ from, to, count }) =>
            `${count === 1 ? "Item" : "Items"} ${from}-${to} of ${count}`,
          truncate: true,
        }}
        CustomHeader={(props) => <CustomHeader {...props} />}
        columnSettings={{
          enabled: true,
          onChange: (clumns) => {
            setHasUpdated(true);
            setColumns(clumns);
          },
          defaultColumns: columns,
          frozenColumnsEnabled: true,
        }}
      />
    </>
  );
};

export default Location;
