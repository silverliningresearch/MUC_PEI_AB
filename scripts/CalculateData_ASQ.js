/************************************/
function CalculateAirportAirLineReport_asq() {
  prepareInterviewData_asq();
  CalculateDOOP_asq(); //add DOOP to quota list

  var daily_plan_data_temp;
  var row;
  daily_plan_data_temp = [];
  daily_plan_data_temp.length = 0;
  
  total_completed_asq = 0;
  total_quota_completed_asq = 0;

  //check what not belong to quota data
  var found_temp = 0;
  var not_in_quota_list =[];
  for (i = 0; i < interview_data_asq.length; i++) 
  {
    total_completed_asq = total_completed_asq +   parseInt(interview_data_asq[i].Completed_of_interviews);
    found_temp = 0;
    for (j = 0; j < dest_airline_quota_asq.length; j++) 
    {
      if (dest_airline_quota_asq[j].Airline_Dest.toUpperCase() == interview_data_asq[i].Airline_Dest.toUpperCase()) 
      { 
        found_temp = 1;
      }
    }
    if (found_temp==0) not_in_quota_list.push(interview_data_asq[i]);
  }
  console.log("not_in_quota_list: ", not_in_quota_list);

  //Dest_Airline related
  for (i = 0; i < dest_airline_quota_asq.length; i++) {
    row = dest_airline_quota_asq[i];
    row.Completed = 0;
    for (j = 0; j < interview_data_asq.length; j++) {
      if (row.Airline_Dest.toUpperCase() == interview_data_asq[j].Airline_Dest.toUpperCase()) 
      { 
        row.Completed = row.Completed  + parseInt(interview_data_asq[j].Completed_of_interviews);
      }
    }

    row.Difference = row.Completed -  row.Quota;
    row.Difference_percent =(100*(row.Difference/row.Quota)).toFixed(1);
    row.Prioritisation_score = row.Difference_percent*row.Difference/100;

    row.Completed_percent =(100*(row.Completed/row.Quota)).toFixed(0);
        
    if ( row.Difference > 0) { //over quota
      total_quota_completed_asq = total_quota_completed_asq +row.Quota*1;
    }
    else { //<= 0
      if (row.Completed) {
        total_quota_completed_asq = total_quota_completed_asq + row.Completed*1;
      }
    }
  }

  //Airline related
  for (i = 0; i < airline_quota_asq.length; i++) {
    row = airline_quota_asq[i];
    row.Airline_Completed = 0;
    for (j = 0; j < interview_data_asq.length; j++) {
      if (row.Airline.toUpperCase() == interview_data_asq[j].Airline.toUpperCase()) 
      { 
        row.Airline_Completed = row.Airline_Completed  + parseInt(interview_data_asq[j].Completed_of_interviews);
      }
    }
    row.Airline_Difference = row.Airline_Completed -  row.Quota;
    row.Airline_Completed_percent =(100*(row.Airline_Completed/row.Quota)).toFixed(0);
  }

  //Dest related
  for (i = 0; i < dest_quota_asq.length; i++) {
    row = dest_quota_asq[i];
    row.Dest_Completed = 0;
    for (j = 0; j < interview_data_asq.length; j++) {
      if (row.Dest.toUpperCase() == interview_data_asq[j].Dest.toUpperCase()) 
      { 
        row.Dest_Completed = row.Dest_Completed  + parseInt(interview_data_asq[j].Completed_of_interviews);
      }
    }
    row.Dest_Difference = row.Dest_Completed -  row.Quota;
    row.Dest_Completed_percent =(100*(row.Dest_Completed/row.Quota)).toFixed(0);
  }

  for (i = 0; i < daily_plan_data_asq.length; i++) {
    row = daily_plan_data_asq[i];
    for (j = 0; j < dest_airline_quota_asq.length; j++) {
      if (row.Airline_Dest.toUpperCase() == dest_airline_quota_asq[j].Airline_Dest.toUpperCase()) 
      {
        //if ( dest_airline_quota_asq[j].Difference < 0) 
        {
          row.doop = dest_airline_quota_asq[j].doop;
          row.remaining_flights = dest_airline_quota_asq[j].remaining_flights;
          row.Completed = dest_airline_quota_asq[j].Completed;
          row.Difference = dest_airline_quota_asq[j].Difference;
          row.Difference_percent = dest_airline_quota_asq[j].Difference_percent;
          row.Completed_percent = dest_airline_quota_asq[j].Completed_percent;
          row.Prioritisation_score = dest_airline_quota_asq[j].Prioritisation_score;
        }
      }
    }  

    row.Airline_Difference = 0;
    row.Airline_Completed_percent = 100;

    for (j = 0; j < airline_quota_asq.length; j++) {
      if (row.Airline.toUpperCase() == airline_quota_asq[j].Airline.toUpperCase()) 
      {
        //if ( airline_quota_asq[j].Difference < 0) 
        {
          row.Airline_Difference = airline_quota_asq[j].Airline_Difference;
          row.Airline_Completed_percent = airline_quota_asq[j].Airline_Completed_percent;
        }
      }
    }  

    row.Dest_Difference = 0;
    row.Dest_Completed_percent = 100;

    for (j = 0; j < dest_quota_asq.length; j++) {
      if (row.Dest.toUpperCase() == dest_quota_asq[j].Dest.toUpperCase()) 
      {
        //if ( airline_quota_asq[j].Difference < 0) 
        {
          row.Dest_Difference = dest_quota_asq[j].Dest_Difference;
          row.Dest_Completed_percent = dest_quota_asq[j].Dest_Completed_percent;
        }
      }
    } 
    
    daily_plan_data_temp.push(row);
  }
    
  //console.log("daily_plan_data_asq: ", daily_plan_data_asq);
  //console.log("dest_airline_quota_asq: ", dest_airline_quota_asq);

  total_completed_percent_asq = (100*(total_completed_asq/total_quota_asq)).toFixed(0);   
  daily_plan_data_asq = [];
  daily_plan_data_asq.length = 0;

 //sort ascending
  daily_plan_data_temp.sort(function(a, b) {
    return parseFloat(b.Prioritisation_score) - parseFloat(a.Prioritisation_score);
  });

  for (i = 0; i < daily_plan_data_temp.length; i++) {
    //-	Flights with a quota target less than 4 should never be red
    //-	Flights with a completion percentage of ≥85% should never be red
    row = daily_plan_data_temp[i];
    row.dest_airline_still_missing = 0;
    if ((row.Quota>=4) && (row.Completed_percent<=85))
    {
      row.dest_airline_still_missing = 1;
    }
  }
  var count  = 0;
  //highlight dest_airlines
  for (i = 0; i < daily_plan_data_temp.length; i++) {
    if ((daily_plan_data_temp[i].Difference < 0)
      ||(daily_plan_data_temp[i].Airline_Difference < 0)
      ||(daily_plan_data_temp[i].Dest_Difference < 0)
    )
    {
      row = daily_plan_data_temp[i];
      row.Priority = 0;
      daily_plan_data_asq.push(row);
      if((count < daily_plan_data_temp.length*0.3 ))
      {
        //-	Flights with a quota target less than 4 should never be red
        //-	Flights with a completion percentage of ≥85% should never be red
        if (row.dest_airline_still_missing==1)
        {
          row.Priority = 1;
          row.ASQ_missing = "";
        }
        else if ((row.Airline_Quota>=4) && (row.Airline_Completed_percent<=85))
        {
          //only highlight if the dest_airlines this Airline belong to not hightlighted yet
          var found = 0;
          for (var k = 0; k < daily_plan_data_temp.length; k++) 
          {
            if (daily_plan_data_temp[k].AirlineCode == row.AirlineCode) 
            {
              found = 1;
              break;
            }
          }
          if ((found==0)) {
            row.Priority = 1;
            row.ASQ_missing = row.AirlineCode + " (missing " +  row.Airline_Difference + ")";            
          }
        } else if ((row.Dest_Quota>=4) && (row.Dest_Completed_percent<=85))
        {
          //only highlight if the dest_airlines this Dest belong to not hightlighted yet
          var found = 0;
          for (var k = 0; k < daily_plan_data_temp.length; k++) 
          {
            if (daily_plan_data_temp[k].Dest == row.Dest) 
            {
              found = 1;
              break;
            }
          }
          if (found==0) {
            row.Priority = 1;
            row.ASQ_missing = row.Dest + " (missing " +  row.Dest + ")";            
          }
        }
        if (row.Priority == 1) 
        { 
          count++; //hightlight 30% of the total list
          if (row.remaining_flights <20) row.Priority = 2 ;
        }

      }
    }
  }


}

function getDOOP_asq(date) //"07-02-2023"
{
  var parts = date.split("-")
  var day = parts[0];
  var Month = parts[1];
  var Year = parts[2];

  const d = new Date();
  d.setDate(day);
  d.setMonth(Month-1); //month start from 0
  d.setYear(Year);

  return d.getDay(); //Sun: 0; Sat: 6
}

function isNotThePastDate_asq(date) //"07-02-2023"
{
  var current_day_of_month =  new Date().getDate();
  var current_month =  new Date().getMonth()+1;

  var parts = date.split("-")
  var flight_day = parseInt(parts[0]);
  var Month = parseInt(parts[1]);
  
  var result = (((flight_day >= current_day_of_month) && (Month==current_month) ) || (Month>current_month));
  //console.log("flight_day", date);
  //console.log("current_day_of_month", current_day_of_month);
  return (result);
}

function CalculateDOOP_asq() {
  for (var i = 0; i < dest_airline_quota_asq.length; i++) {
    dest_airline_quota_asq[i].doop = " ";
    dest_airline_quota_asq[i].remaining_flights = 0;
    var mon =0;
    var tue =0;
    var wed =0;
    var thu =0;
    var fri =0;
    var sat =0;
    var sun =0;

    var remaining_flights = 0;
    for (var j = 0; j < this_month_flight_list_asq.length; j++) {
      if (dest_airline_quota_asq[i].Airline_Dest.toUpperCase() == this_month_flight_list_asq[j].Airline_Dest.toUpperCase()) 
      {
        //get remaining_flights
        if (isNotThePastDate_asq(this_month_flight_list_asq[j].Date)) {
          remaining_flights++;
        }

        switch (getDOOP_asq( this_month_flight_list_asq[j].Date)) {
          case 0:
            sun = "7";
            break;
          case 1:
            mon = "1";
            break;
          case 2:
            tue = "2";
            break;
          case 3:
            wed = "3";
            break;
          case 4:
            thu = "4";
            break;
          case 5:
            fri = "5";
            break;
          case 6:
            sat = "6";
            break;
          default:
            break;
        }
      }
    }
    dest_airline_quota_asq[i].doop =[mon, tue, wed, thu, fri, sat, sun].join('');
    dest_airline_quota_asq[i].remaining_flights = remaining_flights;
  }
}

function CalculateLessFlights_asq() {
  //Special for BRU
  less_than_2_flights_list = [];
  less_than_2_flights_list.length = 0;
  less_than_6_flights_list = [];
  less_than_6_flights_list.length = 0;
 
  for (var i = 0; i < dest_airline_quota_asq.length; i++) {
    var quota = dest_airline_quota_asq[i];
    if (quota.remaining_flights<6) {

      for (var j = 0; j < this_month_flight_list_asq.length; j++) {
        if (quota.Airline_Dest.toUpperCase() == this_month_flight_list_asq[j].Airline_Dest.toUpperCase()) 
        {
          if (quota.Difference < 0) {
            row = this_month_flight_list_asq[j];
            row.remaining_flights  = quota.remaining_flights;
            row.Quota = quota.Quota;
            row.Completed = quota.Completed;
            row.Difference = quota.Difference;
            row.Completed_percent = quota.Completed_percent;

            less_than_6_flights_list.push(row);

            if (quota.remaining_flights<2) {
              less_than_2_flights_list.push(row);
            }
          }
        }
      }
    }
  }
  //console.log("less_than_2_flights_list: ", less_than_2_flights_list);
}