import React from "react";
import classNames from "classnames";
import Card from "apollo-react/components/Card";
import Typography from "apollo-react/components/Typography";
import CardContent from "apollo-react/components/CardContent";
import { ReactComponent as PriorityIcon } from "../../components/Icons/Priority.svg";
import { ReactComponent as IngestionIcon } from "../../components/Icons/Issue.svg";
import { ReactComponent as StaleFilesIcon } from "../../components/Icons/Stale.svg";
import { ReactComponent as PinnedIcon } from "../../components/Icons/Pin.svg";
import { ReactComponent as UnPinnedIcon } from "../../components/Icons/UnPin.svg";

const CustomCard = ({
  data,
  index,
  isPinned,
  unPinningStudy,
  pinningStudy,
  setSelectedStudy,
  selectedStudy,
  classes,
}) => {
  const {
    prot_id: protId,
    protocolnumber,
    sponsorname,
    projectcode,
    phase,
    staleFilesCount,
    ingestionCount,
    priorityCount,
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
      {/* {console.log("data", data)} */}
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

export default CustomCard;
