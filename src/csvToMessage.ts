

export function analysisMessage(data: (string | number)[][]): string {
  let analysis_string = `\u{1F332} Today's humidity: `
  // analysis_string += `\u{1FA9F} pls open all windows\n\u{1F4E9} If you have done it, please confirm this briefly with a message\n\n`
  const avg_humidity = avg_of_idx(data, 2)
  const avg_temperature = avg_of_idx(data, 1)

  // result
  if (avg_humidity < 30) {
    analysis_string += `too dry`
  } else if (avg_humidity >= 30 && avg_humidity < 40) {
    analysis_string += `perfect`
  } else if (avg_humidity >= 40 && avg_humidity < 50) {
    analysis_string += `ok`
  } else if (avg_humidity >= 50 && avg_humidity < 60) {
    analysis_string += `high, consider airing`
  } else if (avg_humidity >= 60) {
    analysis_string += `too high!! open the windows!`
  }
  analysis_string += `\n\n`

  analysis_string += `avg \u{1F4A7} ${avg_humidity}%\n`
  analysis_string += `avg \u{1F321} ${avg_temperature}°C\n\n`
  

  analysis_string += `\u{23F1} TIMESPAN ANALYSIS\n\n`

  analysis_string += get_timespan_analysis_string_for_condition(data, "\u{1F4A7} OVER 75%", (data_entry: any) => data_entry[2] > 75, (minutes: any) => minutes >= 1)
  analysis_string += get_timespan_analysis_string_for_condition(data, "\u{1F4A7} OVER 65%", (data_entry: any) => data_entry[2] > 65, (minutes: any) => minutes >= 10)

  analysis_string += get_timespan_analysis_string_for_condition(data, "\u{1F4A7} UNDER 55%", (data_entry: any) => data_entry[2] < 55, (minutes: any) => minutes >= 10)

  return analysis_string
}

function get_timespan_analysis_string_for_condition(data: any, title: any, condition: any, display_if_minutes: any) {
  /*
  wont show timespans below 10 minutes
  */
  let total_small_timespans_mins = 0

  let total_minutes = 0
  let timespan_string = ``
  let condition_timespans_v = condition_timespans(data, condition)
  for (let h_timespan of condition_timespans_v) {
    let h_analysis = get_start_end_hygroavg_tempavg_from_timespan(h_timespan)
    total_minutes += h_analysis.minutes
    if (display_if_minutes(h_analysis.minutes)) {
      timespan_string += `- ${h_analysis.start}-${h_analysis.end} (${minutes_to_minutes_str(h_analysis.minutes)})\n\t\t\t ${h_analysis.hygroavg}% ${h_analysis.tempavg}°C\n`
    } else {
      total_small_timespans_mins += h_analysis.minutes
    }
  }
  if (total_small_timespans_mins > 0) {
    timespan_string += `- smaller spans total ${minutes_to_minutes_str(total_small_timespans_mins)}\n`
  }
  return `${title} (${minutes_to_minutes_str(total_minutes)})\n ${timespan_string}\n`
}

  
  function condition_timespans(data: any, condition_fullfilled: any) {
    let timespans = []
  
    let open_timespan = false
    let current_timespan = []
    for (let entry of data) {
  
      // opening timespan
      if (!open_timespan && condition_fullfilled(entry)) {
        open_timespan = true
        current_timespan = [entry]
  
        // in timespan
      } else if (open_timespan && condition_fullfilled(entry)) {
        current_timespan.push(entry)
  
        // closing timespan
      } else if (open_timespan && !condition_fullfilled(entry)) {
        timespans.push(current_timespan)
        open_timespan = false
      }
      // else outside of timespan
    }
  
    // add last timespan, if not closed
    if (open_timespan) {
      timespans.push(current_timespan)
    }
  
    return timespans
  }
  
  function sum_of_idx(timespan: any, idx: any) {
    const sum_reducer = (current_sum_acc: any, curr_data_entry: any) => current_sum_acc + curr_data_entry[idx];
    return timespan.reduce(sum_reducer, 0);
  }
  
  function avg_of_idx(timespan: any, idx: any) {
    let avg = sum_of_idx(timespan, idx) / timespan.length
    return to_fixed_if_neccessary(avg, 2)
  }
  
  function get_start_end_hygroavg_tempavg_from_timespan(timespan: any) {
  
    return {
      "start": timespan[0][0],
      "end": timespan[timespan.length - 1][0],
      "minutes": timespan.length,
      "hygroavg": avg_of_idx(timespan, 2),
      "tempavg": avg_of_idx(timespan, 1)
    }
  }
  
  function to_fixed_if_neccessary(value: any, number_of_decimal_points: any) {
    return +parseFloat(value).toFixed(number_of_decimal_points);
  }
  
  function minutes_to_minutes_str(minutes: any) {
    let minutes_str = `${minutes.toString()} min`
    if (minutes > 60) {
      if (minutes % 60 !== 0) {
        minutes_str = `${Math.floor(minutes / 60)}h ${minutes % 60}min`
      } else {
        minutes_str = `${Math.floor(minutes / 60)}h`
      }
      
    }
    return minutes_str
  }