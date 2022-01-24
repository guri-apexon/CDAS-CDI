import React, { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Table, {
  numberSearchFilter,
  compareNumbers,
  compareStrings,
} from "apollo-react/components/Table";
import Button from "apollo-react/components/Button";
import AutocompleteV2 from "apollo-react/components/AutocompleteV2";
import Tooltip from "apollo-react/components/Tooltip";
import FilterIcon from "apollo-react-icons/Filter";
import Link from "apollo-react/components/Link";
import IconButton from "apollo-react/components/IconButton";
import Tag from "apollo-react/components/Tag";
import Modal from "apollo-react/components/Modal";
import Search from "apollo-react/components/Search";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import { TextField } from "apollo-react/components/TextField/TextField";
import Progress from "../../components/Progress";
import { MessageContext } from "../../components/MessageProvider";
import { getVLCDataList } from "../../services/ApiServices";

const createAutocompleteFilter =
  (source) =>
  ({ accessor, filters, updateFilterValue }) => {
    const ref = React.useRef();
    const [height, setHeight] = React.useState(0);
    const [isFocused, setIsFocused] = React.useState(false);
    const value = filters[accessor];

    React.useEffect(() => {
      const curHeight = ref?.current?.getBoundingClientRect().height;
      if (curHeight !== height) {
        setHeight(curHeight);
      }
    }, [value, isFocused, height]);

    return (
      <div
        style={{
          minWidth: 160,
          maxWidth: 200,
          position: "relative",
          height,
        }}
      >
        <AutocompleteV2
          style={{ position: "absolute", left: 0, right: 0 }}
          value={
            value
              ? value.map((label) => {
                  if (label === "") {
                    return { label: "blanks" };
                  }
                  return { label };
                })
              : []
          }
          name={accessor}
          source={source}
          onChange={(event, value2) => {
            updateFilterValue({
              target: {
                name: accessor,
                value: value2.map(({ label }) => {
                  if (label === "blanks") {
                    return "";
                  }
                  return label;
                }),
              },
            });
          }}
          fullWidth
          multiple
          chipColor="white"
          size="small"
          forcePopupIcon
          showCheckboxes
          limitChips={1}
          filterSelectedOptions={false}
          blurOnSelect={false}
          clearOnBlur={false}
          disableCloseOnSelect
          matchFrom="any"
          showSelectAll
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={ref}
          noOptionsText="No matches"
        />
      </div>
    );
  };

const IntegerFilter = ({ accessor, filters, updateFilterValue }) => {
  return (
    <TextField
      value={filters[accessor]}
      name={accessor}
      onChange={updateFilterValue}
      type="number"
      style={{ width: 74 }}
      margin="none"
      size="small"
    />
  );
};

const createStringArraySearchFilter = (accessor) => {
  return (row, filters) =>
    !Array.isArray(filters[accessor]) ||
    filters[accessor].length === 0 ||
    filters[accessor].some(
      (value) => value.toUpperCase() === row[accessor]?.toUpperCase()
    );
};

export default function VLCTab() {
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const messageContext = useContext(MessageContext);
  const [isViewData, setIsViewData] = useState(false);
  const [rowData, setRowData] = useState([]);

  const history = useHistory();
  const dispatch = useDispatch();

  const getData = async () => {
    const data = await getVLCDataList();
    // console.log("data", data);
    setRowData([...data]);
    setLoading(false);
    // return data;
  };

  useEffect(() => {
    getData();
    // console.log("data", Data);
  }, []);

  const StatusCell = ({ row, column: { accessor } }) => {
    const description = row[accessor];
    return (
      <div style={{ position: "relative" }}>
        <div
          style={{ marginRight: 10 }}
          className={`status-cell ${
            description === "Active" ? "active" : "inActive"
          }`}
        >
          {description}
        </div>
      </div>
    );
  };

  // const StatusCell = ({ row, column: { accessor } }) => {
  //   const description = row[accessor];
  //   return (
  //     <Tag
  //       style={{ marginRight: 10 }}
  //       label={description}
  //       className={`status-cell ${
  //         description === "Active" ? "active" : "inActive"
  //       }`}
  //     />
  //   );
  // };

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

  // const downloadTable = () => {
  //   console.log("downloadTable");
  // };

  // const menuItems = [
  //   {
  //     text: "Download Table",
  //     onClick: downloadTable,
  //   },
  // ];

  const CustomButtonHeader = ({ toggleFilters }) => (
    <div>
      <Search
        placeholder="Search"
        size="small"
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
      {/* <IconMenuButton id="actions-2" menuItems={menuItems} size="small">
        <EllipsisVertical />
      </IconMenuButton> */}
    </div>
  );

  const columns = [
    {
      header: "Rule ID",
      accessor: "ruleId",
      sortFunction: compareStrings,
      filterFunction: numberSearchFilter("ruleId"),
      filterComponent: IntegerFilter,
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
      // filterFunction: createStringArraySearchFilter("emCode"),
      // filterComponent: createAutocompleteFilter(
      //   Array.from(
      //     new Set(
      //       rowData.map((r) => ({ label: r.emCode })).map((item) => item.label)
      //     )
      //   )
      //     .map((label) => {
      //       return { label };
      //     })
      //     .sort((a, b) => {
      //       if (a.label < b.label) {
      //         return -1;
      //       }
      //       if (a.label > b.label) {
      //         return 1;
      //       }
      //       return 0;
      //     })
      // ),
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
      // filterFunction: createStringArraySearchFilter("ruleExp"),
      // filterComponent: createAutocompleteFilter(
      //   Array.from(
      //     new Set(
      //       rowData.map((r) => ({ label: r.ruleExp })).map((item) => item.label)
      //     )
      //   )
      //     .map((label) => {
      //       return { label };
      //     })
      //     .sort((a, b) => {
      //       if (a.label < b.label) {
      //         return -1;
      //       }
      //       if (a.label > b.label) {
      //         return 1;
      //       }
      //       return 0;
      //     })
      // ),
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
      // filterFunction: createStringArraySearchFilter("status"),
      // filterComponent: createAutocompleteFilter(
      //   Array.from(
      //     new Set(
      //       rowData.map((r) => ({ label: r.status })).map((item) => item.label)
      //     )
      //   )
      //     .map((label) => {
      //       return { label };
      //     })
      //     .sort((a, b) => {
      //       if (a.label < b.label) {
      //         return -1;
      //       }
      //       if (a.label > b.label) {
      //         return 1;
      //       }
      //       return 0;
      //     })
      // ),
    },
    {
      accessor: "ruleId",
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
            rowId="ruleId"
            initialSortedColumn="ruleId"
            initialSortOrder="asc"
            rowsPerPageOptions={[10, 50, 100, "All"]}
            hasScroll={true}
            maxHeight="calc(100vh - 293px)"
            maxWidth="calc(100vw - 40px)"
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
            {selectedRow?.status ? <Tag label={selectedRow.status} /> : ""}
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
