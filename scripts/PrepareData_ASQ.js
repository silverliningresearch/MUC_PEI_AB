var dest_airline_quota_asq;
var airline_quota_asq;
var dest_quota_asq;

var interview_data_asq;
var today_flight_list_asq;
var this_month_flight_list_asq;
var daily_plan_data_asq;

var currentDate; //dd-mm-yyyy
var currentMonth; //mm
var currentYear;
var currentQuarter; //2023-Q1, 2023-Q2
var nextDate; //dd-mm-yyyy

var download_time_asq;

var total_quota_asq = 17000;
var total_completed_asq;
var total_completed_percent_asq;

var total_quota_completed_asq;
var total_hard_quota_asq;

/************************************/
/************************************/
function initCurrentTimeVars_asq() {
  var today = new Date();

  var day = '' + today.getDate();
  var month = '' + (today.getMonth() + 1); //month start from 0;
  var year = today.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  currentDate = [day, month, year].join('-');
  currentYear = year;
  currentMonth = month; //[month, year].join('-');;
  currentQuarter = getQuarterFromMonth_asq(currentMonth, currentYear);

  //////////
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate()+1);
  var tomorrowMonth = '' + (tomorrow.getMonth() + 1); //month start from 0;
  var tomorrowDay = '' + tomorrow.getDate();
  var tomorrowYear = tomorrow.getFullYear();

  if (tomorrowMonth.length < 2) tomorrowMonth = '0' + tomorrowMonth;
  if (tomorrowDay.length < 2) tomorrowDay = '0' + tomorrowDay;

  nextDate  = [tomorrowDay, tomorrowMonth, tomorrowYear].join('-');
  //////////
  if (document.getElementById('year_month') && document.getElementById('year_month').value.length > 0)
  {
    if (document.getElementById('year_month').value != "current-quarter")
    {
      currentQuarter = document.getElementById('year_month').value;
    }
  }
 
  switch(currentQuarter) {
    case "2023-Q2":
      total_quota_asq = 700;
      break;
    case "2023-Q3":
      total_quota_asq = 700;
      break;
    case "2023-Q4":
      total_quota_asq = 700;
      break;   
    case "2024-Q1":
        total_quota_asq = 700;
        break;            
    case "2024-Q2":
      total_quota_asq = 700;
      break;            
    case "2024-Q3":
      total_quota_asq = 700;
      break;            
    case "2024-Q4":
      total_quota_asq = 700;
      break;            
  
    default:
      total_quota_asq = 700;
      break;
  }
}

function getQuarterFromMonth_asq(month, year)
{
  //Input: mm, yyyy
  var quarter = 0;
  
  if ((month == '01') || (month == '02') || (month == '03')) {
    quarter = "Q1";  
  }
  else if ((month == '04') || (month == '05') || (month == '06')) {
    quarter = "Q2";  
  }
  else if ((month == '07') || (month == '08') || (month == '09')) {
    quarter = "Q3";  
  }
  else if ((month == '10') || (month == '11') || (month == '12')) {
    quarter = "Q4";  
  }
  return (year + "-" + quarter);
}

function notDeparted_asq(flight_time) {
  var current_time = new Date().toLocaleString('be-BE', { timeZone: 'Europe/Brussels', hour12: false});
  //15:13:27
  var current_time_value  = current_time.substring(current_time.length-8,current_time.length-6) * 60;
  current_time_value += current_time.substring(current_time.length-5,current_time.length-3)*1;

  //Time: 0805    
  var flight_time_value = flight_time.substring(0,2) * 60 + flight_time.substring(2,4)*1;

  var result = (flight_time_value > current_time_value);
  return (result);
}

function prepareInterviewData_asq() {
  var dest_airline_quota_asq_temp = JSON.parse(AirlineDest_quota_ASQ);
  var airline_quota_asq_temp = JSON.parse(Airline_quota_ASQ);
  var dest_quota_asq_temp = JSON.parse(Dest_quota_ASQ);
  
  var interview_data_asq_temp  = JSON.parse(interview_statistics_asq);
  var flight_list_temp  = JSON.parse(MUC_Departures_Flight_List_Raw);
  var gate_info  = JSON.parse(MUC_Gate_Info);
  
  initCurrentTimeVars_asq();	
  
  //get quota data
  dest_airline_quota_asq = [];
  dest_airline_quota_asq.length = 0;
  for (i = 0; i < dest_airline_quota_asq_temp.length; i++) {
    if (dest_airline_quota_asq_temp[i].Quarter == currentQuarter)
    {
      dest_airline_quota_asq.push(dest_airline_quota_asq_temp[i]);
    }
  }
  
  airline_quota_asq = [];
  airline_quota_asq.length = 0;
  for (i = 0; i < airline_quota_asq_temp.length; i++) {
    if (airline_quota_asq_temp[i].Quarter == currentQuarter)
    {
      airline_quota_asq.push(airline_quota_asq_temp[i]);
    }
  }

  dest_quota_asq = [];
  dest_quota_asq.length = 0;
  for (i = 0; i < dest_quota_asq_temp.length; i++) {
    if (dest_quota_asq_temp[i].Quarter == currentQuarter)
    {
      dest_quota_asq.push(dest_quota_asq_temp[i]);
    }
  }

  //get relevant interview data
  //empty the list
  interview_data_asq = [];
  interview_data_asq.length = 0;

  download_time_asq = interview_data_asq_temp[0].download_time;
  for (i = 0; i < interview_data_asq_temp.length; i++) {
    var interview = interview_data_asq_temp[i];
    //only get complete interview & not test
    var interview_year = interview["InterviewDate"].substring(0,4);
    var interview_month = interview["InterviewDate"].substring(5,7);//"2023-04-03 06:18:18"
    var parts = interview["quota_id"].split("-");

    var Agent_Letters = parts[0];
    var Agent_Destination = parts[1];
    
    //speciall treatment for EJU EZY MBU
    if (Agent_Letters == "EZY") Agent_Letters = "U2";
    if (Agent_Letters == "EJU") Agent_Letters = "EC";
    if (Agent_Letters == "MBU") Agent_Letters = "DI";

    var interview_quarter = getQuarterFromMonth_asq(interview_month, interview_year);

    if ((currentQuarter == interview_quarter))
    {
      var Airline_Dest = '"Airline_Dest"' + ":" + '"' + Agent_Letters + "-" + Agent_Destination + '", ';
      var Airline = '"Airline"' + ":" + '"' +  Agent_Letters + '", ';
      var Dest = '"Dest"' + ":" + '"' +  Agent_Destination + '", ';
      var InterviewEndDate = '"InterviewEndDate"' + ":" + '"' +  interview["InterviewDate"]+ '", ' ;
      var Completed_of_interviews = '"Completed_of_interviews"' + ":" + '"' +  interview["Number of interviews"] ;
      var str = '{' + Airline_Dest + Airline + Dest + InterviewEndDate + Completed_of_interviews + '"}';
      interview_data_asq.push(JSON.parse(str));
    }
  }
  
  //prepare flight list
  //empty the list
  today_flight_list_asq = [];
  today_flight_list_asq.length = 0;
  
  this_month_flight_list_asq  = [];
  this_month_flight_list_asq.length = 0;
  
  for (i = 0; i < flight_list_temp.length; i++) {
    let flight = flight_list_temp[i];

    //speciall treatment for EJU and EZY: Airline code in fligth schedule using ICAO, but sampling using IATA 
    var flight_letters = flight.Flight.substring(0,3);
    var flight_number = flight.Flight.substring(3,8);
    flight.Flight_Show = flight.Flight;
    
    if ((flight_letters == "EZY") || (flight_letters == "EJU") || (flight_letters == "MBU")) 
    {
      var new_flight_letters = flight_letters;
      if (flight_letters == "EZY") new_flight_letters = "U2";
      if (flight_letters == "EJU") new_flight_letters = "EC";
      if (flight_letters == "MBU") new_flight_letters = "DI";
      
      flight.Flight_Show = new_flight_letters + " " + flight_number;
      flight.AirlineCode = new_flight_letters;
      
      flight.Flight_Show = flight.Flight_Show + " (" +  flight.Flight +")";
    }


    flight.Airline_Dest = flight.AirlineCode + "-" + flight.Dest;//code for compare

    //for sorting: YYYY-MM-DD
    flight.DateTimeID = flight.Date.substring(6,10) +  flight.Date.substring(3,5) +  flight.Date.substring(0,2) + flight.Time;
    flight.Date_Time = flight.Time;

    //currentMonth: 02-2023
    //flight.Date: 08-02-2023
    var day_of_month = parseInt(flight.Date.substring(0,2));
    if ((is_the_last_month_of_Quarter_asq() && day_of_month <=22) //from 2025, last day is 22nd
    || !is_the_last_month_of_Quarter_asq())
    { 
      if (currentQuarter ==  getQuarterFromMonth_asq(flight.Date.substring(3,5), flight.Date.substring(6,10))) 
      { 
        this_month_flight_list_asq.push(flight);
      }	
      
      //only get today & not departed flight
      if (((currentDate == flight.Date) && notDeparted_asq(flight.Time))
          || (flight.Date == nextDate)
        )
      { 
        flight.Date_Time = flight.Date.substring(6,10) + flight.Date.substring(3,5) + flight.Date.substring(0,2) + flight.Time;
        //flight.Date_Time = flight.Time;
        today_flight_list_asq.push(flight);
      }
    }			   
  }
  
    //add quota data
    //empty the list
  daily_plan_data_asq = [];
  daily_plan_data_asq.length = 0;
  
  for (i = 0; i < today_flight_list_asq.length; i++) {
    let flight = today_flight_list_asq[i];

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

    for (j = 0; j < dest_airline_quota_asq.length; j++) {
      let quota = dest_airline_quota_asq[j];
      if ((quota.Airline_Dest == flight.Airline_Dest) )
      {
        flight.Quota = quota.Quota;
       }
    }
    
    for (j = 0; j < airline_quota_asq.length; j++) {
      let quota = airline_quota_asq[j];
      if ((quota.Airline == flight.AirlineCode))
      {
        flight.Airline_Quota = quota.Quota; 
       }
    }

    for (j = 0; j < dest_quota_asq.length; j++) {
      let quota = dest_quota_asq[j];
      if ((quota.Dest == flight.Dest))
      {
        flight.Dest_Quota = quota.Quota;
       }
    }

    if (flight.Quota>0) daily_plan_data_asq.push(flight);
  }
}