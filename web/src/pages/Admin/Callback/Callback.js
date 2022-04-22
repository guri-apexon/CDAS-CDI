/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useContext } from "react";
import { MessageContext } from "../../../components/Providers/MessageProvider";
import "./Callback.scss";

export default function Callback() {
  const messageContext = useContext(MessageContext);

  return (
    <div className="cdt-list-wrapper">
      <div className="cdt-table">
        <div className="table">
          <div className="no-data">No Data</div>
        </div>
      </div>
    </div>
  );
}
