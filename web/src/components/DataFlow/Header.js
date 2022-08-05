// libraries
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
// components
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import Modal from "apollo-react/components/Modal/Modal";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import Typography from "apollo-react/components/Typography";
import SaveChangesModal from "./SaveChangesModal";
// helpers
import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../Common/usePermission";

const useStyles = makeStyles(() => ({
  breadcrumbs: {
    marginBottom: 16,
    paddingLeft: 0,
  },
  contentIcon: {
    color: "#595959",
  },
  contentTitle: {
    color: "#000000",
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: 0,
    lineHeight: "24px",
    marginLeft: "8px",
    marginBottom: "8px",
  },
  contentSubTitle: {
    color: "#000000",
    fontSize: "14px",
    paddingLeft: 11,
    letterSpacing: 0,
    lineHeight: "24px",
  },
}));

const Breadcrumbs = (props) => {
  const items = props.breadcrumbItems ?? [];
  return (
    <BreadcrumbsUI
      className={props.className}
      id="dataflow-breadcrumb"
      items={items}
    />
  );
};

const Header = (props) => {
  const {
    headerTitle,
    saveBtnLabel,
    saveDisabled,
    shouldDisplaySaveChangesModal = true,
  } = props;
  const classes = useStyles();
  const [openModal, setOpenModal] = useState(false);
  const dashboard = useSelector((state) => state.dashboard);
  const { prot_id: protId } = dashboard?.selectedCard;

  const {
    canUpdate: canUpdateDataFlow,
    canCreate: CanCreateDataFlow,
    canRead: canReadDataFlow,
  } = useStudyPermission(
    Categories.CONFIGURATION,
    Features.DATA_FLOW_CONFIGURATION,
    protId
  );

  const onCancel = () => {
    setOpenModal(true);
  };
  return (
    <>
      <Breadcrumbs
        className={classes.breadcrumbs}
        breadcrumbItems={props.breadcrumbItems}
      />
      <div style={{ display: "flex", paddingLeft: 11 }}>
        {props.icon}
        <Typography className={classes.contentTitle}>{headerTitle}</Typography>
      </div>
      {props.datasetsCount && (
        <Typography className={classes.contentSubTitle}>
          {`${props.datasetsCount} datasets`}
        </Typography>
      )}
      {(!props.tabValue || props.tabValue === 0) && (
        <ButtonGroup
          alignItems="right"
          buttonProps={[
            {
              label: "Cancel",
              disabled: !canUpdateDataFlow,
              onClick: onCancel,
            },
            {
              label: saveBtnLabel || "Save",
              disabled: !canUpdateDataFlow || saveDisabled,
              onClick: () => props.submit(),
            },
          ]}
        />
      )}
      {props.tabs && (
        <Tabs
          value={props.tabValue}
          onChange={props.handleChangeTab}
          size="small"
          style={{ marginBottom: "-19px" }}
          truncate
        >
          {props.tabs.map((tab) => (
            <Tab
              label={tab}
              disabled={
                Object.keys(props.selectedDataset).length <= 0 &&
                tab === "Dataset Columns"
              }
            />
          ))}
        </Tabs>
      )}

      <Modal
        open={openModal}
        variant="warning"
        onClose={() => setOpenModal(false)}
        title="Lose your work?"
        message="All unsaved changes will be lost."
        buttonProps={[
          {
            label: "Keep editing",
            onClick: () => setOpenModal(false),
          },
          {
            variant: "primary",
            label: "Leave without saving",
            onClick: () => {
              props.close();
              setOpenModal(false);
            },
          },
        ]}
        id="success"
      />

      {/* Save Modal */}
      {shouldDisplaySaveChangesModal && <SaveChangesModal />}
    </>
  );
};

export default Header;
