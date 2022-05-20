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
  DATAFLOW_DETAILS,
  DATAFLOW_SAVE,
  LOCATIONAPI,
  DATAKINDAPI,
  COLUMNSAPI,
  DATAFLOW_UPDATE_API,
  ADD_PACKAGE,
} from "../constants";
import {
  columnsCreated,
  columnsCreatedFailure,
} from "../store/actions/DataSetsAction";
import { deleteAllCookies, getUserId } from "../utils/index";

const userId = getUserId();

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

export const createColumns = async (payload) => {
  try {
    return new Promise((resolve, reject) => {
      axios
        .post(`${baseURL}/${COLUMNSAPI}/create`, payload)
        .then((res) => {
          columnsCreated({ ...res.data, nQuery: payload.nQuery });
          resolve(res.data);
        })
        .catch((err) => {
          if (err.response) {
            columnsCreatedFailure(err.response?.data);
            resolve(err.response.data);
          }
        });
    });
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

export const getDataFlowDetails = async (dataflowId) => {
  try {
    const res = await axios.get(`${baseURL}/${DATAFLOW_DETAILS}/${dataflowId}`);
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

export const testConnectionFSR = async (reqBody) => {
  try {
    const { endPoint, ...params } = reqBody;
    const res = await axios.post(`${baseURL}/v1/api/fsr-connect`, {
      params,
      endPoint,
    });
    return res.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const dataflowSave = async (payload) => {
  try {
    const res = await axios.post(`${baseURL}/${DATAFLOW_SAVE}`, {
      ...payload,
      userId,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};
export const updateDataflow = async (payload) => {
  try {
    const res = await axios.post(`${baseURL}/${DATAFLOW_UPDATE_API}`, {
      ...payload,
      userId,
    });
    return res.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const hardDelete = async (
  dataFlowId,
  dataFlowName,
  version,
  studyId,
  fsrStatus
) => {
  try {
    const res = await axios.post(`${baseURL}/${HARDDELETE}`, {
      dataFlowId,
      dataFlowName,
      version,
      studyId,
      fsrStatus,
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

export const getStudies = async () => {
  try {
    const res = await axios.get(`${baseURL}/${STUDYLIST}/${userId}`);
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

export const userLogOut = () => {
  return axios
    .get(`${baseURL}/logout`)
    .then(async (res) => {
      if (res.data) {
        const deleted = await deleteAllCookies();
        return deleted;
      }
      return false;
    })
    .catch((err) => {
      console.log(err);
    });
};

export const deleteCD = async (columnId, dsId, dpId, dfId) => {
  try {
    const res = await axios.post(`${baseURL}/${COLUMNSAPI}/delete`, {
      columnId,
      dsId,
      dfId,
      dpId,
      userId,
    });
    return res.data?.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export const submitDataPackage = async (reqBody) => {
  try {
    const res = await axios.post(`${baseURL}/${ADD_PACKAGE}`, reqBody);
    return res.data || [];
  } catch (err) {
    return console.log("Error", err);
  }
};

export default searchStudy;
