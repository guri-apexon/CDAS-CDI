/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-array-index-key */
import React from "react";
import ArrowRight from "apollo-react-icons/ArrowRight";
import Button from "apollo-react/components/Button";
import Typography from "apollo-react/components/Typography";
import Tooltip from "apollo-react/components/Tooltip";
import { useHistory } from "react-router-dom";
import { titleCase, getUserInfo } from "../../utils/index";
import "./Dashboard.scss";

const Dashboard = () => {
  const history = useHistory();
  const userInfo = getUserInfo();

  const { fullName } = userInfo;

  return <div className="dashboard-wrapper" />;
};

export default Dashboard;
