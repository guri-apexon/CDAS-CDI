export const rows = [
  {
    name: "Bob Henderson",
    dataset_name: "Human Resources",
    audit_ver: "2.0",
    column_name: "",
    update_dt: "09-02-2021 12:00 PM",
    user: "Gurpreet Singh",
    attribute: "New Package",
    old_val: "",
    new_val: "New Package",
  },
  {
    name: "Lakshmi Patel",
    dataset_name: "Marketing",
    audit_ver: "2.0",
    column_name: "",
    update_dt: "09-02-2021 12:00 PM",
    user: "Ravish",
    attribute: "Package Status",
    old_val: "Active",
    new_val: "Inactive",
  },
];

const getRandom = (min, max) => Math.floor(Math.random() * (max - min) + min);

export const rowsWithExtra = rows.map((row) => ({
  ...row,
  employeeIQ: getRandom(90, 120),
  salary: getRandom(80000, 160000),
  prizes: getRandom(0, 16),
  legacyGroup: getRandom(0, 2) === 1 ? "IMS Health" : "Quintiles",
}));

export const rowsWithALotExtra = rowsWithExtra.map((row) => ({
  ...row,
  ...new Array(40).fill().reduce((acc, _, i) => {
    acc[i] = `${i}`;
    return acc;
  }, {}),
}));
