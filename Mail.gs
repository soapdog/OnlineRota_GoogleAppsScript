//Format a table for a given date
function getDateTable(DATA, d, daterec) {
  var roles = DATA.roles;
  var service = daterec.service;
  
  var h = "<h2 style='text-align: center'>Rota for " + d.substr(5,2) +"/"+d.substr(8,2)+"/"+d.substr(0,4) +"</h2>";  
  var table = "<table style='border-collapse: collapse;'>";
  table += "<tr><td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>Role</td>";
  for(var i=0; i<service.length; i++) {
    table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>" + service[i].name + "</td>";
  }
  table += "</tr>";
  for(var ri=0; ri<roles.oroles.length; ri++) {
    var vr = roles.oroles[ri];
    var hasval = false;
    for(var i=0; i<service.length; i++) {
      var v = service[i].role[vr];
      if (v != null) hasval = true;
    }
    if (isSeasonal(roles.iroles[vr]) && !hasval) continue;
    
    table += "<tr><td style='border: thin solid black;font-weight: bold; width: 200px; padding: 4px;'>"+roles.iroles[vr]+"</td>";
    for(var i=0; i<service.length; i++) {
      var v = service[i].role[vr];
      if (v==null) v = "&nbsp;";
      v = ""+v;
      table += "<td style='border: thin solid black; width: 200px; padding: 4px;'>" + v.replace(/,/g,'<br/>') + "</td>";
    }
    table += "</tr>";
  }
  table += "</table>";
  
  return h+table;
 
}

// email the rota to the designated recipient(s), display UI confirmation
function sendRotaWithUi() {
  sendRotaAdd(emailid);
  linkToGoogleSiteWithTitle("Updated Rota Mailed to "+addr);
}


// email the rota to the designated recipient(s), no UI confirmation so this is callable from a time-based trigger
function sendRota() {
  sendRotaAdd(emailid);
}

// email the rota to a specific address
function sendRotaAdd(addr) {
  var DATA = init();
  var dates = DATA.dates;
  var buf = "";
  var vals = getFirstDates(DATA, 3).split(",");
  for(var i=0; i<vals.length; i++) {
      var val = vals[i];
      buf += getDateTable(DATA, val, dates.idates[val]);
  }
  var page = getPublishPage();
  if (testPublishPage(page)) {
    buf += "<p><a href='"+page+"'>Online Rota</a></p>";
  }

  MailApp.sendEmail(
    {
     to: addr,
     subject: "Upcoming Rota - Automated Message",
     htmlBody: buf
    }
  );
}

//Get the site id for publishing a rota to Google Sites
function getSiteid() {
  //Site target of post
  //You need to have a google site created.  Create a page called rotasearch on that page and set a simple one column layout on that page.
  //var siteid = "https://sites.google.com/site/terrywbradyexamples"
  var defsite = SitesApp.getSites().length > 0 ? SitesApp.getSites()[0].getUrl() : null;
  return getProperty("siteid", defsite);
}  


//publish the rota to a google sites page, add UI confirmation
function publishRotaWithUi() {
  if (publishRota()) {
    SitesApp.getPageByUrl(page).setHtmlContent(buf);
    linkToGoogleSiteWithTitle("Google Sites Publishing Page Updated");
  } else {
    noGoogleSite();
  }
}


//publish the rota to a google sites page, this has no UI interaction and may be called from a time-based trigger
function publishRota() {
  var page = getPublishPage();
  if (testPublishPage(page)) {
    if (!hasSpreadsheetChanged()) return;
    var DATA = init();
    var dates = DATA.dates;
    var buf = "<h4>This page is re-created daily from the rota spreadsheet.</h4>";
    buf += "<div>Last update: " + prop.getProperty("lastmod") + "</div>";
    var vals = getFirstDates(DATA, 12).split(",");
    for(var i=0; i<vals.length; i++) {
      var val = vals[i];
      buf += getDateTable(DATA, val, dates.idates[val]);
    }
    return true;
  } else {
    return false;
  }
}

//Create a dialog with a link to the published rota
function linkToGoogleSite() {
  linkToGoogleSiteWithTitle("Google Sites Publishing Page");
}

//Create a dialog with a link to the published rota and title
function linkToGoogleSiteWithTitle(title) {
  var page = getPublishPage();
  if (testPublishPage(page)) {
    var htmlOutput = HtmlService.createHtmlOutput("<a href='"+page+"' target='_blank' title='"+page+"'>Open Google Sites Rota Page</a>");
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, title);
  } else {
    noGoogleSite();
  }
}

//Present a warning dialog with that a sites publishing page cannot be found
function noGoogleSite() {
  SpreadsheetApp.getUi().alert("No Google Site set for publishing\n\t1)Set a script property with a URL to a Google Site for which you have write access \nOR\n\t2)Create a new Google Site under your user account");
}

//Get the default page name for the published rota
function getPageid() {
  //default page name on site
  var pageid = getProperty("pageid", "rotasearch");
  return pageid;
}

//Get the URL to the published page on Google Sites
function getPublishPage() {
  var siteid = getSiteid();
  if (siteid == null) {
    return null;
  }
  var pageid = getPageid();
  if (pageid == null) {
    return null;
  }
  return siteid + "/" + pageid;
}

//Check if the Sites publishing page exists
function testPublishPage(page) {
  var spage = null;
  try {
    spage = SitesApp.getPageByUrl(page);
  } catch(e) {
  }
  return spage != null;
}

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen(e) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [
    {
      name : "Mail Rota",
      functionName : "sendRota"
    },
    {
      name : "Publish Rota",
      functionName : "publishRota"
    },
    {
      name : "Open Publishing Page",
      functionName : "linkToGoogleSite"
    },
    { 
      name : "Count Assignments By Name",
      functionName : "countAssignments"
    }
  ];
  spreadsheet.addMenu("Script Rota", entries);
};

/*
 * Display a unique list of people assigned to a role and the count of assignments for each person
 */
function countAssignments() {
  var DATA = init();
  var people_arr = [];
  for(pk in DATA.people.ipeople) {
    var p = DATA.people.ipeople[pk];
    p.count = 0;
    for(dn in p.roles) {
      p.count += p.roles[dn].length;
    }
    people_arr[people_arr.length] = p;
  }
  people_arr = people_arr.sort(function(a,b){
    if (a.count == b.count) return 0;
    if (a.count < b.count) return 1;
    return -1;
  });
  var html = HtmlService.createHtmlOutput("<table><tr><th>Assignee</th><th>Num Assignments</th></tr>");
  for(var i=0; i<people_arr.length; i++) {
    var p = people_arr[i];
    html.append("<tr><th>"+p.name+"</th><td>"+p.count+"</td></tr>");
  }
  html.append("</table>");
  SpreadsheetApp.getUi().showModalDialog(html, "Current Assignments");
}