//Turn a cell value into a javascript property
function makeKey(s) {
  return s.replace(/[^a-zA-Z0-9]/g,"");
}

//Set an end date a number of days in the future
function getEndDate(days) {
  var d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

//Create a formatted date range for 2 dates
function getRange(d1, d2) {
  return Utilities.formatDate(d1, 'GMT-5', 'yyyy-MM-dd') + " to " + Utilities.formatDate(d2, 'GMT-5', 'yyyy-MM-dd'); 
}

//test if a value is in a row
function testRow(arr, s) {
  var x = ""+s;
  for(i=0; i<arr.length; i++) {
    if (x == arr[i]) return true;
  }
  return false;
}

//Obsolete
function isSpan(s) {
  return testRow([], s);
}


/*Array of roles to skip when empty*/
function isSeasonal(s) {
  return testRow([], s);
}

/*Array of roles to skip*/
function isSkip(s) {
  return testRow([], s);
}

//get array of defined dates
function getRotaDates() {
  return Object.keys(dates.idates).sort().join(",");
}

//get array of defined people
function getRotaPeople() {
  return Object.keys(people.ipeople).sort().join(",");
}

//get array of defined roles
function getRotaRoles() {
  return Object.keys(roles.iroles).sort().join(",");
}

//get a date/time as a string
function getTimeStr(v) {
  if (v == null) return null;
  if (!(v instanceof Date)) return null;
  
  return Utilities.formatDate(v, 'GMT-5', 'yyyy-MM-dd_HHmmss');
}    

//get a date as a string
function getDateStr(v) {
  if (v == null) return null;
  if (!(v instanceof Date)) return null;
  
  return Utilities.formatDate(v, 'GMT', 'MMM dd, yyyy');
}    
  
function getSortableDateStr(v) {
  if (v == null) return null;
  if (!(v instanceof Date)) return null;
  
  return Utilities.formatDate(v, 'GMT', 'yyyy-MM-dd');
}    

//test if a date is in the future
function testFutureDate(v) {
  if (v == null) return null;
  if (!(v instanceof Date)) return null;
  
  if (v < getEndDate(-1)) return null;
  return v;
}    

//get the next defined date in the set of dates
function getFirstDate() {
  return getFirstDates(1);
}

//get the first n dates in a set of dates
function getFirstDates(n) {
  var dates = getRotaDates();
  if (dates == null) return "";
  var arr = dates.split(",");
  if (arr.length > n) arr.length = n;
  return arr.join(",");
}
