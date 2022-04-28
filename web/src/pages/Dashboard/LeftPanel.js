import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { neutral7 } from "apollo-react/colors";
import Divider from "apollo-react/components/Divider";
import Typography from "apollo-react/components/Typography";
import Search from "apollo-react/components/Search";
import { makeStyles } from "@material-ui/core/styles";
import _ from "lodash";
import Progress from "../../components/Common/Progress/Progress";
import { debounceFunction, getUserInfo } from "../../utils";
import searchStudy, { unPinStudy, pinStudy } from "../../services/ApiServices";
import {
  updateSelectedStudy,
  getPinnedData,
  getStudiesData,
} from "../../store/actions/DashboardAction";
import CustomCard from "./CustomCard";

const styles = {
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
    cursor: "auto",
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
};

const LeftPanel = () => {
  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.dashboard);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studyList, setStudyList] = useState([]);
  const [searchTxt, setSearchTxt] = useState("");
  const [unPinnedStudies, setUnPinnedStudies] = useState([]);
  const [pinnedStudies, setPinnedStudies] = useState([]);
  const [pinned, setPinned] = useState([]);
  const { loading: isLoading, userStudies, userPinnedStudies } = dashboard;
  const userInfo = getUserInfo();

  const updateList = async () => {
    // const newStudies = await getStudies();
    // const newPinned = await getPinnedStudies();
    // if (newStudies !== undefined && newStudies.length) {
    //   setStudyList([...newStudies]);
    // }
    // if (newStudies !== undefined && newStudies.length) {
    //   setPinned([...newPinned]);
    // }
    setLoading(true);
    dispatch(getStudiesData(userInfo.userId));
    dispatch(getPinnedData(userInfo.userId));
    setLoading(false);
  };

  // useEffect(() => {
  //   setLoading(isLoading);
  // }, [isLoading]);

  useEffect(() => {
    setStudyList([...userStudies]);
  }, [userStudies]);

  useEffect(() => {
    setPinned([...userPinnedStudies]);
  }, [userPinnedStudies]);

  useEffect(() => {
    if (userStudies.length === 0) {
      updateList();
    }
  }, []);

  const searchTrigger = (e) => {
    const newValue = e.target.value;
    setSearchTxt(newValue);
    debounceFunction(async () => {
      setLoading(true);
      const newStudies = await searchStudy(newValue);
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
  }, [selectedStudy]);

  return (
    <div
      style={{
        maxHeight: "calc( 100vh - 120px)",
        overflow: "hidden",
      }}
      className="leftPanel"
    >
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

      {loading ? (
        <Progress />
      ) : (
        <div className="customScrollbar studies">
          {pinnedStudies.length > 0 && (
            <>
              <Typography className={classes.pinTitle} variant="caption">
                Pinned Studies
              </Typography>
              <div className="pinnedCards">
                {pinnedStudies.map((e, index) => (
                  <CustomCard
                    key={e.prot_id}
                    data={e}
                    index={`p${index}`}
                    isPinned={true}
                    unPinningStudy={unPinningStudy}
                    classes={classes}
                    setSelectedStudy={setSelectedStudy}
                    selectedStudy={selectedStudy}
                  />
                ))}
              </div>
            </>
          )}
          {unPinnedStudies.length > 0 && (
            <div className="unPinnedCards">
              {unPinnedStudies.map((e, index) => (
                <CustomCard
                  key={e.prot_id}
                  data={e}
                  index={`up${index}`}
                  isPinned={false}
                  disablePinning={pinnedStudies.length > 2}
                  pinningStudy={pinningStudy}
                  classes={classes}
                  setSelectedStudy={setSelectedStudy}
                  selectedStudy={selectedStudy}
                />
              ))}
            </div>
          )}
          {unPinnedStudies.length === 0 && (
            // <div className="no-data-found"> </div>
            <Typography
              variant="title1"
              style={{ color: neutral7, lineHeight: "32px", marginBottom: 14 }}
            >
              No Studies Found
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

export default LeftPanel;
