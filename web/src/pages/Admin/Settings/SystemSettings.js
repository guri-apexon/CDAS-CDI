/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "apollo-react/components/Table";
import Loader from "apollo-react/components/Loader";
import Button from "apollo-react/components/Button";
import Search from "apollo-react/components/Search";
import PlusIcon from "apollo-react-icons/Plus";
import Pencil from "apollo-react-icons/Pencil";
import TextField from "apollo-react/components/TextField";
import Card from "apollo-react/components/Card";
import CardContent from "apollo-react/components/CardContent";
import Typography from "apollo-react/components/Typography";
import IconButton from "apollo-react/components/IconButton";
import ButtonGroup from "apollo-react/components/ButtonGroup";

import { MessageContext } from "../../../components/Providers/MessageProvider";

import {
  saveSettingsData,
  fetchSettingsData,
  removeErrMessage,
} from "../../../store/actions/CDIAdminAction";

import "./SystemSettings.scss";

const CustomHeader = ({
  addSingleRow,
  disableCreateMode,
  onSearch,
  search,
}) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <Search
      placeholder="Search"
      autoFocus={search !== ""}
      id="settingSearch"
      value={search}
      onChange={(e) => onSearch(e.target.value)}
      style={{ marginRight: 8, width: 240, marginTop: 6 }}
      size="small"
    />
    <Button
      id="addLocationBtn"
      icon={<PlusIcon />}
      size="small"
      disabled={disableCreateMode}
      style={{ marginRight: 16 }}
      onClick={addSingleRow}
    >
      Add new setting
    </Button>
  </div>
);

const ActionCell = ({ row }) => {
  const { config_id, onRowEdit } = row;
  return (
    <div style={{ display: "flex", justifyContent: "end" }}>
      <IconButton
        size="small"
        data-id={config_id}
        onClick={() => onRowEdit(config_id)}
        style={{ marginRight: 4 }}
      >
        <Pencil />
      </IconButton>
    </div>
  );
};

const SettingCell = ({ row }) => {
  return (
    <div>
      <Card interactive className="setting-card">
        <CardContent>
          {!row.upsertMode && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <Typography className="setting-name">{row.name}</Typography>
                <Typography className="setting-value" variant="caption">
                  {row.value}
                </Typography>
              </div>
              <div style={{ marginTop: "-10px" }}>
                <ActionCell row={row} />
              </div>
            </div>
          )}
          {row.upsertMode && (
            <div className="setitng-form">
              <ButtonGroup
                buttonProps={[
                  {
                    variant: "text",
                    label: "Cancel",
                    onClick: () => row.onCancel(),
                  },
                  {
                    variant: "primary",
                    label: "Save",
                    disabled: !row.editedRow.name || !row.editedRow.value,
                    onClick: () => row.onSave(),
                  },
                ]}
                alignItems="right"
              />
              <div style={{ maxWidth: 320 }}>
                <TextField
                  fullWidth
                  size="small"
                  name="name"
                  value={row.editedRow.name}
                  onChange={(e) => row.editRow("name", e.target.value)}
                  label="Name of Setting"
                />
              </div>
              <TextField
                fullWidth
                size="small"
                name="value"
                value={row.editedRow.value}
                onChange={(e) => row.editRow("value", e.target.value)}
                label="Setting Value"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const columns = [
  {
    accessor: "setting",
    customCell: SettingCell,
  },
];

const SystemSettings = () => {
  const dispatch = useDispatch();
  const messageContext = useContext(MessageContext);
  const { settings, loading, upserted, upsertLoading, error, success } =
    useSelector((state) => state.cdiadmin);
  const [totalsettings, setTotalSettings] = useState(0);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [editedRow, setEditedRow] = useState({});
  const [disableCreateMode, setDisableCreateMode] = useState(false);

  const getSettings = () => {
    dispatch(fetchSettingsData());
  };

  useEffect(() => {
    getSettings();
    setEditedRow({});
  }, [upserted]);

  useEffect(() => {
    setRows(settings?.records ?? []);
    setTotalSettings(settings.totalSize ?? 0);
  }, [settings]);

  const onSearch = (value) => {
    setSearch(value);
  };

  const addSingleRow = () => {
    const r = [
      {
        config_id: `${rows.length + 1}`,
        name: "",
        value: "",
        newValue: true,
      },
    ];
    setRows([...rows, ...r]);
    setEditedRow(r[0]);
    setDisableCreateMode(true);
  };

  const editRow = (key, value) => {
    setEditedRow({ ...editedRow, [key]: value });
  };

  const onRowEdit = (config_id) => {
    setEditedRow(rows.find((row) => row.config_id === config_id));
    setRows(rows.filter((row) => row.newValue !== true));
  };

  const onCancel = () => {
    setEditedRow({});
    setRows(rows.filter((row) => row.newValue !== true));
    setDisableCreateMode(false);
  };

  const onSave = async () => {
    await dispatch(saveSettingsData(editedRow));
    setDisableCreateMode(false);
  };

  useEffect(() => {
    if (error || success) {
      setTimeout(() => {
        dispatch(removeErrMessage());
      }, 5000);
    }
    if (error) {
      messageContext.showErrorMessage(error);
    }
    if (success) {
      messageContext.showSuccessMessage(success);
    }
  }, [error, success]);

  // console.log("testtes");

  const filteredRow = search
    ? rows?.filter((row) =>
        row.name?.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  return (
    <div className="system-table">
      {upsertLoading && <Loader />}
      <Table
        title="System Settings"
        isLoading={loading}
        className="system-table"
        subtitle={`${filteredRow.length} settings`}
        columns={columns}
        rows={filteredRow.map((row) => ({
          ...row,
          onRowEdit,
          editedRow,
          upsertMode: editedRow && editedRow.config_id === row.config_id,
          editRow,
          onCancel,
          onSave,
        }))}
        rowId="config_id"
        rowProps={{ hover: false }}
        CustomHeader={() => (
          <CustomHeader
            addSingleRow={addSingleRow}
            onSearch={(v) => onSearch(v)}
            search={search}
            disableCreateMode={disableCreateMode}
          />
        )}
        // hidePagination={true}
        rowsPerPageOptions={[50, 100, "All"]}
        tablePaginationProps={{
          labelDisplayedRows: ({ from, to, count }) =>
            `${count === 1 ? "Item" : "Items"} ${from}-${to} of ${count}`,
          truncate: true,
        }}
      />
    </div>
  );
};

export default SystemSettings;
