import withStyles from "@material-ui/core/styles/withStyles";
import React, { useEffect, useState } from "react";

import { neutral8, gradientHorizontal } from "apollo-react/colors";
import Blade from "apollo-react/components/Blade";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { withRouter } from "react-router";
import Box from "apollo-react/components/Box";
import Arrow2Down from "apollo-react-icons/Arrow2Down";
import App from "apollo-react-icons/App";
import Tooltip from "apollo-react/components/Tooltip/Tooltip";

const styles = {
  content: {
    color: neutral8,
    lineHeight: "24px",
  },
  customBlade: {
    background: gradientHorizontal,
  },
  toLauchpad: {
    transform: "rotate(-90deg)",
    marginLeft: 7,
  },
  line: {
    background: "#fff",
    opacity: 0.35,
    width: 307,
    height: 1,
    marginLeft: 0,
    marginRight: -20,
  },
};

const linksArr = [
  {
    title: "Clinical Data Ingestion",
    imgUrl: "assets/svg/CDI_ICON_96x96.svg",
    haveAccess: true,
    url: "cdi",
  },
  {
    title: "Clinical Data Mapper",
    imgUrl: "assets/svg/CDM_ICON_96x96.svg",
    haveAccess: false,
    url: "cdm",
  },
  {
    title: "Clinical Data Review",
    imgUrl: "assets/svg/CDR_ICON_96x96.svg",
    haveAccess: false,
    url: "cdr",
  },
  {
    title: "Clinical Analytics",
    imgUrl: "assets/svg/CA_ICON_96x96.svg",
    haveAccess: false,
    url: "ca",
  },
  {
    title: "Data Science Workbench",
    imgUrl: "assets/svg/DSW_ICON_96x96.svg",
    haveAccess: false,
    url: "dsw",
  },
];

const NavigationPanel = ({
  history,
  location: { pathname },
  open,
  onClose,
}) => {
  const [openPanel, setOpenPanel] = useState(open);
  const useStyles = makeStyles(styles);
  const classes = useStyles();
  // const onOpen = () => {
  //   setOpenPanel(true);
  // };
  const closePanel = () => {
    setOpenPanel(false);
    onClose();
  };
  const onChange = () => {
    console.log("onChange");
  };
  useEffect(() => {
    setOpenPanel(open);
  }, [open]);
  useEffect(
    () => {
      setOpenPanel(false);
      onClose();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  );
  return (
    <>
      <Blade
        className="navigation-panel"
        width={331}
        onChange={onChange}
        open={openPanel}
        onClose={closePanel}
        title=""
      >
        <div className="waves">
          <img src="assets/svg/waves.svg" alt="waves" />
        </div>
        <App onClick={closePanel} className="close-panel" />
        <Box display="flex" m={1} mt={5}>
          <Typography variant="title1" gutterBottom darkMode>
            Clinical Data Analytics Suite
          </Typography>
        </Box>
        <Box display="flex" m={1} mt={2}>
          <Typography
            onClick={() => history.push("dashboard")}
            className="link flex flex-center"
            variant="body2"
            gutterBottom
          >
            To Launchpad
            <Arrow2Down className={classes.toLauchpad} />
          </Typography>
        </Box>

        <div className={classes.line} />
        <Box display="flex" m={1} mt={3}>
          <Typography gutterBottom darkMode>
            Modules
          </Typography>
        </Box>
        <Box display="flex" className="flexWrap left-align">
          {linksArr.map((link, i) => {
            const buttonLInk = (
              <Button
                darkMode
                variant="text"
                onClick={() => link.haveAccess && history.push(link.url)}
              >
                <img src={link.imgUrl} alt={link.title} />
                {link.title}
              </Button>
            );
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i}>
                {!link.haveAccess ? (
                  <Tooltip
                    variant="dark"
                    title="Contact your System Administrator for access"
                    placement="right"
                  >
                    {buttonLInk}
                  </Tooltip>
                ) : (
                  buttonLInk
                )}
              </div>
            );
          })}
        </Box>
      </Blade>
    </>
  );
};

export default withStyles(styles)(withRouter(NavigationPanel));
