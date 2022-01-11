import React, { useEffect, useState } from "react";
import ProjectHeader from "apollo-react/components/ProjectHeader";
import { useSelector } from "react-redux";

const PageHeader = ({ height = 120 }) => {
  const [stateMenuItems, setStateMenuItems] = useState([]);

  const dashboardData = useSelector((state) => state.dashboard);

  useEffect(() => {
    const { selectedCard, vendors, dataFlows, dataSets } = dashboardData;
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
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataflowId: "a0A0E00000322XRUAY",
        user_id: "u1112428",
      }),
    };
    fetch("http://localhost:4001/v1/api/dataflow/hard-delete", requestOptions)
      .then((response) => response.json())
      .then((data) => console.log("Data", data));
  }, [dashboardData]);

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
