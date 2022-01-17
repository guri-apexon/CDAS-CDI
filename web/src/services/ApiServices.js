import axios from "axios";
import {
  baseURL,
  STUDYSEARCH,
  STUDYLIST,
  PINNEDSTUDY,
  UNPINSTUDY,
  PINSTUDY,
  HARDDELETE,
  ACTIVATEDF,
  INACTIVATE,
} from "../constants";
import { getCookie } from "../utils/index";

const userId = getCookie("user.id");

const searchStudy = async (searchQuery = "") => {
  try {
    const res = await axios.get(`${baseURL}/${STUDYSEARCH}/${searchQuery}`);
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

export const activateDF = async (dataFlowId) => {
  try {
    const res = await axios.post(`${baseURL}/${ACTIVATEDF}`, {
      dataFlowId,
      userId,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const inActivateDF = async (dataFlowId) => {
  try {
    const res = await axios.post(`${baseURL}/${INACTIVATE}`, {
      dataFlowId,
      userId,
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
