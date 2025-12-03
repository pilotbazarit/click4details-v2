import { Ticket as TicketIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import Ticket from '@/types/livechat/Ticket';
import getDate from '@/helpers/livechat-utils/getDate';
import { fetchTickets } from '@/helpers/livechat-utils/fetchTickets';
import { useSocket } from '@/context/livechat/socket';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2TicketLists() {
  const {
    setIsAddNewTicket,
    setSelectedTicket,
    setRefetchTickets,
    refetchTickets,
    user
  } = useMainApp();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState<string>('');
  const { socket } = useSocket();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    fetchTickets({
      status,
      user,
      setTickets
    });
  }, [user, status, refetchTickets]);

  useEffect(() => {
    socket?.on('ticketUpdate', () => {
      setRefetchTickets((prev) => !prev);
    });

    return () => {
      socket?.off('ticketUpdate');
    };
  }, [socket, setRefetchTickets]);

  return (
    <div className='h-full overflow-y-auto scrollbar p-6'>
      <div className='flex justify-between items-center mb-6'>
        <select
          className='px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300'
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value=''>All Tickets</option>
          <option value='Open'>Open</option>
          <option value='Awaiting Response'>Awaiting Response</option>
          <option value='Client Replied'>Client Replied</option>
          <option value='Not Responded'>Not Responded</option>
          <option value='Closed'>Closed</option>
        </select>
        <button
          onClick={() => setIsAddNewTicket(true)}
          className='sm:px-4 px-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2'
        >
          <TicketIcon className='w-4 h-4 stroke-white sm:inline-block hidden' />
          New Ticket
        </button>
      </div>
      <div className='space-y-3'>
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className='p-4 border border-gray-200 hover:bg-gray-100 rounded-lg cursor-pointer'
            onClick={() => {
              setSelectedTicket(ticket);
              setIsAddNewTicket(true);
            }}
          >
            <div className='flex justify-between items-start'>
              <div>
                <h3 className='font-bold line-clamp-1' title={ticket?.title}>
                  {ticket?.title}
                </h3>
                <p className='text-sm text-gray-500'>
                  Created on {getDate(ticket.createdAt)}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full font-bold ${
                  ticket?.status === 'Open'
                    ? 'bg-green-100 !text-[#16a34a]'
                    : ticket?.status === 'Awaiting Response'
                    ? 'bg-gray-300 !text-[#1e293b] w-full max-w-[118px]'
                    : ticket?.status === 'Client Replied'
                    ? 'bg-yellow-100 !text-[#946f00]'
                    : ticket?.status === 'Closed'
                    ? 'bg-blue-100 !text-[#3b82f6]'
                    : 'bg-red-100 !text-[#ef4444]'
                }
                }`}
              >
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
