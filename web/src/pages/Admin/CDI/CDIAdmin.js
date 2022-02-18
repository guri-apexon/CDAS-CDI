import React, { useState } from "react";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import Typography from "apollo-react/components/Typography";

import CDTList from "./CDT/CDTList";

import "./CDIAdmin.scss";

const CDIAdmin = () => {
  const [value, setValue] = useState(1);

  const handleChangeTab = (event, v) => {
    setValue(v);
  };

  return (
    <main>
      <div>
        <Typography className="contentTitle" variant="title1" gutterBottom>
          Ingestion Dashboard
        </Typography>
        {/* <div>
                <button onClick={downloadTemplate}>export template</button>
              </div> */}
        <Tabs value={value} onChange={handleChangeTab} truncate>
          <Tab label="Locations" />
          <Tab label="Clinical Data Types" />
          <Tab label="Callback URL" />
          <Tab label="System Settings" />
        </Tabs>
        <div style={{ padding: 20 }}>
          {value === 0 && <CDTList />}
          {value === 1 && <CDTList />}
          {value === 2 && <CDTList />}
          {value === 3 && <CDTList />}
        </div>
      </div>
    </main>
  );
};

export default CDIAdmin;
