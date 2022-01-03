module.exports = function (query) {
  this.updateAuditLog = function () { 
    return new Promise((resolve, reject) => {
      DB.executeQuery(query).then((response) => {
        resolve(true);
      });
    });
  }
}