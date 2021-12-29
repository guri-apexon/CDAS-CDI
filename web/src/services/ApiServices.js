import axios from "axios";
import { baseURL, STUDYSEARCH } from "../constants";
// import { getCookie } from "../utils/index";

const searchStudy = async (searchQuery = "") => {
  try {
    // const userId = getCookie("user.id");
    const res = await axios.get(`${baseURL}/${STUDYSEARCH}/${searchQuery}`);
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
