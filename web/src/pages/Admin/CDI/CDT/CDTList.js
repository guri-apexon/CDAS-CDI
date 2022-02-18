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

export default function CDTList() {
  const history = useHistory();
  const messageContext = useContext(MessageContext);
  const [tableRows, setTableRows] = useState([]);
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

  const StatusCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    const id = row.dkId;
    if (data === "Active") {
      return (
        <Tooltip title="Active" disableFocusListener>
          <Switch
            checked={true}
            // onChange={(e) => handleInActivate(e, id)}
            size="small"
          />
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Inactive" disableFocusListener>
        <Switch
          checked={false}
          // onChange={(e) => handleActivate(e, id)}
          size="small"
        />
      </Tooltip>
    );
  };

  const handleMouseOver = (row) => {
    setOpen(!open);
    setCurRow(row);
  };

  const handleMouseOut = () => {
    setOpen(false);
  };

  const LinkCell = ({ row, column: { accessor } }) => {
    const rowValue = row[accessor];
    const id = row.dkId;
    // if (rowValue.length > 30) {
    //   return (
    //     <Link
    //       onMouseOver={() => handleMouseOver(row)}
    //       onMouseOut={handleMouseOut}
    //       onClick={(e) => goToCDT(e, id)}
    //     >
    //       {`${rowValue.slice(0, 30)}  [...]`}
    //     </Link>
    //   );
    // }
    // return <Link onClick={(e) => goToCDT(e, id)}>{rowValue}</Link>;
    return <></>;
  };

  const DespCell = ({ row, column: { accessor } }) => {
    const data = row[accessor];
    if (data === null || data === "") {
      return <></>;
    }
    // if (data.length < 50) {
    return <>{data}</>;
    // }
    // return (
    //   <>
    //     {data.slice(0, 50)}
    //     <Link
    //       onMouseOver={() => handleMouseOver(row)}
    //       onMouseOut={handleMouseOut}
    //     >
    //       {`  [...]`}
    //     </Link>
    //   </>
    // );
  };

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

  const columns = [
    {
      header: "",
      accessor: "dkId",
      hidden: true,
    },
    {
      header: "Clinical Data Name",
      accessor: "dkName",
      customCell: LinkCell,
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
      customCell: DespCell,
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
      customCell: StatusCell,
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

  const getTableData = React.useMemo(
    () => (
      <>
        {loading ? (
          // <Progress />
          <></>
        ) : (
          <>
            <Table
              isLoading={loading}
              title="Clinical Data Types"
              subtitle={`${tableRows.length} items`}
              columns={columns}
              rows={tableRows}
              rowId="dkId"
              hasScroll={true}
              maxHeight="calc(100vh - 162px)"
              initialSortedColumn="dkName"
              initialSortOrder="asc"
              rowsPerPageOptions={[10, 50, 100, "All"]}
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
    [tableRows, loading, ensList]
  );

  return (
    <div className="cdt-list-wrapper">
      {/* <div className="page-header">
        <Typography variant="h2" gutterBottom>
          CDI Admin
        </Typography>
      </div> */}
      <div className="cdt-table">
        <div className="table">{getTableData}</div>
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
