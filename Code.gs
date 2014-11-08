var dates;
var roles;
var rows;
var people;
var app;
var rotamod;

var emailid = "yourtest____test@gmail.com";
var siteid = "https://sites.google.com/site/terrywbradyexamples"
var rotaid = "1TkEeO1M-dHDQ5Qoh6PHC5OFGQCJ85gRk9r-9npqDDoA";

function init(load) {
  var lock = LockService.getPublicLock();
  lock.waitLock(60000);
  
  loadRotaFromSpreadsheet();
  lock.releaseLock();
}


function getLastModified() {
  var rotaFile = DocsList.getFileById(rotaid);
  if (rotaFile == null) return "";
  return getTimeStr(rotaFile.getLastUpdated());
}

function hasSpreadsheetChanged() {
  if (rotamod == null) return true;
  var last = getLastModified();
  return (rotamod.mdate != last);
}

function loadRotaFromSpreadsheet() {
  var lock = LockService.getPublicLock();
  lock.waitLock(60000);
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
    var v = testFutureDate(data[0][c]);
    if (v == null) continue;
    var d = getSortableDateStr(v);
    if (dates.idates[d] == null) dates.idates[d] = new Object({service : []});
 
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
