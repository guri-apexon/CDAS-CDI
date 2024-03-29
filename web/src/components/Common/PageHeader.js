import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import ProjectHeader from "apollo-react/components/ProjectHeader";
import { useSelector } from "react-redux";

const PageHeader = ({ height = 120 }) => {
  const [stateMenuItems, setStateMenuItems] = useState([]);
  const history = useHistory();
  const location = useLocation();

  const dashboard = useSelector((state) => state.dashboard);
  const { selectedCard, selectedDFId } = dashboard;

  useEffect(() => {
    const updateData = [
      { label: "Protocol Number", value: selectedCard?.protocolnumber },
      { label: "Sponsor", value: selectedCard?.sponsorname },
      { label: "Project Code", value: selectedCard?.projectcode },
      { label: "Study Status", value: selectedCard?.protocolstatus },
      { label: "Vendors", value: selectedCard?.vCount },
      { label: "Data Flows", value: selectedCard?.dfCount },
      { label: "Datasets", value: selectedCard?.dsCount },
    ];
    setStateMenuItems([...updateData]);
  }, [dashboard]);

  useEffect(() => {
    if (location.pathname !== "/dashboard") {
      if (selectedCard?.prot_id === "") {
        history.push("/dashboard");
      }
    }
  }, [location]);

  return (
    <>
      <div style={{ height, zIndex: "1201" }} className="dataflow-header">
        <ProjectHeader
          menuItems={stateMenuItems}
          maxCellWidth={280}
          style={{ height: 64, zIndex: 998 }}
        />
      </div>
    </>
  );
};

export default PageHeader;
