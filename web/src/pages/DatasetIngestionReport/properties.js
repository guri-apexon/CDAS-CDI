import React from "react";

import Paper from "apollo-react/components/Box";
import Typography from "apollo-react/components/Typography";

const Properties = () => {
  return (
    <Paper style={{ padding: 24 }} id="properties-box">
      <div className="panel-header">
        <Typography variant="title1" style={{ fontSize: 16 }} gutterBottom>
          Dataset Properties
        </Typography>
      </div>
    </Paper>
  );
};

export default Properties;
