import React, { useState } from "react";
import Tab from "apollo-react/components/Tab";
import Tabs from "apollo-react/components/Tabs";
import Typography from "apollo-react/components/Typography";

import CDTList from "./CDT/CDTList";
import Callback from "./Callback/Callback";
import Location from "./Location/Location";
import SystemSettings from "./Settings/SystemSettings";

import usePermission, {
  Categories,
  Features,
} from "../../components/Common/usePermission";

import "./CDIAdmin.scss";

const CDIAdmin = () => {
  const { canRead: canReadClinicalData } = usePermission(
    Categories.CONFIGURATION,
    Features.CLINICAL_DATA_TYPE_SETUP
  );
  const { canRead: canReadSystemSettings } = usePermission(
    Categories.CONFIGURATION,
    Features.SYSTEM_SETTINGS
  );

  const [value, setValue] = useState(0);

  const handleChangeTab = (event, v) => {
    setValue(v);
  };

  return (
    <main className="cdi-page-wrapper">
      <div className="page-header">
        <Typography style={{ fontSize: "24px" }} variant="h2" gutterBottom>
          CDI Admin
        </Typography>
        <Tabs
          value={value}
          onChange={handleChangeTab}
          style={{ padding: "0px 24px" }}
          truncate
        >
          <Tab label="Locations" />
          <Tab label="Clinical Data Types" disabled={!canReadClinicalData} />
          <Tab label="Callback URL" />
          <Tab label="System Settings" disabled={!canReadSystemSettings} />
        </Tabs>
      </div>

      <div style={{ padding: 20 }}>
        {value === 0 && <Location />}
        {value === 1 && canReadClinicalData && <CDTList />}
        {value === 2 && <Callback />}
        {value === 3 && canReadSystemSettings && <SystemSettings />}
      </div>
    </main>
  );
};

export default CDIAdmin;
