import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import Typography from "apollo-react/components/Typography";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import BreadcrumbsUI from "apollo-react/components/Breadcrumbs";
import Modal from "apollo-react/components/Modal/Modal";
import Paper from "apollo-react/components/Paper/Paper";
import Box from "apollo-react/components/Box";
import usePermission, {
  Categories,
  Features,
  useStudyPermission,
} from "../../components/Common/usePermission";
import "./Header.scss";

const useStyles = makeStyles(() => ({
  breadcrumbs: {
    marginBottom: 16,
    paddingLeft: 0,
    marginLeft: -7,
  },
  contentIcon: {
    color: "#595959",
  },
  contentTitle: {
    color: "#444444",
    fontSize: "16px",
    fontWeight: 500,
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
    subTitle,
    saveBtnLabel,
    saveDisabled,
    hideCancel,
    saveBtn,
    tabs,
    selectedTab,
    onTabChange,
  } = props;
  const [openModal, setopenModal] = useState(false);
  const [tabValue, setTabValue] = useState(selectedTab || 0);
  const classes = useStyles();

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
    setopenModal(true);
  };
  const handleChangeTab = (e, value) => {
    setTabValue(value);
    onTabChange(value);
  };
  return (
    <>
      <Paper className="no-shadow header">
        <Box className="top-content">
          <Breadcrumbs
            className={classes.breadcrumbs}
            breadcrumbItems={props.breadcrumbItems}
          />
          <div className="flex justify-between">
            <div>
              <div className="flex">
                {props.icon}
                <Typography className={classes.contentTitle}>
                  {headerTitle}
                </Typography>
              </div>
              {subTitle && (
                <Typography variant="title1" gutterBottom>
                  {subTitle}
                </Typography>
              )}
              {props.datasetsCount && (
                <Typography className={classes.contentSubTitle}>
                  {`${props.datasetsCount} datasets`}
                </Typography>
              )}
            </div>
            <div>
              <ButtonGroup
                alignItems="right"
                buttonProps={[
                  ...(hideCancel
                    ? []
                    : [
                        {
                          label: "Cancel",
                          onClick: onCancel,
                        },
                      ]),
                  ...(saveBtn
                    ? [saveBtn]
                    : [
                        {
                          variant: "primary",
                          size: "small",
                          label: saveBtnLabel || "Save",
                          disabled: !canUpdateDataFlow || saveDisabled,
                          onClick: () => props.submit(),
                        },
                      ]),
                ]}
              />
            </div>
          </div>
        </Box>

        {tabs && (
          <Tabs
            className="header-tabs"
            value={tabValue}
            onChange={handleChangeTab}
            size="small"
            truncate
          >
            {tabs.map((tab) => (
              <Tab label={tab} />
            ))}
          </Tabs>
        )}

        <Modal
          open={openModal}
          variant="warning"
          onClose={() => setopenModal(false)}
          title="Exit"
          message="Do you really want to exit and discard dataflow changes"
          buttonProps={[
            {
              label: "Discard changes",
              onClick: () => {
                props.close();
                setopenModal(false);
              },
            },
            {
              label: "Continue editing data flow",
              variant: "primary",
              onClick: () => setopenModal(false),
            },
          ]}
          id="success"
        />
      </Paper>
    </>
  );
};

export default Header;
