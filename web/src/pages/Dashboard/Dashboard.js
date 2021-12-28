import React, { useState, useEffect } from "react";
// import clsx from "clsx";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core/styles";
// import CssBaseline from "@material-ui/core/CssBaseline";
// import Box from "apollo-react/components/Box";
import Card from "apollo-react/components/Card";
import CardContent from "apollo-react/components/CardContent";
import Panel from "apollo-react/components/Panel";
import { neutral1, neutral7 } from "apollo-react/colors";
// import Drawer from "@material-ui/core/Drawer";
import Divider from "apollo-react/components/Divider";
// import IconButton from "@material-ui/core/IconButton";
// import ChevronLeftIcon from "apollo-react-icons/ChevronLeft";
// import ChevronRightIcon from "apollo-react-icons/ChevronRight";
import Typography from "apollo-react/components/Typography";
// import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
// import IconMenuButton from "apollo-react/components/IconMenuButton";
// import Tooltip from "apollo-react/components/Tooltip";
import Search from "apollo-react/components/Search";
import { useHistory } from "react-router-dom";
import { getUserInfo } from "../../utils/index";
import { ReactComponent as PriorityIcon } from "./priority.svg";
import { ReactComponent as IngestionIcon } from "./issue.svg";
import { ReactComponent as StaleFilesIcon } from "./sync.svg";

// import AppFooter from "../../components/AppFooter/AppFooter";
import PageHeader from "../../components/DataFlow/PageHeader";

import "./Dashboard.scss";

const Dashboard = () => {
  const styles = {
    root: {
      display: "flex",
      height: "100vh",
      backgroundColor: neutral1,
      boxSizing: "content-box",
    },
    leftPanel: {
      maxWidth: "calc(100vh - 120px)",
    },
    panelTitle: {
      padding: "24px 24px 0px 24px",
      fontWeight: 600,
      marginBottom: 0,
      fontSize: "16px",
    },
    panelSubtitle: {
      padding: "0px 24px 0px 24px",
      color: neutral7,
      lineHeight: "24px",
      fontSize: "14px",
    },
    pinTitle: {
      margin: "20px",
    },
    searchBox: {
      margin: "20px",
      marginTop: "5px",
      width: "calc(100% - 40px)",
    },
    card: {
      margin: "16px 16px 16px 21px",
      cursor: "pointer",
      boxShadow: "0px 4px 16px 0px rgba(0,0,0,0.04)",
      backgroundColor: "#ffffff",
      border: "1px solid #E9E9E9",
      maxWidth: 354,
    },
    cardHighlight: {
      border: "1px solid #0768FD",
      boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.08)",
    },
    cardProtocolNo: {
      color: neutral7,
      lineHeight: "24px",
    },
    cardSponsor: {
      color: neutral7,
      lineHeight: "24px",
      fontSize: "14px",
      marginBottom: "24px",
    },
    cardProjectCode: {
      color: neutral7,
      lineHeight: "24px",
    },
    cardPhase: {
      color: neutral7,
      lineHeight: "24px",
    },
    bold: {
      fontWeight: 600,
    },
    page: {
      padding: 24,
    },
    pinnedCards: {
      overflow: "auto",
      maxHeight: "calc(50vh - 260px)",
    },
    unPinnedCards: {
      paddingTop: 5,
      overflow: "auto",
      maxHeight: "calc(80vh - 260px)",
    },
  };

  const useStyles = makeStyles(styles);
  const classes = useStyles();
  // const [open, setOpen] = useState(true);
  // const history = useHistory();
  // const userInfo = getUserInfo();
  const [selectedCard, setSelectedCard] = useState(null);
  const [studyList, setStudyList] = useState([]);
  const [unPinnedStudies, setUnPinnedStudies] = useState([
    {
      prot_id: "a020E000005SwPtQAK",
      protocolnumber: "P16-836",
      usr_id: "u1105372",
      sponsorname: "ADDARIO LUNG CANCER MEDICAL INSTIT  [US]",
      phase: "Phase 4",
      protocolstatus: "Closed Follow Up / In Analysis",
      projectcode: "DZA68122",
      priorityCount: 12,
      ingestionCount: 120,
      staleFilesCount: 1,
    },
    {
      prot_id: "a020E000005SwfCQAS",
      protocolnumber: "20150104",
      usr_id: "u1105372",
      sponsorname: "Advaxis, Inc.",
      phase: "",
      protocolstatus: "In Development",
      projectcode: "ZWA22751",
      priorityCount: 5,
      ingestionCount: 500,
      staleFilesCount: 4,
    },
  ]);
  const [pinnedStudies, setPinnedStudies] = useState([
    {
      prot_id: "a020E000005SwPtQAK",
      protocolnumber: "P16-836",
      usr_id: "u1105372",
      sponsorname: "ADDARIO LUNG CANCER MEDICAL INSTIT  [US]",
      phase: "Phase 4",
      protocolstatus: "Closed Follow Up / In Analysis",
      projectcode: "DZA68122",
      priorityCount: 12,
      ingestionCount: 120,
      staleFilesCount: 1,
    },
    {
      prot_id: "a020E000005SwfCQAS",
      protocolnumber: "20150104",
      usr_id: "u1105372",
      sponsorname: "Advaxis, Inc.",
      phase: "",
      protocolstatus: "In Development",
      projectcode: "ZWA22751",
      priorityCount: 5,
      ingestionCount: 500,
      staleFilesCount: 4,
    },
  ]);

  useEffect(() => {
    console.log("");
  }, [studyList]);

  const CustomCard = ({ data, index, isPinned }) => {
    const {
      protocolnumber,
      sponsorname,
      phase,
      priorityCount,
      ingestionCount,
      staleFilesCount,
      protocolstatus,
      projectcode,
    } = data;
    return (
      <Card
        color="dark"
        interactive
        className={classNames(
          classes.card,
          index === selectedCard && classes.cardHighlight
        )}
        onClick={() => setSelectedCard(index)}
      >
        <CardContent>
          <div className="cardTopBar">
            <div className="cardLeft">
              {priorityCount && (
                <span className="priority">
                  <PriorityIcon />
                  {priorityCount}
                </span>
              )}
              {ingestionCount && (
                <span>
                  <IngestionIcon />
                  {ingestionCount}
                </span>
              )}
              {staleFilesCount && (
                <span>
                  <StaleFilesIcon />
                  {staleFilesCount}
                </span>
              )}
            </div>
            <div className="cardRight">
              {isPinned ? <StaleFilesIcon /> : <StaleFilesIcon />}
            </div>
          </div>
          <Typography className={classes.bold}>{protocolnumber}</Typography>
          <Typography className={classes.cardSponsor} variant="caption">
            {sponsorname}
          </Typography>
          <div className="cardBottom">
            <div className="cardPC">
              <Typography className={classes.bold}>Project Code</Typography>
              <Typography className={classes.cardProjectCode} variant="caption">
                {projectcode}
              </Typography>
            </div>
            <div className="cardP">
              <Typography className={classes.bold}>Phase</Typography>
              <Typography className={classes.cardPhase} variant="caption">
                {phase}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <PageHeader />
      <div className={classes.root}>
        <Panel className={classes.leftPanel} width={407}>
          <div>
            <Typography
              variant="title1"
              className={classes.panelTitle}
              gutterBottom
            >
              My Assignments
            </Typography>
            <Typography className={classes.panelSubtitle} variant="caption">
              6 Studies
            </Typography>
            <Search
              className={classes.searchBox}
              placeholder="Search for protocol, project code or sponsor"
            />
            <Divider />
          </div>
          <div>
            <Typography className={classes.pinTitle} variant="caption">
              Pinned Studies
            </Typography>
            <div className={classNames("customScrollbar", classes.pinnedCards)}>
              {pinnedStudies.map((e, index) => (
                <CustomCard
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  data={e}
                  index={`p${index}`}
                  isPinned={true}
                />
              ))}
            </div>
            <Divider />
          </div>
          <div className={classNames("customScrollbar", classes.unPinnedCards)}>
            {unPinnedStudies.map((e, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <CustomCard
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                data={e}
                index={`up${index}`}
                isPinned={false}
              />
            ))}
          </div>
        </Panel>
        <Panel width="100%" hideButton>
          <div className={classes.page}>
            <Typography variant="title1" gutterBottom>
              Card 1 Summary
            </Typography>
            <Typography variant="body1" gutterBottom>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Rhoncus dolor purus non enim praesent elementum facilisis leo vel.
              Risus at ultrices mi tempus imperdiet. Semper risus in hendrerit
              gravida rutrum quisque non tellus. Convallis convallis tellus id
              interdum velit laoreet id donec ultrices. Odio morbi quis commodo
              odio aenean sed adipiscing.
            </Typography>
          </div>
        </Panel>
      </div>
    </>

    // <div className={classes.root}>
    //   <PageHeader />
    //   <CssBaseline />
    //   <Panel width="100%">
    //     <main className={classes.content}>
    //       <div className={classes.toolbar} />
    //       <IconButton
    //         color="inherit"
    //         aria-label="open drawer"
    //         edge="start"
    //         className={classes.iconButton}
    //         onClick={handleDrawer}
    //       >
    //         {open ? (
    //           <ChevronLeftIcon className={classes.icon} />
    //         ) : (
    //           <ChevronRightIcon className={classes.icon} />
    //         )}
    //       </IconButton>

    //       <AppFooter />
    //     </main>
    //   </Panel>
    // </div>
  );
};

export default Dashboard;
