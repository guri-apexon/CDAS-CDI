import {
  STUDY_NOTONBOARDED_STATUS,
  STUDYBOARD_DATA,
  PAGEHEADER_UPDATE,
} from "../../constants";

// eslint-disable-next-line import/prefer-default-export
export const getStudyboardData = () => {
  return {
    type: STUDYBOARD_DATA,
  };
};

export const getNotOnBordedStatus = () => {
  return {
    type: STUDY_NOTONBOARDED_STATUS,
  };
};

export const updateSelectedStudy = (study) => {
  return {
    type: PAGEHEADER_UPDATE,
    study,
  };
};
