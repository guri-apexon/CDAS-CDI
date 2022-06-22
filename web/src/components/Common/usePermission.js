import React, { useContext } from "react";
import { AppContext } from "../Providers/AppProvider";

// Categories
const CONFIGURATION = "Configuration - CDI";
const MENU = "Menu - CDI";
const LAUNCHPAD = "Launchpad";

// Features
const CLINICAL_DATA_TYPE_SETUP = "Clinical Data Type Setup";
const DATA_FLOW_CONFIGURATION = "Data Flow Configuration";
const LOCATION_SETUP = "Location Setup";
const SYSTEM_SETTINGS = "System Settings";
const CDI_INGESTION_ISSUES = "CDI Ingestion Issues";
const CDI_REPORTS = "CDI Reports";
const DATA_FLOW_HARD_DELETE_PROD = "Data Flow Hard Delete - Prod";
const DATA_FLOW_HARD_DELETE_TEST = "Data Flow Hard Delete - Test";
const DATASET_HARD_DELETE = "Dataset Hard Delete";
const PRODUCTION_MONITOR = "Production Monitor";
const SYNC_NOW = "Sync Now";
const LAUNCHPAD_CA = "Launchpad-CA";
const LAUNCHPAD_CDM = "Launchpad-CDM";
const LAUNCHPAD_CDI = "Launchpad-CDI";
const LAUNCHPAD_CDR = "Launchpad-CDR";
const LAUNCHPAD_DSW = "Launchpad-DSW";

const DOWNLOAD = "download";
const CREATE = "create";
const READ = "read";
const UPDATE = "update";
const ENABLE = "enable";

const Categories = {
  CONFIGURATION,
  MENU,
  LAUNCHPAD,
};

const Features = {
  CLINICAL_DATA_TYPE_SETUP,
  DATA_FLOW_CONFIGURATION,
  LOCATION_SETUP,
  SYSTEM_SETTINGS,
  CDI_INGESTION_ISSUES,
  CDI_REPORTS,
  DATA_FLOW_HARD_DELETE_PROD,
  DATA_FLOW_HARD_DELETE_TEST,
  DATASET_HARD_DELETE,
  PRODUCTION_MONITOR,
  SYNC_NOW,
  LAUNCHPAD_CA,
  LAUNCHPAD_CDM,
  LAUNCHPAD_CDI,
  LAUNCHPAD_CDR,
  LAUNCHPAD_DSW,
};

const Permissions = {
  DOWNLOAD,
  CREATE,
  READ,
  UPDATE,
  ENABLE,
};

/** custom hook to proviede permissions of a particular categopry and feature */
const usePermission = (category, feature) => {
  const appContext = useContext(AppContext);
  const { permissions } = appContext.user;
  const permission = permissions?.find(
    (p) =>
      p.categoryName?.trim().toUpperCase() === category?.trim().toUpperCase() &&
      p.featureName?.trim().toUpperCase() === feature?.trim().toUpperCase()
  );

  const checkPermission = (mode) =>
    !!(
      permission &&
      permission?.allowedPermission.find(
        (p) => p.toUpperCase() === mode.toUpperCase()
      )
    );

  const canCreate = checkPermission(Permissions.CREATE);
  const canRead = checkPermission(Permissions.READ);
  const canUpdate = checkPermission(Permissions.UPDATE);
  const canDownload = checkPermission(Permissions.DOWNLOAD);
  const readOnly = canRead && !canUpdate && !canCreate;
  const canEnabled = checkPermission(Permissions.ENABLE);
  const noPermission = permission && permission.allowedPermission?.length === 0;

  return {
    canCreate,
    canRead,
    canUpdate,
    canDownload,
    canEnabled,
    checkPermission,
    noPermission,
    readOnly,
  };
};

export default usePermission;
export { Categories, Features, Permissions };
