/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "apollo-react/components/Button";
import Link from "apollo-react/components/Link";
import PlusIcon from "apollo-react-icons/Plus";
import FilterIcon from "apollo-react-icons/Filter";
import Table, {
  createStringSearchFilter,
  compareStrings,
  compareNumbers,
} from "apollo-react/components/Table";
import Tooltip from "apollo-react/components/Tooltip";
import Switch from "apollo-react/components/Switch";
import LocationModal from "../../components/Common/LocationModal";
import { getLocationsData } from "../../store/actions/CDIAdminAction";
import {
  TextFieldFilter,
  createAutocompleteFilter,
  createStringArraySearchFilter,
  createSourceFromKey,
  createStatusArraySearchFilter,
} from "../../utils/index";
import { statusUpdate } from "../../services/ApiServices";

const LinkCell = ({ row, column: { accessor } }) => {
  const value = row[accessor];
  return <Link onClick={() => console.log("clicked")}>{value}</Link>;
};

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
          className="MuiSwitch"
          checked={value === 1 ? true : false}
          onChange={(e) => handleStatusChange(e, row.src_loc_id)}
          size="small"
        />
      </Tooltip>
    );
  };

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
      header: "Connection URL",
      accessor: "cnn_url",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("cnn_url"),
      filterComponent: TextFieldFilter,
      frozen: true,
      width: 150,
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
      filterFunction: createStatusArraySearchFilter("active"),
      filterComponent: createAutocompleteFilter(
        [
          {
            label: "Active",
          },
          {
            label: "Inactive",
          },
        ],
        {
          size: "small",
          multiple: true,
        }
      ),
    },
  ];
};

const TransferLog = () => {
  const dispatch = useDispatch();
  const { locations, loading } = useSelector((state) => state.locations);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [totalLocations, setTotalLocations] = useState(0);
  const [tableRows, setTableRows] = useState([]);
  const [, setHasUpdated] = useState(false);
  const columns = generateColumns(tableRows);
  const [columnsState, setColumns] = useState([...columns]);
  const [locationOpen, setLocationOpen] = useState(false);

  const getData = () => {
    dispatch(getLocationsData("all"));
  };

  const handleStatusChange = async (e, id) => {
    e.preventDefault();
    const value = e.target.checked;
    setStatusUpdating(true);
    const update = await statusUpdate(id, value);
    if (update) {
      getData();
    }
    setStatusUpdating(false);
  };

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
      <Button
        id="addLocationBtn"
        icon={<PlusIcon />}
        onClick={() => setLocationOpen(true)}
        size="small"
        style={{ marginRight: 16 }}
      >
        Add Location
      </Button>
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
      <LocationModal
        locationModalOpen={locationOpen}
        handleModalClose={() => setLocationOpen(false)}
      />
      <Table
        title="Locations"
        isLoading={loading || statusUpdating}
        subtitle={`${totalLocations} locations`}
        columns={columnsState}
        rows={tableRows}
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

export default TransferLog;
