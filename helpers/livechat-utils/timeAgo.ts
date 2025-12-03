export function timeAgo(date: Date | string | number): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals: [number, string][] = [
    [60, 's'],
    [60, 'm'],
    [24, 'h'],
    [7, 'd'],
    [4.34524, 'w'],
    [12, 'M'],
    [Infinity, 'y']
  ];

  let i = 0;
  let time = seconds;

  while (time >= intervals[i][0] && i < intervals.length - 1) {
    time /= intervals[i][0];
    i++;
  }

  time = Math.floor(time);
  const label = intervals[i][1];

  if (i === 0 && time < 10) return 'just now';

  return `${time}${label} ago`;
}
