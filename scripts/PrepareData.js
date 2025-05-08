var quota_data;
var interview_data;
var today_flight_list;
var this_month_flight_list;
var daily_plan_data;
var removed_ids_data;

var currentMonth;
var currentDate;
var nextDate;
var download_time;

var total_quota;
var total_completed;
var total_completed_percent;

var total_quota_completed;
var report_version = 1;
/************************************/
function initCurrentTimeVars() {
  var d = new Date();
      
  var month = '' + (d.getMonth() + 1); //month start from 0;
  
  var day = '' + d.getDate();
  var year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  currentMonth =[month,year].join('-')
  currentDate = [day, month,year].join('-');
  
  //next day
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
  var tomorrowMonth = '' + (tomorrow.getMonth() + 1); //month start from 0;
  var tomorrowDay = '' + tomorrow.getDate();
  var tomorrowYear = tomorrow.getFullYear();

  if (tomorrowMonth.length < 2) 
  tomorrowMonth = '0' + tomorrowMonth;
  if (tomorrowDay.length < 2) 
  tomorrowDay = '0' + tomorrowDay;
  nextDate  = [tomorrowDay, tomorrowMonth, tomorrowYear].join('-');

  //return [day, month,year].join('-');
  if (document.getElementById('year_month') && document.getElementById('year_month').value.length > 0)
  {
    if (document.getElementById('year_month').value != "current-month")
    {
      currentMonth = document.getElementById('year_month').value;
    }
  }
  console.log("currentMonth: ", currentMonth);
  switch(currentMonth) {
    case "01-2023":
    case "02-2023":
    case "03-2023":                  
    case "04-2023":
    case "05-2023":
    case "06-2023":
    case "07-2023":
      report_version = 1;
      total_quota = 750;
      total_arrival_quota = 250;
      break;
    case "08-2023":
    case "09-2023":      
    case "10-2023":          
    case "11-2023":          
    case "12-2023":      
      report_version = 2;        
      total_quota = 1125;
      total_arrival_quota = 375;
      break;

    case "11-2024":          
        report_version = 2;        
        total_quota = 1500;
        total_arrival_quota = 500;
      break;      
    case "12-2024":      
    case "01-2025":      
    case "02-2025":      
    case "03-2025":                  
    case "04-2025":    
    report_version = 2;        
    total_quota = 1125;
    total_arrival_quota = 375;
    break;  
    
    case "05-2025":                  
    case "06-2025":                  
    case "07-2025":                  
    case "08-2025":                                      
    case "09-2025":                                      
    case "10-2025":                                      
    case "11-2025":                                      
    case "12-2025":                                                      
      report_version = 2;        
      total_quota = 1100;
      total_arrival_quota = 450;
      break;      
    
    default:
      report_version = 2;        
      total_quota = 1125;
      total_arrival_quota = 375;
      break;
  }
}

function isCurrentMonth(interviewEndDate)
{
// Input: "2023-04-03 10:06:22 GMT"
  var interviewDateParsed = interviewEndDate.split("-")

  var interviewYear = (interviewDateParsed[0]);
  var interviewMonth =(interviewDateParsed[1]);
  
  var result = false;

  if ( currentMonth ==[interviewMonth,interviewYear].join('-'))
  {
    result = true;
  }

   return result;
}

function notDeparted(flight_time) {
  var current_time = new Date().toLocaleString('be-BE', { timeZone: 'Europe/Brussels', hour12: false});
  //15:13:27
  var current_time_value  = current_time.substring(current_time.length-8,current_time.length-6) * 60;
  current_time_value += current_time.substring(current_time.length-5,current_time.length-3)*1;

  //Time: 0805    
  var flight_time_value = flight_time.substring(0,2) * 60 + flight_time.substring(2,4)*1;

  var result = (flight_time_value > current_time_value);

  return (result);
}

function isvalid_id(id)
{
  valid = true;

  var i = 0;
  for (i = 0; i < removed_ids_data.length; i++) 
  { 
    if (removed_ids_data[i].removed_id == id)
    {
      valid = false;
    }
  }
  return valid;
}
function prepareInterviewData() {
  var quota_data_temp = JSON.parse(Destination_Quota);
  removed_ids_data = JSON.parse(removed_ids);

  var interview_data_temp  = JSON.parse(interview_statistics);
  var flight_list_temp  = JSON.parse(MUC_Departures_Flight_List_Raw);
  var gate_info  = JSON.parse(MUC_Gate_Info);

  initCurrentTimeVars();	

  //get quota data
  quota_data = [];
  quota_data.length = 0;
  for (i = 0; i < quota_data_temp.length; i++) {
    var quota_month =  quota_data_temp[i].Month + "-"  + quota_data_temp[i].Year; 
    if ((quota_month== currentMonth) && (quota_data_temp[i].Quota>0))
    {
      quota_data.push(quota_data_temp[i]);
    }
  }

  //get relevant interview data
  //empty the list
  interview_data = [];
  interview_data.length = 0;

  download_time = interview_data_temp[0].download_time;

  for (i = 0; i < interview_data_temp.length; i++) {
    var interview = interview_data_temp[i];

    //only get complete interview & not test
    if ( // (interview.InterviewState == "Complete") && 
      (isCurrentMonth(interview.Interview_Date))
      )
    {
      if (interview["Dest"]) {
        if (report_version == 2) {
          interview.quota_id = interview["Dest"] + " - "  +  interview["AirlineCode"];
        }
        else {
          interview.quota_id = interview["Dest"];
        }
        
        interview.InterviewEndDate = interview["InterviewEndDate"];
        interview_data.push(interview);

      }
      else{
        console.log("ignored interview: ", interview);
      }
    }
  }

  //prepare flight list
  //empty the list
  today_flight_list = [];
  today_flight_list.length = 0;
  
  this_month_flight_list  = [];
  this_month_flight_list.length = 0;
  
  for (i = 0; i < flight_list_temp.length; i++) {
    let flight = flight_list_temp[i];
    //currentMonth: 02-2023
    //flight.Date: 08-02-2023
    if (report_version == 2) {
      flight.quota_id = flight.Dest + " - " +  flight.AirlineCode ;    }
    else {
      flight.quota_id = flight.Dest;
    }

    if (currentMonth == flight.Date.substring(3,10)) { 
      this_month_flight_list.push(flight);
    }	

    //only get today & not departed flight
    if (((currentDate == flight.Date) && notDeparted(flight.Time))
        || (nextDate == flight.Date)
        )
    { 
      flight.Date_Time = flight.Date.substring(6,10) + flight.Date.substring(3,5) + flight.Date.substring(0,2) + flight.Time;
      //flight.Date_Time = flight.Time;
      today_flight_list.push(flight);
    }
			   
  }
    //add quota data
    //empty the list
  daily_plan_data = [];
  daily_plan_data.length = 0;
  
  for (i = 0; i < today_flight_list.length; i++) {
    let flight = today_flight_list[i];

    //get gate info
    for (j = 0; j < gate_info.length; j++) {
      let gate = gate_info[j];
      if ((gate.Flight == flight.Flight) && (gate.Date == flight.Date))
      {
        flight.GateArea = gate.GateArea;
        flight.Gate = gate.Gate;
        break;
      }
    }

    for (j = 0; j < quota_data.length; j++) {
      let quota = quota_data[j];
      if ((quota.quota_id == flight.quota_id) && (quota.Quota>0))
      {
        flight.Quota = quota.Quota;
        daily_plan_data.push(flight);
        break;
       }
    }
  
  }
    //console.log("daily_plan_data:", daily_plan_data)
}
