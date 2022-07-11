import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import * as colors from "apollo-react/colors";
import Typography from "apollo-react/components/Typography";
import Paper from "apollo-react/components/Paper";
import Button from "apollo-react/components/Button";
import InfoIcon from "apollo-react-icons/Info";

const useStyles = makeStyles(() => ({
  card: {
    maxWidth: "175px",
    width: "100%",
    height: "175px",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "inherit",
  },
  mr4: {
    marginRight: "4px",
  },
  label: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    alignSelf: "normal",
    minHeight: "48px",
  },
  mt2: {
    marginTop: "2px",
  },
  details: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "8px",
  },
  bold: {
    fontWeight: 600,
  },
}));

const InfoCard = ({
  title,
  subtitle,
  value,
  icon: Icon,
  color,
  handlePeekOpen,
  closePeek,
  handleViewClick,
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.card}>
      <div className={classes.label}>
        <Typography className={`${classes.bold} ${classes.mr4}`}>
          {title}
        </Typography>
        <InfoIcon
          fontSize="small"
          style={{ color: colors.neutral7 }}
          onMouseOver={() => handlePeekOpen(title, subtitle)}
          onMouseOut={closePeek}
        />
      </div>

      <div className={classes.details}>
        <Icon fontSize="large" style={{ color: colors[color] }} />
        <Typography variant="h2">{value || 0}</Typography>
      </div>

      <Button onClick={handleViewClick} size="small">
        View
      </Button>
    </Paper>
  );
};

export default InfoCard;
