import React, { useEffect, useState } from "react";
import ProjectHeader from "apollo-react/components/ProjectHeader";
import { useSelector } from "react-redux";
import Banner from "apollo-react/components/Banner";
import { MessageContext } from "../Providers/MessageProvider";

const PageHeader = ({ height = 120 }) => {
  const [stateMenuItems, setStateMenuItems] = useState([]);
  const messageContext = React.useContext(MessageContext);

  const dashboard = useSelector((state) => state.dashboard);

  useEffect(() => {
    const { selectedCard } = dashboard;
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

  return (
    <>
      <div style={{ height, zIndex: "1201" }} className="dataflow-header">
        <ProjectHeader
          menuItems={stateMenuItems}
          maxCellWidth={280}
          style={{ height: 64, zIndex: 998 }}
        />
      </div>
      <Banner
        variant={messageContext.errorMessage.variant}
        open={messageContext.errorMessage.show}
        onClose={messageContext.bannerCloseHandle}
        message={messageContext.errorMessage.messages}
        id={`Message-Banner--${messageContext.errorMessage.variant}`}
        className="Message-Banner"
      />
    </>
  );
};

export default PageHeader;
