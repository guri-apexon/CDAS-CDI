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
  LOCATIONAPI,
  DATAKINDAPI,
} from "../constants";
import { getCookie } from "../utils/index";

const userId = getCookie("user.id");

const config = { headers: { userId } };

export const checkLocationExistsInDataFlow = async (locId) => {
  try {
    const res = await axios.get(
      `${baseURL}/${LOCATIONAPI}/check-in-df/${locId}`
    );
    return res.data?.data || 0;
  } catch (err) {
    return console.log("Error", err);
  }
};

export const statusUpdate = async (id, status) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(
          `${baseURL}/${LOCATIONAPI}/statusUpdate`,
          {
            id,
            status,
            userId,
          },
          config
        )
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.log("Err", err);
          if (err.response) {
            resolve(err.response.data);
          }
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

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

export const activateDK = async (dkId, dkStatus) => {
  try {
    const res = await axios.post(`${baseURL}/${DATAKINDAPI}/status-update`, {
      dkId,
      dkStatus,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const inActivateDK = async (dkId, dkStatus) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/${DATAKINDAPI}/status-update`, {
          dkId,
          dkStatus,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          // console.log("Err", err);
          if (err.response) {
            resolve(err.response.data);
          }
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const addDK = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/${DATAKINDAPI}/create`, reqBody)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          if (err.response) {
            resolve(err.response.data);
          }
        });
    });
  } catch (err) {
    return console.log("Error", err);
  }
};

export const updateDK = async (reqBody) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/${DATAKINDAPI}/update`, reqBody)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          if (err.response) {
            resolve(err.response.data);
          }
        });
    });
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

export const getENSList = async () => {
  try {
    const res = await axios.get(`${baseURL}/${DATAKINDAPI}/ens/list`);
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
