import React from "react";
import Typography from "apollo-react/components/Typography";
// import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Paper from "apollo-react/components/Paper";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";

import DataFlowTable from "./DataFlowTable";

const styles = {
  paper: {
    padding: "25px 16px",
  },
};

const classes = withStyles(styles);

const RightPanel = () => {
  const [value, setValue] = React.useState(0);

  // eslint-disable-next-line no-shadow
  const handleChangeTab = (event, value) => {
    setValue(value);
  };
  return (
    <div>
      <Paper className={classes.paper}>
        <Tabs value={value} onChange={handleChangeTab} truncate>
          <Tab label="Monitor" />
          <Tab label="Data Flows" />
          {/* <Tab label="Tab Header 3" /> */}
        </Tabs>
        <div style={{ padding: 24 }}>
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
      </Paper>
    </div>
  );
};

export default RightPanel;
