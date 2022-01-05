import React, { useState, useEffect } from "react";
// import clsx from "clsx";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
// import CssBaseline from "@material-ui/core/CssBaseline";
// import Box from "apollo-react/components/Box";
import Card from "apollo-react/components/Card";
import CardContent from "apollo-react/components/CardContent";
import Panel from "apollo-react/components/Panel";
import { neutral1, neutral7 } from "apollo-react/colors";
import Divider from "apollo-react/components/Divider";
import Typography from "apollo-react/components/Typography";
import Search from "apollo-react/components/Search";
import { ReactComponent as PriorityIcon } from "./priority.svg";
import { ReactComponent as IngestionIcon } from "./issue.svg";
import { ReactComponent as StaleFilesIcon } from "./Stale.svg";
import { ReactComponent as PinnedIcon } from "./Pin.svg";
import { ReactComponent as UnPinnedIcon } from "./UnPin.svg";

import PageHeader from "../../components/DataFlow/PageHeader";
import Progress from "../../components/Progress";
import RightPanel from "./RightPanel";
import { debounceFunction } from "../../utils";
import searchStudy, {
  getPinnedStudies,
  getStudies,
  unPinStudy,
  pinStudy,
} from "../../services/ApiServices";
import { updateSelectedStudy } from "../../store/actions/DashboardAction";

import "./Dashboard.scss";

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
  page: {
    padding: 24,
  },
  content: {
    flexGrow: 1,
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
  searchBar: {
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

const Dashboard = () => {
  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const dispatch = useDispatch();

  const [selectedStudy, setSelectedStudy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studyList, setStudyList] = useState([]);
  const [searchTxt, setSearchTxt] = useState("");
  const [unPinnedStudies, setUnPinnedStudies] = useState([]);
  const [pinnedStudies, setPinnedStudies] = useState([]);
  const [pinned, setPinned] = useState([]);

  const updateList = async () => {
    setLoading(true);
    const newStudies = await getStudies();
    const newPinned = await getPinnedStudies();
    // console.log("event", newPinned, newStudies);
    if (newStudies !== undefined && newStudies.length) {
      setStudyList([...newStudies]);
    }
    if (newStudies !== undefined && newStudies.length) {
      setPinned([...newPinned]);
    }
    setLoading(false);
  };

  useEffect(() => {
    updateList();
  }, []);

  const searchTrigger = (e) => {
    const newValue = e.target.value;
    setSearchTxt(newValue);
    debounceFunction(async () => {
      setLoading(true);
      const newStudies = await searchStudy(newValue);
      console.log("event", newValue, newStudies);
      // eslint-disable-next-line no-unused-expressions
      newStudies && newStudies.studies
        ? setUnPinnedStudies([...newStudies.studies])
        : setUnPinnedStudies([]);
      // eslint-disable-next-line no-unused-expressions
      !newStudies && updateList();
      setLoading(false);
    }, 1000);
  };

  const pinningStudy = async (id) => {
    await pinStudy(id);
    await updateList();
  };

  const unPinningStudy = async (id) => {
    await unPinStudy(id);
    await updateList();
  };

  useEffect(() => {
    const pinnedstudy = studyList.filter((e) => pinned.includes(e.prot_id));
    const unPinnedStudy = studyList.filter((e) => !pinned.includes(e.prot_id));
    setPinnedStudies([...pinnedstudy]);
    setUnPinnedStudies([...unPinnedStudy]);
    // console.log("unpinned", unPinningStudy);
  }, [studyList, pinned]);

  useEffect(() => {
    if (selectedStudy != null) {
      const clicked = studyList.filter((e) => e.prot_id === selectedStudy)[0];
      dispatch(updateSelectedStudy(clicked));
    }
    // console.log("selected", selectedStudy, clicked);
  }, [selectedStudy]);

  const CustomCard = ({ data, index, isPinned }) => {
    const priorityCount = 3;
    const ingestionCount = 2;
    const staleFilesCount = 1;

    const {
      prot_id: protId,
      protocolnumber,
      sponsorname,
      projectcode,
      phase,
    } = data;

    return (
      <Card
        color="dark"
        key={index}
        interactive
        className={classNames(
          classes.card,
          protId === selectedStudy && classes.cardHighlight
        )}
        onClick={() => setSelectedStudy(protId)}
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
              {isPinned ? (
                <PinnedIcon onClick={() => unPinningStudy(protId)} />
              ) : (
                <UnPinnedIcon onClick={() => pinningStudy(protId)} />
              )}
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
      {/* {console.log("studies", pinnedStudies, studyList)} */}
      <PageHeader height={64} />
      <div className={classes.root}>
        <Panel className={classes.leftPanel} width={407}>
          <div className="searchBox">
            <Typography
              variant="title1"
              className={classes.panelTitle}
              gutterBottom
            >
              My Assignments
            </Typography>
            <Typography className={classes.panelSubtitle} variant="caption">
              {studyList.length > 1
                ? `${studyList.length} Studies`
                : `${studyList.length} Study`}
            </Typography>
            <Search
              className={classes.searchBar}
              placeholder="Search for protocol, project code or sponsor"
              value={searchTxt}
              onChange={searchTrigger}
            />
            <Divider />
          </div>
          {pinnedStudies.length > 0 && (
            <div className="pinned-studies">
              <Typography className={classes.pinTitle} variant="caption">
                Pinned Studies
              </Typography>
              <div
                className={classNames("customScrollbar", classes.pinnedCards)}
              >
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
          )}
          {unPinnedStudies.length > 0 && (
            <div
              className={classNames(
                "customScrollbar unpinned-studies",
                classes.unPinnedCards
              )}
            >
              {loading ? (
                <Progress />
              ) : (
                unPinnedStudies.map((e, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <CustomCard
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    data={e}
                    index={`up${index}`}
                    isPinned={false}
                  />
                ))
              )}
            </div>
          )}
        </Panel>
        <Panel width="100%" hideButton>
          <RightPanel />
        </Panel>
      </div>
    </>
  );
};

export default Dashboard;
