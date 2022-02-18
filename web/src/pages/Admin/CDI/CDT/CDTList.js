/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table, {
  createSelectFilterComponent,
  createStringSearchFilter,
  compareStrings,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import PlusIcon from "apollo-react-icons/Plus";
import Peek from "apollo-react/components/Peek";
import FilterIcon from "apollo-react-icons/Filter";
import Link from "apollo-react/components/Link";
import Tooltip from "apollo-react/components/Tooltip";
import { useHistory } from "react-router-dom";
import Switch from "apollo-react/components/Switch";
import Typography from "apollo-react/components/Typography";

import { MessageContext } from "../../../../components/Providers/MessageProvider";

import {
  TextFieldFilter,
  createSourceFromKey,
  createAutocompleteFilter,
  createStringArraySearchFilter,
} from "../../../../utils/index";
import { getCDTList } from "../../../../store/actions/CDIAdminAction";

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
          onChange={(e) => handleStatusChange(e, row.dkId)}
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
      width: "20%",
    },
    {
      header: "Description",
      accessor: "dkDesc",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("dkDesc"),
      filterComponent: TextFieldFilter,
      width: "35%",
    },
    {
      header: "External System",
      accessor: "dkESName",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("dkESName"),
      filterComponent: createAutocompleteFilter(
        createSourceFromKey(tableRows, "dkESName")
      ),
      width: "25%",
    },
    {
      header: "Status",
      accessor: "dkStatus",
      customCell: StatusCell(handleStatusChange),
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("dkStatus"),
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
      width: "10%",
    },
  ];
};

export default function CDTList() {
  const history = useHistory();
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

  const handleStatusChange = () => {};

  const handleLink = () => {};

  useEffect(() => {
    setTableRows(cdtList);
    const col = generateColumns(cdtList, handleStatusChange, handleLink);
    setColumns([...col]);
  }, [loading, cdtList]);

  // const goToCDT = (e, id) => {
  //   e.preventDefault();
  //   // selectCDT(id);
  //   history.push(`/cdt/edit/${id}`);
  // };

  // const handleInActivate = async (e, id) => {
  //   e.preventDefault();
  //   const update = await statusUpdate(id, 0);
  //   if (update) {
  //     console.log(update.data);
  //     if (update.status === 0) {
  //       messageContext.showErrorMessage(update.data, 56);
  //     }
  //     getData();
  //   }
  // };

  // const handleActivate = async (e, id) => {
  //   e.preventDefault();
  //   const update = await statusUpdate(id, 1);
  //   if (update) {
  //     getData();
  //   }
  // };

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

  // const getTableData = React.useMemo(
  //   () => (
  //     <>
  //       {loading ? (
  //         // <Progress />
  //         <></>
  //       ) : (
  //         <>
  //           <Table
  //             isLoading={loading}
  //             title="Clinical Data Types"
  //             subtitle={`${tableRows.length} items`}
  //             columns={columns}
  //             rows={tableRows}
  //             rowId="dkId"
  //             hasScroll={true}
  //             maxHeight="calc(100vh - 162px)"
  //             rowsPerPageOptions={[10, 50, 100, "All"]}
  //             tablePaginationProps={{
  //               labelDisplayedRows: ({ from, to, count }) =>
  //                 `${
  //                   count === 1 ? "Item " : "Items"
  //                 } ${from}-${to} of ${count}`,
  //               truncate: true,
  //             }}
  //             showFilterIcon
  //             CustomHeader={(props) => (
  //               <CustomButtonHeader {...props} addCDT={handleAddCDT} />
  //             )}
  //           />
  //         </>
  //       )}
  //     </>
  //   ),
  //   [tableRows, loading]
  // );

  return (
    <div className="cdt-list-wrapper">
      {/* <div className="page-header">
        <Typography variant="h2" gutterBottom>
          CDI Admin
        </Typography>
      </div> */}
      <div className="cdt-table">
        <div className="table">
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
            tablePaginationProps={{
              labelDisplayedRows: ({ from, to, count }) =>
                `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
              truncate: true,
            }}
            showFilterIcon
            CustomHeader={(props) => (
              <CustomButtonHeader {...props} addCDT={handleAddCDT} />
            )}
          />
        </div>
        <Peek
          open={open}
          followCursor
          placement="bottom"
          content={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <div style={{ maxWidth: 400 }}>
              <Typography
                variant="title2"
                gutterBottom
                style={{ fontWeight: 600 }}
              >
                Description
              </Typography>
              <Typography variant="body2">{curRow.vDescription}</Typography>
            </div>
          }
        />
      </div>
    </div>
  );
}
