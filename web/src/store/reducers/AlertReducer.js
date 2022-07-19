import produce from "immer";
import {
  SHOW_ALERT_TRUE,
  SHOW_ALERT_FALSE,
  FORM_COMPONENT_ACTIVE,
  SHOW_APP_SWITCHER,
  HIDE_APP_SWITCHER,
  FORM_COMPONENT_IN_ACTIVE,
} from "../../constants";

export const initialState = {
  showAlertBox: false,
  isFormComponentActive: false,
  showAppSwitcher: false,
};

const AlertReducer = (state = initialState, action) =>
  produce(state, (newState) => {
    switch (action.type) {
      case SHOW_ALERT_TRUE:
        newState.showAlertBox = true;
        break;

      case SHOW_ALERT_FALSE:
        newState.showAlertBox = false;
        break;

      case FORM_COMPONENT_ACTIVE:
        newState.isFormComponentActive = true;
        break;

      case FORM_COMPONENT_IN_ACTIVE:
        newState.isFormComponentActive = false;
        break;

      case SHOW_APP_SWITCHER:
        newState.showAppSwitcher = true;
        break;

      case HIDE_APP_SWITCHER:
        newState.showAppSwitcher = false;
        break;

      default:
        break;
    }
  });

export default AlertReducer;
