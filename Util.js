function makeKey(s) {
  return s.replace(/[^a-zA-Z0-9]/g,"");
}

function getEndDate(days) {
  var d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function getRange(d1, d2) {
  return Utilities.formatDate(d1, 'GMT-5', 'yyyy-MM-dd') + " to " + Utilities.formatDate(d2, 'GMT-5', 'yyyy-MM-dd'); 
}


function testRow(arr, s) {
  var x = ""+s;
  for(i=0; i<arr.length; i++) {
    if (x == arr[i]) return true;
  }
  return false;
}


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


function getRotaDates() {
  return Object.keys(dates.idates).sort().join(",");
}

function getRotaPeople() {
  return Object.keys(people.ipeople).sort().join(",");
}

function getRotaRoles() {
  return Object.keys(roles.iroles).sort().join(",");
}

function getTimeStr(v) {
  if (v == null) return null;
  if (!(v instanceof Date)) return null;
  
  return Utilities.formatDate(v, 'GMT-5', 'yyyy-MM-dd_HHmmss');
}    

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

function testFutureDate(v) {
  if (v == null) return null;
  if (!(v instanceof Date)) return null;
  
  if (v < getEndDate(-1)) return null;
  return v;
}    

function getFirstDate() {
  return getFirstDates(1);
}

function getFirstDates(n) {
  var dates = getRotaDates();
  if (dates == null) return "";
  var arr = dates.split(",");
  if (arr.length > n) arr.length = n;
  return arr.join(",");
}
