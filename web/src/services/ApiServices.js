import axios from "axios";
import {
  baseURL,
  STUDYSEARCH,
  STUDYLIST,
  PINNEDSTUDY,
  UNPINSTUDY,
  PINSTUDY,
  HARDDELETE,
  SYNCNOW,
  ACTIVATEDF,
  INACTIVATE,
  VLCDATAAPI,
  DATAFLOWSEARCH,
  DATAFLOW_SOURCE,
} from "../constants";
import { getCookie } from "../utils/index";

const userId = getCookie("user.id");

const searchStudy = async (searchQuery = "") => {
  try {
    const res = await axios.post(`${baseURL}/${STUDYSEARCH}/${searchQuery}`, {
      userId,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const searchDataflows = async (searchQuery = "", studyId) => {
  try {
    const res = await axios.post(
      `${baseURL}/${DATAFLOWSEARCH}/${searchQuery}`,
      {
        userId,
        studyId,
      }
    );
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const fetchDataFlowSource = async (dataflowId) => {
  try {
    const res = await axios.get(`${baseURL}/${DATAFLOW_SOURCE}/${dataflowId}`);
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const hardDelete = async (dataFlowId) => {
  try {
    const res = await axios.post(`${baseURL}/${HARDDELETE}`, {
      dataFlowId,
      userId,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const getVLCDataList = async () => {
  try {
    const res = await axios.post(`${baseURL}/${VLCDATAAPI}`, {});
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const syncNowDataFlow = async ({ version, dataFlowId }) => {
  try {
    const res = await axios.post(`${baseURL}/${SYNCNOW}`, {
      version,
      userId,
      dataFlowId,
      action: "SYNC",
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const activateDF = async (dataFlowId, versionNo) => {
  try {
    const res = await axios.post(`${baseURL}/${ACTIVATEDF}`, {
      dataFlowId,
      userId,
      versionNo,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const inActivateDF = async (dataFlowId, versionNo) => {
  try {
    const res = await axios.post(`${baseURL}/${INACTIVATE}`, {
      dataFlowId,
      userId,
      versionNo,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const getStudies = async () => {
  try {
    const res = await axios.get(`${baseURL}/${STUDYLIST}/${userId}`);
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const pinStudy = async (protocolId) => {
  try {
    const res = await axios.post(`${baseURL}/${PINSTUDY}`, {
      userId,
      protocolId,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const unPinStudy = async (protocolId) => {
  try {
    const res = await axios.post(`${baseURL}/${UNPINSTUDY}`, {
      userId,
      protocolId,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const getPinnedStudies = async () => {
  try {
    const res = await axios.get(`${baseURL}/${PINNEDSTUDY}/${userId}`);
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export default searchStudy;

export const userLogOut = () => {
  return axios
    .get(`${baseURL}/logout`)
    .then((res) => {
      return res.data || false;
    })
    .catch((err) => {
      console.log(err);
    });
};
