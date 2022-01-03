import React, { useEffect, useState } from "react";
import ProjectHeader from "apollo-react/components/ProjectHeader";

const PageHeader = ({ height = 120 }) => {
  const menuItems = [
    {
      label: "Protocol Nmber",
      value: "D1234C12343",
    },
    { label: "Sponsor", value: "CureAll Pharma" },
    { label: "Project Code", value: "ABC12345" },
    { label: "Study Status", value: "Not yet enrolling" },
    { label: "Vendors", value: 3 },
    { label: "Data Flows", value: 8 },
    {
      label: "Datasets",
      value: 85,
    },
  ];
  return (
    <div style={{ height }}>
      <ProjectHeader
        menuItems={menuItems}
        maxCellWidth={280}
        style={{ height: 64 }}
      />
    </div>
  );
};

export default PageHeader;
