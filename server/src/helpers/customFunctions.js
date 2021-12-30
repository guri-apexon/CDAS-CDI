const uuid = require("uuid");

exports.generateUniqueID = function() {
    const unique_id = uuid();
    return unique_id.slice(0,16);
};