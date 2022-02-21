/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table, {
  createStringSearchFilter,
  compareStrings,
  compareNumbers,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";
import FilterIcon from "apollo-react-icons/Filter";
import Link from "apollo-react/components/Link";
import Tooltip from "apollo-react/components/Tooltip";
import { useHistory } from "react-router-dom";
import Switch from "apollo-react/components/Switch";
import Typography from "apollo-react/components/Typography";

import Progress from "../../../../components/Common/Progress/Progress";
import { MessageContext } from "../../../../components/Providers/MessageProvider";
import {
  TextFieldFilter,
  createSourceFromKey,
  createAutocompleteFilter,
  createStatusArraySearchFilter,
  createStringArraySearchFilter,
} from "../../../../utils/index";
import { getCDTList } from "../../../../store/actions/CDIAdminAction";
import { activateDK, inActivateDK } from "../../../../services/ApiServices";

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
    const id = row.dkId;
    return <Link onClick={(e) => handleLink(e, id)}>{rowValue}</Link>;
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
      header: "External System",
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
      width: 120,
    },
  ];
};

export default function CDTList() {
  const messageContext = useContext(MessageContext);
  const [tableRows, setTableRows] = useState([]);
  const columns = generateColumns(tableRows);
  const [columnsState, setColumns] = useState([...columns]);
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({});
  const dispatch = useDispatch();
  const { cdtList, loading } = useSelector((state) => state.cdiadmin);
  const ensList = [];

  const getData = () => {
    dispatch(getCDTList());
  };

  useEffect(() => {
    setTableRows(cdtList);
  }, [loading, cdtList]);

  useEffect(() => {
    getData();
  }, []);

  const handleStatusChange = async (e, dkId, currStatus) => {
    e.preventDefault();
    if (currStatus === 0) {
      await activateDK(dkId, 1);

      getData();
    } else {
      const update = await inActivateDK(dkId, 0);
      if (update) {
        // console.log(update.data);
        if (update.status === 0) {
          messageContext.showErrorMessage(update.data);
        } else {
          getData();
        }
      }
    }
  };

  const handleLink = () => {};

  useEffect(() => {
    setTableRows(cdtList);
    const col = generateColumns(cdtList, handleStatusChange, handleLink);
    setColumns([...col]);
  }, [loading, cdtList]);

  const handleAddCDT = () => {
    // dispatch(createCDT());
    // history.push("/cdt/create");
  };

  const CustomButtonHeader = ({ toggleFilters, addCDT }) => (
    <div>
      <Button
        size="small"
        variant="secondary"
        icon={PlusIcon}
        onClick={addCDT}
        style={{ marginRight: "8px", border: "none" }}
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
      <div>
        <div>Edit Clinical Data Type</div>
      </div>
    </div>
  );
}
