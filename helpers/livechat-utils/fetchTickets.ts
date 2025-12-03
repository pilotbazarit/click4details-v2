import Ticket from '@/types/livechat/Ticket';
import User from '@/types/livechat/User';
import { getApiUrl } from './getApiUrl';

export async function fetchTickets({
  status,
  user,
  setTickets
}: {
  status?: string;
  user: User;
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}) {
  try {
    if (user?.id) {
      let url = `${getApiUrl()}/ticket/external?chatId=${
        (window as any)?.chatId
      }`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ca_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data?.tickets || []);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export async function fetchTicket({
  ticketId,
  setTicket
}: {
  ticketId: number;
  setTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
}) {
  try {
    const response = await fetch(
      `${getApiUrl()}/ticket/external/single?id=${ticketId}&chatId=${
        (window as any)?.chatId
      }`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ca_token')}`
        }
      }
    );
    const data = await response.json();
    if (response.ok) {
      setTicket(data?.ticket);
    }
  } catch (error) {
    console.error(error);
  }
}
