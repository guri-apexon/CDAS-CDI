import React, { useEffect } from "react";
import Typography from "apollo-react/components/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import { useDispatch, useSelector } from "react-redux";
import { getFlowDetailsOfStudy } from "../../store/actions/DashboardAction";

import DataFlowTable from "./DataFlowTable";

const styles = {
  content: {
    flexGrow: 1,
    background: "#f6f7fb",
    minHeight: "calc(100vh - 125px)",
    maxWidth: "calc(100vw - 425px)",
  },
  contentHeader: {
    paddingTop: 11,
    padding: "16px 25px 0px 25px",
    backgroundColor: "#ffffff",
  },
  contentTitle: {
    padding: "20px 0px",
    fontSize: 20,
    lineHeight: "22px",
    fontWeight: 500,
  },
};

const RightPanel = () => {
  const [value, setValue] = React.useState(1);
  const useStyles = makeStyles(styles);
  const dashboard = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();

  const classes = useStyles();

  // eslint-disable-next-line no-shadow
  const handleChangeTab = (event, value) => {
    setValue(value);
  };

  useEffect(() => {
    // dispatch(getFlowDetailsOfStudy(dashboard.selectedCard.prot_id));
    dispatch(getFlowDetailsOfStudy("a020E000005SwPtQAK"));
  }, [value, dashboard.selectedCard]);

  return (
    <main className={classes.content}>
      <div className={classes.contentHeader}>
        <Typography
          className={classes.contentTitle}
          variant="title1"
          gutterBottom
        >
          Ingestion Dashboard
        </Typography>
        <Tabs value={value} onChange={handleChangeTab} truncate>
          <Tab label="Monitor" />
          <Tab label="Data Flows" />
          {/* <Tab label="Tab Header 3" /> */}
        </Tabs>
      </div>

      <div style={{ padding: 20 }}>
        {value === 0 && (
          <>
            <Typography variant="body2"> Monitor page content</Typography>
          </>
        )}
        {value === 1 && (
          <>
            <DataFlowTable />
          </>
        )}
      </div>
    </main>
  );
};

export default RightPanel;
