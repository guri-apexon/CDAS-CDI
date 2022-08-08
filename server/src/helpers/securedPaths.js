const securedPaths = [
  {
    url: "/dataflow/create",
    methods: ["post"],
    feature: "Data Flow Configuration",
    checkModificationPermission: true,
  },
  {
    url: "/dataflow/create-dataflow",
    methods: ["post"],
    feature: "Data Flow Configuration",
    checkModificationPermission: true,
  },
  {
    url: "/dataflow/update-config",
    methods: ["post"],
    feature: "Data Flow Configuration",
    checkModificationPermission: true,
  },
  {
    url: "/vendor/create",
    methods: ["post"],
    feature: "Vendor Management",
    checkModificationPermission: true,
  },
  {
    url: "/vendor/list",
    methods: ["get"],
    feature: "Vendor Management",
    checkModificationPermission: false,
  },
  {
    url: "/datakind/create",
    methods: ["post"],
    feature: "Clinical Data Type Setup",
    checkModificationPermission: true,
  },
  {
    url: "/datakind/table/list",
    methods: ["get"],
    feature: "Clinical Data Type Setup",
    checkModificationPermission: false,
  },
  {
    url: "/location/create",
    methods: ["post"],
    feature: "Location Setup",
    checkModificationPermission: true,
  },
  {
    url: "/location/list",
    methods: ["get"],
    feature: "Location Setup",
    checkModificationPermission: false,
  },
  {
    url: "/role/getuserrolespermissions",
    methods: ["post"],
    feature: "Get Permissions",
    checkModificationPermission: false,
    skipPermission: true,
  },
];
exports.securedPaths = securedPaths;
