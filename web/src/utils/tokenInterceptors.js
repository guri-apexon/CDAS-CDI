import axios from "axios";
import getCookie from "./index";

export default function tokenInterceptors() {
  if (process.env.REACT_APP_ENV !== "local") {
    axios.defaults.withCredentials = true;
  }
  axios.interceptors.request.use(
    (config) => {
      if (process.env.REACT_APP_ENV === "local") {
        config.params = {
          ...config.params,
          user_id: getCookie("user.id"),
        };
      } else {
        const userDataToken = getCookie("user.token");
        if (userDataToken === "") {
          window.location.href = process.env.REACT_APP_APP_LAUNCH_URL;
          throw new axios.Cancel("No Token redirecting the user to SDA.");
        } else {
          config.withCredentials = true;
          console.log(
            `${config.method.toUpperCase()} request sent to ${
              config.url
            } at ${new Date().getTime()}`
          );
        }
      }
      return config;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        window.location.href = process.env.REACT_APP_APP_LAUNCH_URL;
      }
      return Promise.reject(error);
    }
  );
}
