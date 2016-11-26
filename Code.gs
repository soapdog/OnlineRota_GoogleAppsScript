/*
 * Rota Generation Code.
 * This code can be embedded in a Google Site, in a Google Spreadsheet, or as a Google App Web Service.  Initilization will depend on how the item is stored
 *
 * PRE-REQUISITES
 * ================================================================
 * 1. A Spreadsheet with the Following Layout
 * ----------------------------------------------------------------
 * [     ] [date]    [date] Dates in ascending order.  Dates in the past will be skipped
 * [     ] [service/string] [service/string] 
 * [role]  [participant]  [participant]
 *         [participant]  [participant]  Role repeats if blank
 * Declare global variables
 * The initial solution stored these objects in ScriptDB which influenced the object structure
 *
 * 2. A Google Site with a Writable Web Page To Contain the Published Rota
 * ----------------------------------------------------------------
 *
 * 3. Google Apps Script Properties (embedded in the script)
 * ----------------------------------------------------------------
 * rotaid   The google apps object id of the spreadsheet to process.  If the script is embedded in a Google Sheet, that spreadsheet will be used.
 * emailid  The email recipient to use for sending out the published rota.  If not set, the spreadsheet owner will be used.
 * rotamod  Contains the last date that the rota was published to the website.  Updates will not be published if no recent changes exist.
 * siteid   The URL to the Google Site to which the rota will be published.  If not set, the first Google site owned by the user will be used.
 * pageId   The page name (within the google site) to which the rota will be published.  If not set, "rotasearch" will be used.
 */

//properties
var prop = PropertiesService.getScriptProperties();


/*
 * Variables that need to be modified for each run
 */
// Email recipient for rota messages.  Ideally this is a group email for all rota participants.
//var emailid = "yourtest____test@gmail.com";
var emailid = getProperty("emailid", SpreadsheetApp.getActive().getOwner().getEmail());


//Key of the source spreadsheet, this can be pulled from the spreadsheet URL
//var rotaid = "1T_AnSoz893QY1IL9uH9L8mH220Wp6WE_Weaq3VkxOX4";
var rotaid = getProperty("rotaid", SpreadsheetApp.getActive().getId());

function init() {
  return loadRotaFromSpreadsheet();
}

function getProperty(key, def) {
  var s = prop.getProperty(key);
  return (s == null) ? def : s;
}
 
//get last modified date for the spread sheet
function getLastModified() {
  var rotaFile = DriveApp.getFileById(rotaid);
  if (rotaFile == null) return "";
  return getTimeStr(rotaFile.getLastUpdated());
}

// Determine if the spreadsheet has changed 
function hasSpreadsheetChanged() {
  var rotamod = prop.getProperty("lastmod");
  if (rotamod != null) {
    var last = getLastModified();
    if (rotamod == last){
      return false;
    }
  }
  prop.setProperty("lastmod", last);
  return true;
}

//Build object representation of spreadsheet contents
function loadRotaFromSpreadsheet() {
  //initialize objects and arrays
  var DATA = {
    dates: {type: 'dates'},
    roles: {type: 'roles'}
  };

  //key values normalized as object properties
  var dates = DATA.dates;
  dates.idates = {};
  var roles = DATA.roles;
  roles.iroles = {};
  roles.oroles = [];
  
  var rows = {type: 'rows'};
  rows.row ={};
  rows.role={};
  
  var people = {type: 'people'};
  people.ipeople ={};
  
  var batch = [];
  
  var rota =  SpreadsheetApp.openById(rotaid);
  
  if (rota == null) return;
  var sheet = rota.getSheets()[0];
  
  var data = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getValues();
  
  var dateobj = new Object();
  
  var lastrole = null;
  for(var r=2; r<data.length; r++) {
    var currole = data[r][0];
    if (currole == null || currole == "") currole = lastrole;
    lastrole = currole;
    if (lastrole == null) continue;
    
    //somre roles are always skipped
    if (isSkip(currole)) continue;
    var k = makeKey(currole);
    if (roles.iroles[k] == null) {
      roles.iroles[k] = currole;
      roles.oroles.push(k);
    }
    rows.row[r] = k;
    if (rows.role[k] == null) rows.role[k] = [];
    rows.role[k].push(r);
  }  

  for(var c=1; c<data[0].length; c++) {
    //skip over columns for dates in the past
    var v = testFutureDate(data[0][c]);
    if (v == null) continue;
    var d = getSortableDateStr(v);
    if (dates.idates[d] == null) dates.idates[d] = new Object({service : []});
 
    //create array of services for each date
    var num = dates.idates[d].service.length + 1;
    var datenum = d + "_" + num;
    var num = dates.idates[d].service.length + 1;
    var datenum = d + "_" + num;
    var serviceTime = data[1][c];
    
    Logger.log(serviceTime);
    if (serviceTime instanceof Object) {
      try {
        serviceTime = new Date(serviceTime);
        var hour = serviceTime.getHours();
        var ap = (hour >= 12) ? "pm" :"am";
        hour = (hour > 12) ? hour - 12 : (hour == 0) ? 12 : hour;
        hour = (hour > 9) ? hour : "0" + hour;
        var min = serviceTime.getMinutes();
        min = (min > 9) ? min : "0" + min;
        serviceTime = hour + ":" + min + ap;
      } catch(e) {
        Logger.log(e);
      }
      Logger.log(serviceTime);
    }
    
    var service = new Object({type: 'service', date: d, service_time: serviceTime, num: num, datenum: datenum, name: serviceTime, role: {}});
    dates.idates[d].service.push(service);
    for(var r=2; r<data.length; r++) {
      if (rows.row[r] == null) continue;
      var k = rows.row[r];
      var v = data[r][c];
      if (v == null) continue;
      if (v == "") continue;
      var va = v.split("\n");
      if (service.role[k] == null) service.role[k] = [];
      for(i=0;i<va.length;i++){
        service.role[k].push(va[i]);
        var pk = makeKey(va[i]);
        if (people.ipeople[pk] == null) {
          people.ipeople[pk] = {name: va[i], roles: {}};
        }
        if (people.ipeople[pk].roles[datenum] == null) {
          people.ipeople[pk].roles[datenum] = [];
        }
        people.ipeople[pk].roles[datenum].push(k);
      }  
    }
  }  
  return DATA;
}
