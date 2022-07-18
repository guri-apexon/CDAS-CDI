const DB = require("../config/db");
const apiResponse = require("../helpers/apiResponse");
const Logger = require("../config/logger");
const moment = require("moment");
const _ = require("lodash");
const constants = require("../config/constants");
const { DB_SCHEMA_NAME: schemaName } = constants;

exports.getUserStudyList = function (req, res) {
  try {
    const userId = req.params.userId;

    const newQuery = `select
    studycard2.prot_id,
    studycard2.protocolnumber,
    studycard2.protocolnumberstandard,
    studycard2.sponsorname,
    studycard2.phase,
    studycard2.protocolstatus,
    studycard2.projectcode,
    sum(
          case
              when studycard2.overallstatus = 'SUCCESSFUL'::text then 1::bigint
              else null::bigint
          end) as "ingestionCount",
    sum(
          case
              when studycard2.overallstatus = 'FAILED'::text then 1::bigint
              else null::bigint
          end) as "priorityCount",
    sum(
          case
              when studycard2.no_of_staledays > studycard2.staledays::double precision then 1::bigint
              else 0::bigint
          end) as "staleFilesCount",
    count(distinct studycard2.dataflowid) as "dfCount",
    count(distinct studycard2.vendid) as "vCount",
    count(distinct studycard2.datapackageid) as "dpCount",
    count(distinct studycard2.datasetid) as "dsCount",
    count(distinct
          case studycard2.dfactive
              when 1::bigint then studycard2.dataflowid
              else null::character varying
          end) as "ActiveDfCount",
    count(distinct
          case studycard2.dfactive
              when 0::bigint then studycard2.dataflowid
              else null::character varying
          end) as "InActiveDfCount",
    coalesce(sum(studycard2.dsactive), 0::bigint) as "ActiveDsCount",
    coalesce(sum(
          case
              when studycard2.dsactive = 0::bigint then 1::bigint
              else null::bigint
          end), 0::bigint::numeric) as "InActiveDsCount"
  from
    (
    select
      studycard.prot_id,
      studycard.protocolnumber,
      studycard.protocolnumberstandard,
      studycard.protocolstatus,
      studycard.sponsorname,
      studycard.phase,
      studycard.projectcode,
      studycard.vendid,
      studycard.dataflowid,
      studycard.dfactive,
      studycard.datapackageid,
      studycard.dpactive,
      studycard.datasetid,
      studycard.dsactive,
      case
        when studycard.dsactive = 1
        and studycard.downloadstatus::text = 'SUCCESSFUL'::text
        and (studycard.processstatus::text = any (array['SUCCESSFUL'::character varying,
        'PROCESSED WITH ERRORS'::character varying]::text[])) then 'SUCCESSFUL'::text
        when studycard.dsactive = 1
        and (studycard.downloadstatus::text = 'FAILED'::text
        or studycard.processstatus::text = 'FAILED'::text) then 'FAILED'::text
        else null::text
      end as overallstatus,
      case
        when studycard.dsactive = 1
        and CURRENT_TIMESTAMP > to_timestamp((studycard.lastmodifiedtime::numeric / 1000::numeric)::double precision) then date_part('day'::text, CURRENT_TIMESTAMP - to_timestamp((studycard.lastmodifiedtime::numeric / 1000::numeric)::double precision))
        else '-1'::integer::double precision
      end as no_of_staledays,
      studycard.staledays
    from
      (
      select
        s.prot_id,
        s.prot_nbr as protocolnumber,
        s.prot_nbr_stnd as protocolnumberstandard,
        s.prot_stat as protocolstatus,
        s2.spnsr_nm as sponsorname,
        s.phase,
        s.proj_cd as projectcode,
        df.vend_id as vendid,
        df.dataflowid,
        df.name as dfname,
        df.active as dfactive,
        dp.datapackageid,
        dp.name as dpname,
        dp.active as dpactive,
        ds.datasetid,
        ds.mnemonic,
        ds.active as dsactive,
        ds.staledays,
        ts.externalid,
        ts.downloadstatus,
        ts.processstatus,
        dc.lastmodifiedtime,
        row_number() over (partition by s.prot_id,
        df.dataflowid,
        dp.datapackageid,
        ds.datasetid
      order by
        ts.externalid desc) as latest
      from
        study_user su
      join study s on
        su.prot_id::text = s.prot_id::text
        and su.act_flg = 1
        and s.active::text = '1'::text
        and su.usr_id = $1
      join study_sponsor ss on
        s.prot_id::text = ss.prot_id::text
      join sponsor s2 on
        s2.spnsr_id::text = ss.spnsr_id::text
      left join dataflow df on
        df.prot_id::text = s.prot_id::text
        and coalesce(df.del_flg, 0) <> 1
      left join datapackage dp on
        df.dataflowid::text = dp.dataflowid::text
      left join dataset ds on
        dp.datapackageid::text = ds.datapackageid::text
      left join transaction_summary ts on
        ts.datasetid::text = ds.datasetid::text
      left join datapackage_checksum dc on
        ts.dataflowid::text = dc.dataflowid::text
        and dp.datapackageid::text = dc.datapackageid::text
        and ts.executionid::text = dc.executionid::text) studycard
    where
      studycard.latest = 1) studycard2
  group by
    studycard2.prot_id,
    studycard2.protocolnumber,
    studycard2.protocolnumberstandard,
    studycard2.protocolstatus,
    studycard2.sponsorname,
    studycard2.phase,
    studycard2.projectcode
  order by
    "priorityCount" desc,
    "ingestionCount" desc,
    "staleFilesCount" desc,
    sponsorname asc,
    protocolnumber asc
  `;

    Logger.info({ message: `getUserStudyList` });

    DB.executeQuery(newQuery, [userId]).then((resp) => {
      const studies = resp.rows || [];
      if (studies.length > 0) {
        // studies.forEach();
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          studies
        );
      } else {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          []
        );
      }
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getUserStudyList");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.pinStudy = async (req, res) => {
  try {
    const { userId, protocolId } = req.body;
    const curDate = new Date();
    const insertQuery = `INSERT INTO ${schemaName}.study_user_pin
      (usr_id, prot_id, pinned_stdy, pinned_stdy_dt, insrt_tm, updt_tm)
      VALUES($1, $2, '', $3, $3, $3);
      `;
    Logger.info({ message: "pinStudy" });

    const inset = await DB.executeQuery(insertQuery, [
      userId,
      protocolId,
      curDate,
    ]);
    return apiResponse.successResponseWithData(res, "Operation success", inset);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :pinStudy");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.unPinStudy = async (req, res) => {
  try {
    const { userId, protocolId } = req.body;
    const deleteQuery = `delete from ${schemaName}.study_user_pin where usr_id = $1 and prot_id = $2`;
    Logger.info({ message: "unPinStudy" });
    const del = await DB.executeQuery(deleteQuery, [userId, protocolId]);
    return apiResponse.successResponseWithData(res, "Operation success", del);
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :unPinStudy");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getUserPinnedStudies = function (req, res) {
  try {
    const userId = req.params.userId;
    const query = `select * from ${schemaName}.study_user_pin sup where usr_id = $1 order by pinned_stdy_dt desc `;

    Logger.info({ message: "getUserPinnedStudies" });

    DB.executeQuery(query, [userId]).then((resp) => {
      const studies = resp.rows || [];
      if (studies.length > 0) {
        const protList = studies.map((e) => e.prot_id);
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          protList
        );
      } else {
        return apiResponse.successResponseWithData(
          res,
          "Operation success",
          []
        );
      }
    });
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :getUserPinnedStudies");
    Logger.error(err);
    return apiResponse.ErrorResponse(res, err);
  }
};

exports.searchStudyList = function (req, res) {
  try {
    const searchParam = req.params.searchQuery.toLowerCase();
    const { userId } = req.body;

    Logger.info({
      message: "searchUserStudyList",
      searchParam,
    });

    const searchQuery = `select
    studycard2.prot_id,
    studycard2.protocolnumber,
    studycard2.protocolnumberstandard,
    studycard2.sponsorname,
    studycard2.phase,
    studycard2.protocolstatus,
    studycard2.projectcode,
    sum(
          case
              when studycard2.overallstatus = 'SUCCESSFUL'::text then 1::bigint
              else null::bigint
          end) as "ingestionCount",
    sum(
          case
              when studycard2.overallstatus = 'FAILED'::text then 1::bigint
              else null::bigint
          end) as "priorityCount",
    sum(
          case
              when studycard2.no_of_staledays > studycard2.staledays::double precision then 1::bigint
              else 0::bigint
          end) as "staleFilesCount",
    count(distinct studycard2.dataflowid) as "dfCount",
    count(distinct studycard2.vendid) as "vCount",
    count(distinct studycard2.datapackageid) as "dpCount",
    count(distinct studycard2.datasetid) as "dsCount",
    count(distinct
          case studycard2.dfactive
              when 1::bigint then studycard2.dataflowid
              else null::character varying
          end) as "ActiveDfCount",
    count(distinct
          case studycard2.dfactive
              when 0::bigint then studycard2.dataflowid
              else null::character varying
          end) as "InActiveDfCount",
    coalesce(sum(studycard2.dsactive), 0::bigint) as "ActiveDsCount",
    coalesce(sum(
          case
              when studycard2.dsactive = 0::bigint then 1::bigint
              else null::bigint
          end), 0::bigint::numeric) as "InActiveDsCount"
  from
    (
    select
      studycard.prot_id,
      studycard.protocolnumber,
      studycard.protocolnumberstandard,
      studycard.protocolstatus,
      studycard.sponsorname,
      studycard.phase,
      studycard.projectcode,
      studycard.vendid,
      studycard.dataflowid,
      studycard.dfactive,
      studycard.datapackageid,
      studycard.dpactive,
      studycard.datasetid,
      studycard.dsactive,
      case
        when studycard.dsactive = 1
        and studycard.downloadstatus::text = 'SUCCESSFUL'::text
        and (studycard.processstatus::text = any (array['SUCCESSFUL'::character varying,
        'PROCESSED WITH ERRORS'::character varying]::text[])) then 'SUCCESSFUL'::text
        when studycard.dsactive = 1
        and (studycard.downloadstatus::text = 'FAILED'::text
        or studycard.processstatus::text = 'FAILED'::text) then 'FAILED'::text
        else null::text
      end as overallstatus,
      case
        when studycard.dsactive = 1
        and CURRENT_TIMESTAMP > to_timestamp((studycard.lastmodifiedtime::numeric / 1000::numeric)::double precision) then date_part('day'::text, CURRENT_TIMESTAMP - to_timestamp((studycard.lastmodifiedtime::numeric / 1000::numeric)::double precision))
        else '-1'::integer::double precision
      end as no_of_staledays,
      studycard.staledays
    from
      (
      select
        s.prot_id,
        s.prot_nbr as protocolnumber,
        s.prot_nbr_stnd as protocolnumberstandard,
        s.prot_stat as protocolstatus,
        s2.spnsr_nm as sponsorname,
        s.phase,
        s.proj_cd as projectcode,
        df.vend_id as vendid,
        df.dataflowid,
        df.name as dfname,
        df.active as dfactive,
        dp.datapackageid,
        dp.name as dpname,
        dp.active as dpactive,
        ds.datasetid,
        ds.mnemonic,
        ds.active as dsactive,
        ds.staledays,
        ts.externalid,
        ts.downloadstatus,
        ts.processstatus,
        dc.lastmodifiedtime,
        row_number() over (partition by s.prot_id,
        df.dataflowid,
        dp.datapackageid,
        ds.datasetid
      order by
        ts.externalid desc) as latest
      from
        study_user su
      join study s on
        su.prot_id::text = s.prot_id::text
        and su.act_flg = 1
        and s.active::text = '1'::text
        and su.usr_id = $2
      join study_sponsor ss on
        s.prot_id::text = ss.prot_id::text
      join sponsor s2 on
        s2.spnsr_id::text = ss.spnsr_id::text
      and (LOWER(s.prot_nbr) LIKE $1 OR LOWER(s2.spnsr_nm) LIKE $1 OR LOWER(s.proj_cd) LIKE $1)
      left join dataflow df on
        df.prot_id::text = s.prot_id::text
        and coalesce(df.del_flg, 0) <> 1
      left join datapackage dp on
        df.dataflowid::text = dp.dataflowid::text
      left join dataset ds on
        dp.datapackageid::text = ds.datapackageid::text
      left join transaction_summary ts on
        ts.datasetid::text = ds.datasetid::text
      left join datapackage_checksum dc on
        ts.dataflowid::text = dc.dataflowid::text
        and dp.datapackageid::text = dc.datapackageid::text
        and ts.executionid::text = dc.executionid::text) studycard
    where
      studycard.latest = 1) studycard2
  group by
    studycard2.prot_id,
    studycard2.protocolnumber,
    studycard2.protocolnumberstandard,
    studycard2.protocolstatus,
    studycard2.sponsorname,
    studycard2.phase,
    studycard2.projectcode
  order by
    "priorityCount" desc,
    "ingestionCount" desc,
    "staleFilesCount" desc,
    sponsorname asc,
    protocolnumber asc
  `;
    // and (LOWER(s.prot_nbr) LIKE $1 OR LOWER(s2.spnsr_nm) LIKE $1 OR LOWER(s.proj_cd) LIKE $1)

    DB.executeQuery(searchQuery, [`%${searchParam}%`, userId]).then(
      (response) => {
        const studies = response.rows || [];
        return apiResponse.successResponseWithData(res, "Operation success", {
          studies: studies,
          totalSize: response.rowCount,
        });
      }
    );
  } catch (err) {
    //throw error in json response with status 500.
    Logger.error("catch :searchUserStudyList");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};

exports.getDatasetIngestionDashboardDetail = async function (req, res) {
  try {
    const prot_id = req.params.protocolNumber;
    let where = "";
    let datasetwhere = "";
    const testFlag = req.query.testFlag || null;
    const active = req.query.active || null;
    if (testFlag == 1 || testFlag == 0) {
      where += ` and sms.testdataflow in (${testFlag}) `;
    }
    if (active == 1 || active == 0) {
      datasetwhere += ` and sms.activedataset in (${active}) `;
    }
    Logger.info({
      message: "getDatasetIngestionDashboardDetail",
      prot_id,
    });
    const countQuery = `select prot_id,
    sum(inqueue) as in_queue,
    sum(datarefreshalerts) as data_refresh_alerts,
    sum(datalatencywarnings) as data_latency_warnings,
    count(failedLoads) as failed_loads,
    sum(quarantinedfiles) as quarantined_files,
    count(EXCEEDS_PCT_CNG) as files_exceeding,
    count(filesWithIngestionIssues) as fileswith_issues,
    count(is_stale) as stale_datasets from ${schemaName}.study_monitor_summary sms where sms.prot_id = $1 ${where} group by prot_id;`;
    const summaryCount = await DB.executeQuery(countQuery, [prot_id]);

    const searchQuery = `select quarantinedfiles as quarantined_files, lastattempted, datarefreshalerts as data_refresh_alerts, datalatencywarnings as data_latency_warnings, exceeds_pct_cng, sms.prot_id,df.name as dataflow_name,downloadstatus,downloadendtime,processstatus,processendtime,datasetid,datasetname,vendorsource,jobstatus,filename,datasetstatus,exceeds_pct_cng,lastfiletransferred,packagename,mnemonicfile,clinicaldatatypename,loadtype,downloadtrnx,processtrnx,offset_val,errmsg, s.prot_nbr as prot_nbr  from ${schemaName}.study_monitor_summary sms left join ${schemaName}.study s on sms.prot_id = s.prot_id left join ${schemaName}.dataflow df on sms.dataflowid = df.dataflowid where sms.prot_id = $1 ${where} ${datasetwhere}`;
    DB.executeQuery(searchQuery, [prot_id]).then((response) => {
      const datasets = response.rows || [];
      const summary = summaryCount.rows ? summaryCount.rows[0] : {};
      return apiResponse.successResponseWithData(res, "Operation success", {
        summary: summary,
        datasets: datasets,
        totalSize: response.rowCount,
      });
    });
  } catch (err) {
    //throw error in json response with status 500.
    console.log(err, "eerre");
    Logger.error("catch :getDatasetIngestionDashboardDetail");
    Logger.error(err);

    return apiResponse.ErrorResponse(res, err);
  }
};
