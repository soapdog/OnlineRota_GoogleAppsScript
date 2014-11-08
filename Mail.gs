function sendRota() {
  init(false);
  var buf = "";
  var vals = getFirstDates(3).split(",");
  for(var i=0; i<vals.length; i++) {
      var val = vals[i];
      buf += getDateTable(val, dates.idates[val]);
  }
  buf += "<p><a href='"+siteid+"/rotasearch'>Online Rota</a></p>";

  MailApp.sendEmail(
    {
     to: emailid,
     subject: "Upcoming Rota - Automated Message",
     htmlBody: buf
    }
  );
}

function publishRota() {
  init(false);
  var buf = "<h4>This page is re-created daily from the rota spreadsheet.</h4>";
  var vals = getFirstDates(12).split(",");
  for(var i=0; i<vals.length; i++) {
      var val = vals[i];
      buf += getDateTable(val, dates.idates[val]);
  }

  SitesApp.getPageByUrl(siteid+"/rotasearch").setHtmlContent(buf);
}


/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Mail Rota",
    functionName : "sendRota"
  },
  {
    name : "Publish Rota",
    functionName : "publishRota"
  }];
  spreadsheet.addMenu("Script Rota", entries);
};
