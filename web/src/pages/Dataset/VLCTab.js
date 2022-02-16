import React, { useState, useContext, useEffect } from "react";
// import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Table, {
  numberSearchFilter,
  createStringSearchFilter,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import FilterIcon from "apollo-react-icons/Filter";
import Link from "apollo-react/components/Link";
import Modal from "apollo-react/components/Modal";
import Search from "apollo-react/components/Search";
import Tag from "apollo-react/components/Tag";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";

import Progress from "../../components/Common/Progress/Progress";
// import { MessageContext } from "../../components/Providers/MessageProvider";
import { getVLCData } from "../../store/actions/DataSetsAction";
import {
  createAutocompleteFilter,
  IntegerFilter,
  TextFieldFilter,
  createStringArraySearchFilter,
} from "../../utils/index";
import exportToCSVWithoutFilter from "../../utils/downloadData";

export default function VLCTab() {
  const [selectedRow, setSelectedRow] = useState(null);
  // const messageContext = useContext(MessageContext);
  const [isViewData, setIsViewData] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  // const history = useHistory();
  const dispatch = useDispatch();
  const dataSets = useSelector((state) => state.dataSets);
  const { loading, VLCData } = dataSets;
  // const getData = async () => {
  //   // const data = await getVLCDataList();
  //   // console.log("data", data);
  //   dispatch(getVLCData());
  //   // setRowData([...data]);
  //   // setLoading(false);
  //   // return data;
  // };

  useEffect(() => {
    dispatch(getVLCData());
    // console.log("data", Data);
  }, []);

  useEffect(() => {
    setRowData([...VLCData]);
    // console.log(VLCData);
  }, [loading]);

  const searchRows = async (e) => {
    // eslint-disable-next-line prefer-destructuring
    setSearchValue(e.target.value);
    const value = await e.target.value?.toLowerCase();
    const filteredRows = rowData?.filter((rw) => {
      return (
        rw?.errMsg?.toLowerCase().includes(value) ||
        rw?.ruleExp?.toLowerCase().includes(value)
      );
    });
    setRowData([...filteredRows]);
    // console.log(filteredRows, "filteredRows");
    // setFilteredRows([...filteredRows]);
  };

  const StatusCell = ({ row, column: { accessor } }) => {
    const description = row[accessor];
    return (
      <Tag
        style={{ marginRight: 10 }}
        label={description}
        color={description === "Active" ? "#00c221" : "#999999"}
      />
    );
  };

  const hanldeView = (row) => {
    setSelectedRow(row);
    setIsViewData(true);
  };

  const hideViewData = () => {
    setSelectedRow(null);
    setIsViewData(false);
  };

  const LinkCell = ({ row }) => {
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <Link onClick={() => hanldeView(row)}>View</Link>;
  };

  const downloadTable = () => {
    // exportToCSVWithoutFilter(rowData, "VLCData.xlsx", "data");
  };

  const menuItems = [
    {
      text: "Download Table",
      onClick: downloadTable,
    },
  ];

  const CustomButtonHeader = ({ toggleFilters }) => (
    <div>
      <Search
        placeholder="Search"
        size="small"
        onChange={searchRows}
        value={searchValue}
        style={{ marginTop: "-5px", marginBottom: 0, marginRight: "15px" }}
        disabled
      />
      <Button
        size="small"
        variant="secondary"
        icon={FilterIcon}
        onClick={toggleFilters}
      >
        Filter
      </Button>
      <IconMenuButton id="actions-2" menuItems={menuItems} size="small">
        <EllipsisVertical />
      </IconMenuButton>
    </div>
  );

  const columns = [
    {
      header: "Rule ID",
      accessor: "ruleId",
      sortFunction: compareStrings,
      filterFunction: numberSearchFilter("ruleId"),
      filterComponent: IntegerFilter,
      width: "5%",
    },
    {
      header: "Version",
      accessor: "versionNo",
      frozen: false,
      sortFunction: compareNumbers,
      filterFunction: numberSearchFilter("versionNo"),
      filterComponent: IntegerFilter,
    },
    {
      header: "Type",
      accessor: "type",
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("type"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            rowData.map((r) => ({ label: r.type })).map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Action",
      accessor: "action",
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("action"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            rowData.map((r) => ({ label: r.action })).map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "EM Code",
      accessor: "emCode",
      sortFunction: compareStrings,
      filterFunction: createStringSearchFilter("emCode"),
      filterComponent: TextFieldFilter,
    },
    {
      header: "Rule Sequence",
      accessor: "ruleSeq",
      frozen: false,
      sortFunction: compareNumbers,
      filterFunction: numberSearchFilter("ruleSeq"),
      filterComponent: IntegerFilter,
    },
    {
      header: "Rule Expression",
      accessor: "ruleExp",
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("ruleExp"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            rowData.map((r) => ({ label: r.ruleExp })).map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
      width: "25%",
    },
    {
      header: "Error Message",
      accessor: "errMsg",
      frozen: false,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("errMsg"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            rowData.map((r) => ({ label: r.errMsg })).map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      header: "Status",
      accessor: "status",
      customCell: StatusCell,
      sortFunction: compareStrings,
      filterFunction: createStringArraySearchFilter("status"),
      filterComponent: createAutocompleteFilter(
        Array.from(
          new Set(
            rowData.map((r) => ({ label: r.status })).map((item) => item.label)
          )
        )
          .map((label) => {
            return { label };
          })
          .sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            }
            if (a.label > b.label) {
              return 1;
            }
            return 0;
          })
      ),
    },
    {
      accessor: "id",
      customCell: LinkCell,
    },
  ];

  return (
    <div className="vlc-table">
      {loading ? (
        <Progress />
      ) : (
        <>
          <Table
            title="Value Level Conformance (VLC) Rules"
            columns={columns}
            rows={rowData}
            isLoading={loading}
            rowId="id"
            initialSortedColumn="ruleId"
            initialSortOrder="asc"
            rowsPerPageOptions={[10, 50, 100, "All"]}
            hasScroll={true}
            maxHeight="calc(100vh - 293px)"
            tablePaginationProps={{
              labelDisplayedRows: ({ from, to, count }) =>
                `${count === 1 ? "Item " : "Items"} ${from}-${to} of ${count}`,
              truncate: true,
            }}
            CustomHeader={(props) => <CustomButtonHeader {...props} />}
          />
        </>
      )}
      <Modal
        open={isViewData}
        title={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <>
            VLC Rule
            {selectedRow?.status ? (
              <Tag
                style={{ marginLeft: 10 }}
                color={selectedRow.status === "Active" ? "#00c221" : "#999999"}
                label={selectedRow.status}
              />
            ) : (
              ""
            )}
          </>
        }
        onClose={hideViewData}
        message={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <>
            <div className="vlc-modal">
              <div className="first-row">
                <div>
                  <div className="vlc-title">Rule ID</div>
                  <div className="vlc-data">{selectedRow?.ruleId || ""}</div>
                </div>
                <div>
                  <div className="vlc-title">Version</div>
                  <div className="vlc-data">{selectedRow?.versionNo || ""}</div>
                </div>
              </div>
              <div className="second-row">
                <div>
                  <div className="vlc-title">Type</div>
                  <div className="vlc-data">{selectedRow?.type || ""}</div>
                </div>
                <div>
                  <div className="vlc-title">Action</div>
                  <div className="vlc-data">{selectedRow?.action || ""}</div>
                </div>
                <div>
                  <div className="vlc-title">EM Code</div>
                  <div className="vlc-data">{selectedRow?.emCode || ""}</div>
                </div>
                <div>
                  <div className="vlc-title">Rule Sequence</div>
                  <div className="vlc-data">{selectedRow?.ruleSeq || ""}</div>
                </div>
              </div>
              <div className="third-row">
                <div className="vlc-title">Rule Expression</div>
                <div className="vlc-data">{selectedRow?.ruleExp || ""}</div>
              </div>
              <div className="forth-row">
                <div className="vlc-title">Error Message</div>
                <div className="vlc-data">{selectedRow?.errMsg || ""}</div>
              </div>
            </div>
          </>
        }
        buttonProps={[{ label: "Ok", onClick: hideViewData }]}
        id="deleteDataFlow"
      />
    </div>
  );
}
