import React, { useState } from "react";
import clsx from "clsx";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from "apollo-react/components/Box";
import Card from "apollo-react/components/Card";
import CardContent from "apollo-react/components/CardContent";
import Panel from "apollo-react/components/Panel";
import { neutral1, neutral7 } from "apollo-react/colors";
import Drawer from "@material-ui/core/Drawer";
import Divider from "apollo-react/components/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "apollo-react-icons/ChevronLeft";
import ChevronRightIcon from "apollo-react-icons/ChevronRight";
import Typography from "apollo-react/components/Typography";
import EllipsisVertical from "apollo-react-icons/EllipsisVertical";
import IconMenuButton from "apollo-react/components/IconMenuButton";
import Tooltip from "apollo-react/components/Tooltip";
import Search from "apollo-react/components/Search";
import { useHistory } from "react-router-dom";
import { titleCase, getUserInfo } from "../../utils/index";

import AppFooter from "../../components/AppFooter/AppFooter";
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
    panelTitle: {
      padding: "24px 24px 0px 24px",
      fontWeight: 600,
      marginBottom: 0,
    },
    panelSubtitle: {
      padding: "0px 24px 16px 24px",
      color: neutral7,
      lineHeight: "24px",
      fontSize: "14px",
    },
    card: {
      margin: "8px 24px",
      cursor: "pointer",
    },
    cardHighlight: {
      backgroundColor: "#d8e7fe",
    },
    cardSubtitle: {
      color: neutral7,
      lineHeight: "24px",
    },
    bold: {
      fontWeight: 600,
    },
    page: {
      padding: 24,
    },
    panelContent: {
      overflow: "auto",
      height: 333,
    },
  };

  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const history = useHistory();
  const userInfo = getUserInfo();

  const CustomCard = ({ title, index }) => (
    <Card
      color="dark"
      interactive
      className={classNames(classes.card, index === 0 && classes.cardHighlight)}
    >
      <CardContent>
        <Typography className={classes.bold}>{title}</Typography>
        <Typography className={classes.cardSubtitle} variant="caption">
          {`Subtitle for ${title}`}
        </Typography>
      </CardContent>
    </Card>
  );

  const { fullName } = userInfo;
  return (
    <>
      <PageHeader />
      <div className={classes.root}>
        <Panel width={405}>
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
            placeholder="Search for protocol, project code or sponsor"
            fullWidth
          />
          <div className={classes.panelContent}>
            {["Card 1", "Card 2", "Card 3", "Card 4"].map((title, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <CustomCard key={index} title={title} index={index} />
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
