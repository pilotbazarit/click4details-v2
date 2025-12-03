export default function getTicketId(id: number) {
  const idString = `${id}`;
  const idLength = idString.length;
  let ticketId = idString;
  for (let i = 1; i <= 6 - idLength; i++) {
    ticketId = '0' + ticketId;
  }

  return ticketId;
}
