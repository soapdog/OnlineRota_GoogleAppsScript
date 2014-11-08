function getDateTable(d, daterec) {
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

/*
function getRoleTable(prole, result) {
  var service = [];
 
  while(result.hasNext()) {
    service.push(result.next());
  }
  var h = "<h2 style='text-align: center'>Role: " + roles.iroles[prole] +"</h2>";  
  var table = "<table style='border-collapse: collapse;'>";
  table += "<tr>";
  table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>Date</td>";
  table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>Service</td>";
  table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>Participant</td>";
  for(var i=0; i<service.length; i++) {
    var v = service[i].role[prole];
    if (v==null) v = "&nbsp;";
    v = ""+v;
    table += "<tr>";
    table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>" + service[i].date + "</td>";
    table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>" + service[i].name + "</td>";
    table += "<td style='border: thin solid black; width: 200px; padding: 4px;'>" + v.replace(/,/g,'<br/>') + "</td>";
    table += "</tr>";
  }
  table += "</table>";
  return h+table;
 
}

function getPersonTable(person) {
  var srvs = people.ipeople[person].roles;
  var sarr = Object.keys(srvs).sort();
  var HTML = app.getElementById("htmlshow");
  var h = "<h2 style='text-align: center'>Upcoming roles for " + people.ipeople[person].name +"</h2>";  
  var table = "<table style='border-collapse: collapse;'>";
  table += "<tr>";
  table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>Date</td>";
  table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>Service</td>";
  table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>Role</td>";
  table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>Participant</td>";
  table += "</tr>";

  for(var i=0; i<sarr.length; i++) {
    var dn = sarr[i];
    var service = db.query({type: 'service', datenum: dn}).next();
    if (service == null) continue;
    var rarr = srvs[dn];
    for(var r=0; r<rarr.length; r++){
      var role = rarr[r];
      table += "<tr>";
      table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>" + service.date + "</td>";
      table += "<td style='border: thin solid black; font-weight: bold; width: 200px; padding: 4px;'>" + service.name + "</td>";
      table += "<td style='border: thin solid black; width: 200px; padding: 4px;'>" + roles.iroles[role] + "</td>";
      v = "" + service.role[role];
      table += "<td style='border: thin solid black; width: 200px; padding: 4px;'>" + v.replace(/,/g,'<br/>') + "</td>";
      table += "</tr>";
    }
  }
  table += "</table>";
  return h+table;
 
}
*/
