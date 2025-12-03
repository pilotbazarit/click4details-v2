export function getScheduleTime(providedScheduleTime: string) {
  const result = {
    startTime: '',
    endTime: '',
    startTimeAMPM: '',
    endTimeAMPM: '',
    startTime24Hour: '',
    endTime24Hour: '',
    errorMessage: ''
  };

  if (!providedScheduleTime) {
    result.errorMessage = 'Schedule time is not provided';
    return result;
  }

  const startTime = providedScheduleTime?.split('-')[0];
  const endTime = providedScheduleTime?.split('-')[1];
  result.startTime = startTime?.match(/\d/g)?.join('') || '';
  result.endTime = endTime?.match(/\d/g)?.join('') || '';
  result.startTimeAMPM = startTime?.match(/[a-zA-Z]/g)?.join('') || '';
  result.endTimeAMPM = endTime?.match(/[a-zA-Z]/g)?.join('') || '';

  if (result.startTimeAMPM === 'PM') {
    result.startTime24Hour = (Number(result.startTime) + 12).toString();
  } else {
    result.startTime24Hour = result.startTime;
  }

  if (result.endTimeAMPM === 'PM') {
    result.endTime24Hour = (Number(result.endTime) + 12).toString();
  } else {
    result.endTime24Hour = result.endTime;
  }

  if (Number(result.startTime24Hour) > Number(result.endTime24Hour)) {
    result.errorMessage = 'Start time cannot be greater than end time';
    return result;
  }

  return result;
}
