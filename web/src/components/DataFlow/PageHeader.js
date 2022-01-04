import React, { useEffect, useState } from "react";
import ProjectHeader from "apollo-react/components/ProjectHeader";
import { useSelector } from "react-redux";

const PageHeader = ({ height = 120 }) => {
  const [stateMenuItems, setStateMenuItems] = useState([]);

  const dashboardData = useSelector((state) => state.dashboard);

  useEffect(() => {
    const { selectedCard } = dashboardData;
    const updateData = [
      {
        label: "Protocol Nmber",
        value: selectedCard.protocolnumber,
      },
      { label: "Sponsor", value: selectedCard.sponsorname },
      { label: "Project Code", value: selectedCard.projectcode },
      { label: "Study Status", value: selectedCard.protocolstatus },
      { label: "Vendors", value: selectedCard.vendors },
      { label: "Data Flows", value: selectedCard.dataFlows },
      {
        label: "Datasets",
        value: selectedCard.dataSets,
      },
    ];
    setStateMenuItems([...updateData]);
  }, [dashboardData]);

  const emptyMenuItems = [
    {
      label: "Protocol Nmber",
      value: "",
    },
    { label: "Sponsor", value: "" },
    { label: "Project Code", value: "" },
    { label: "Study Status", value: "" },
    { label: "Vendors", value: 0 },
    { label: "Data Flows", value: 0 },
    {
      label: "Datasets",
      value: 0,
    },
  ];
  // const menuItems = [
  //   {
  //     label: "Protocol Nmber",
  //     value: "D1234C12343",
  //   },
  //   { label: "Sponsor", value: "CureAll Pharma" },
  //   { label: "Project Code", value: "ABC12345" },
  //   { label: "Study Status", value: "Not yet enrolling" },
  //   { label: "Vendors", value: 3 },
  //   { label: "Data Flows", value: 8 },
  //   {
  //     label: "Datasets",
  //     value: 85,
  //   },
  // ];

  return (
    <div style={{ height, zIndex: "1201" }}>
      <ProjectHeader
        menuItems={stateMenuItems}
        maxCellWidth={280}
        style={{ height: 64, zIndex: 998 }}
      />
    </div>
  );
};

export default PageHeader;
