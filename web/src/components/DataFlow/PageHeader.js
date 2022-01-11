import React, { useEffect, useState } from "react";
import ProjectHeader from "apollo-react/components/ProjectHeader";
import { useSelector } from "react-redux";

const PageHeader = ({ height = 120 }) => {
  const [stateMenuItems, setStateMenuItems] = useState([]);

  const dashboard = useSelector((state) => state.dashboard);

  useEffect(() => {
    const { selectedCard, vendors, dataFlows, dataSets } = dashboard;
    const updateData = [
      { label: "Protocol Nmber", value: selectedCard.protocolnumber },
      { label: "Sponsor", value: selectedCard.sponsorname },
      { label: "Project Code", value: selectedCard.projectcode },
      { label: "Study Status", value: selectedCard.protocolstatus },
      { label: "Vendors", value: vendors },
      { label: "Data Flows", value: dataFlows },
      { label: "Datasets", value: dataSets },
    ];
    setStateMenuItems([...updateData]);
  }, [dashboard]);

  return (
    <div style={{ height, zIndex: "1201" }} className="dataflow-header">
      <ProjectHeader
        menuItems={stateMenuItems}
        maxCellWidth={280}
        style={{ height: 64, zIndex: 998 }}
      />
    </div>
  );
};

export default PageHeader;
