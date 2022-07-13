import {
  SHOW_ALERT_TRUE,
  SHOW_ALERT_FALSE,
  FORM_COMPONENT_ACTIVE,
  SHOW_APP_SWITCHER,
  HIDE_APP_SWITCHER,
  FORM_COMPONENT_IN_ACTIVE,
} from "../../constants";

export const showAlert = () => {
  return {
    type: SHOW_ALERT_TRUE,
  };
};

export const hideAlert = () => {
  return {
    type: SHOW_ALERT_FALSE,
  };
};

export const formComponentActive = () => {
  return {
    type: FORM_COMPONENT_ACTIVE,
  };
};

export const formComponentInActive = () => {
  return {
    type: FORM_COMPONENT_IN_ACTIVE,
  };
};

export const showAppSwitcher = () => {
  return {
    type: SHOW_APP_SWITCHER,
  };
};

export const hideAppSwitcher = () => {
  return {
    type: HIDE_APP_SWITCHER,
  };
};
