// When the document opens, make a Custom Menu for user functions.
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Setup Menu')
    .addItem('Update Student Pages After Roster Change', 'pageMaster')
    .addSeparator()
    .addItem('Install Triggers (Run Once)', 'triggers')
    .addSeparator()
    .addItem('Delete Student Pages', 'deleteStudents')
    .addSeparator()
    .addItem('Restore All Submissions after Delete/Update Pages', 'moveStory')
    .addSeparator()
    .addItem('Make Student Story Books', 'docOutput')
    .addToUi();  
}

// When students drop out, sometimes it's necessary to run this before updating the roster.
// It really depends on what is being changed on the roster.
function deleteStudents() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();  
  for (var x=8; x<sheets.length; x++) {
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheets[x]);
  }
}

// Create the onFormSubmit trigger.
function triggers() {
  var sheet = SpreadsheetApp.getActive();
  ScriptApp.newTrigger("moveStory")
   .timeBased()
   .everyMinutes(15)
   .create();
  ScriptApp.newTrigger("dailyEmailUpdate")
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();
}

// This function creates the pages for each student based off of the info from the Roster, and the Templates. 
// If a student exists already, it doesn't make a new sheet or create a chart.
function pageMaster() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var template1 = ss.getSheetByName('Template - Data');
  var template2 = ss.getSheetByName('Template - Individual Charts');
  var names = ss.getSheetByName('Roster').getDataRange().getDisplayValues();
  
  names.forEach(function(row,index) {
    if (index > 0) {
      if (row[2] !== "") {
        if (!ss.getSheetByName(row[2])) {
          var userSheet = ss.insertSheet(ss.getSheets().length + 1, { template: template1 });
          userSheet.setName(row[2]);
        }
        if (!ss.getSheetByName(row[2] + ' Charts')) {
          var userCharts = ss.insertSheet(ss.getSheets().length + 1, { template: template2});
          userCharts.setName(row[2] + ' Charts');
          // Calls the chart making function
          chartGet(userSheet,userCharts);                
        }
      }
    }
  });
  
  var main = ss.getSheetByName('MAIN');
  var formula = formulaMaker(names);
  main.getRange(2,1).setFormula(formula);
}

// Calls the function which makes the individual user charts
function chartGet(dataPage, chartPage) {
  var chartOrders = [['P2:P50'],['O2:O50','J2:J50'],['O2:O50','J2:J50'],['B2:B50','J2:J50'],['O2:O50','N2:N50'],['A2:A50','J2:J50']];
  var charts = chartPage.getCharts();
  
  for (var x=0; x<charts.length; x++) {
    var newChart = charts[x].modify();
    newChart.removeRange(chartPage.getRange('A1')).setOption('width', 600);    
    chartOrders[x].forEach(function(range) {
      newChart.addRange(dataPage.getRange(range));                            
    });          
    chartPage.updateChart(newChart.build());
  }
}