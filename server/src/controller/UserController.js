const DB =  require('../config/db');
const apiResponse = require("../helpers/apiResponse");

exports.getUser =  function (user_id) {
    try {
        const usrId = user_id;
        const query = `SELECT * from cdascore1d.cdascore.cdas_user where usr_id = '${usrId}'`;
        return DB.executeQuery(query).then( response => {
            const users = response.rows || [];
            if(response.rowCount > 0){
                return users 
            }else{
                return 0
            }
        });
    } catch (err) {
        //throw error in json response with status 500. 
        return err
    }
}

exports.addUser =  function (userDetails) {
    try {
        const {usr_id, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm} = userDetails
        const query = `INSERT INTO cdascore1d.cdascore.cdas_user(usr_id, usr_fst_nm, usr_lst_nm, usr_mail_id, insrt_tm, updt_tm) VALUES('${usr_id}', '${usr_fst_nm}', '${usr_lst_nm}', '${usr_mail_id}', '${insrt_tm}', '${updt_tm}')`;
        return DB.executeQuery(query).then( response => {
            return response.rowCount;
        });
    } catch (err) {
        //throw error in json response with status 500. 
        return err
    }
}

exports.getLastLoginTime = function (user_id) {
    try {
        const usrId = user_id;
        const query = `SELECT login_tm from cdascore1d.cdascore.cdas_user_login_details where usr_id = '${usrId}' order by login_tm desc LIMIT 1`;
        return DB.executeQuery(query).then( response => {
            const login = response.rows || [];
            if(response.rowCount > 0){
                return login 
            }else{
                return 0
            }
        });
    } catch (err) {
        //throw error in json response with status 500. 
        return err
    }
}

exports.addLoginActivity = function (loginDetails) {
    try {
        const {usrId, login_tm, logout_tm} = loginDetails
        const query = `INSERT INTO cdascore1d.cdascore.cdas_user_login_details(usr_id, login_tm, logout_tm) VALUES('${usrId}', '${login_tm}', '${logout_tm}')`;
        return DB.executeQuery(query).then( response => {
            return response.rowCount;
        });
    } catch (err) {
        console.log(err, "inser terr")
        //throw error in json response with status 500. 
        return err
    }
}