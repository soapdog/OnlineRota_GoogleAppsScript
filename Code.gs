/*
 * Rota Generation Code.
 * This code can be embedded in a Google Site, in a Google Spreadsheet, or as a Google App Web Service.  Initilization will depend on how the item is stored
 *
 * [     ] [date]    [date] Dates in ascending order
 * [     ] [service/string] [service/string] 
 * [role]  [participant]  [participant]
 *         [participant]  [participant]  Role repeats if blank
 * Declare global variables
 * The initial solution stored these objects in ScriptDB which influenced the object structure
 */

// all service dates (from column headers, allowing for multiple services in one date)
var dates;
// all roles, row headers
var roles;
// row data extracted from spreadhseet
var rows;
// all people, from table cells
var people;
//obsolete, used in former ui solution
var app;
//boolean, indicates that the rota spreadsheet has been updated since some triggering event (not currently in use)
//TODO: compare spreadsheet edit date against the last page update date (or cached last update date)
var rotamod;

/*
 * Variables that need to be modified for each run
 */
// Email recipient for rota messages.  Ideally this is a group email for all rota participants.
//var emailid = "yourtest____test@gmail.com";
var emailid = SpreadsheetApp.getActive().getOwner().getEmail();

//Site target of post
//You need to have a google site created.  Create a page called rotasearch on that page and set a simple one column layout on that page.
//var siteid = "https://sites.google.com/site/terrywbradyexamples"
var siteid = SitesApp.getSites()[0].getUrl();

//Key of the source spreadsheet, this can be pulled from the spreadsheet URL
//var rotaid = "1TkEeO1M-dHDQ5Qoh6PHC5OFGQCJ85gRk9r-9npqDDoA";
var rotaid = SpreadsheetApp.getActive().getId();

function init(load) {
  //Create lock if caching data in memory (not applicable to current solution)
  var lock = LockService.getPublicLock();
  lock.waitLock(60000);
  
  loadRotaFromSpreadsheet();
  
  //release loc
  lock.releaseLock();
}

//get last modified date for the spread sheet
function getLastModified() {
  var rotaFile = DocsList.getFileById(rotaid);
  if (rotaFile == null) return "";
  return getTimeStr(rotaFile.getLastUpdated());
}

// Determine if the spreadsheet has changed 
function hasSpreadsheetChanged() {
  if (rotamod == null) return true;
  var last = getLastModified();
  return (rotamod.mdate != last);
}

//Build object representation of spreadsheet contents
function loadRotaFromSpreadsheet() {
  //lock no longer applicable
  var lock = LockService.getPublicLock();
  lock.waitLock(60000);
  
  //initialize objects and arrays
  //key values normalized as object properties
  if (dates == null) dates = {type: 'dates'};
  dates.idates = {};
  if (roles == null) roles = {type: 'roles'};
  roles.iroles = {};
  roles.oroles = [];
  if (rows == null) rows = {type: 'rows'};
  rows.row ={};
  rows.role={};
  if (people == null) people = {type: 'people'};
  people.ipeople ={};
  if (rotamod == null) rotamod = {type: 'mod'};
  rotamod.mdate = getLastModified();
  
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
    var service = new Object({type: 'service', date: d, service_time: data[1][c], num: num, datenum: datenum, name: data[1][c], role: {}});
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
  lock.releaseLock();
}
