import { useState } from 'react';

import { useEffect } from 'react';
import Ticket from '@/types/livechat/Ticket';
import getTicketId from '@/helpers/livechat-utils/getTicketId';
import getDate from '@/helpers/livechat-utils/getDate';
import { fetchTickets } from '@/helpers/livechat-utils/fetchTickets';
import { useSocket } from '@/context/livechat/socket';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme1TicketLists() {
  const {
    user,
    setSelectedTicket,
    setIsAddNewTicket,
    refetchTickets,
    setRefetchTickets
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
    <div>
      <div className='flex justify-between items-center px-6 py-2'>
        <div>
          <div className='w-[170px]'>
            <select
              className='w-full h-full border border-gray-300 rounded p-2 outline-none bg-white px-1.5 py-1'
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value=''>Status</option>
              <option value='Open'>Open</option>
              <option value='Awaiting Response'>Awaiting Response</option>
              <option value='Client Replied'>Client Replied</option>
              <option value='Not Responded'>Not Responded</option>
              <option value='Closed'>Closed</option>
            </select>
          </div>
        </div>

        <button
          className='bg-blue-600 hover:opacity-90 text-white px-4 py-1.5 rounded cursor-pointer border-none outline-none font-bold'
          onClick={() => setIsAddNewTicket(true)}
        >
          Add Ticket
        </button>
      </div>

      <table className='w-full border-collapse'>
        <tbody className='w-full border-collapse'>
          {tickets?.map((ticket) => (
            <tr
              className='hover:bg-gray-100 cursor-pointer border-b border-gray-200 w-full table-row'
              key={ticket?.id}
              onClick={() => setSelectedTicket(ticket)}
            >
              <td>
                <div className='flex flex-col gap-1 pl-6 py-2 max-w-[25 0px]'>
                  <div
                    className='text-base font-bold w-full'
                    title={ticket?.title}
                  >
                    {ticket?.title?.length > 30
                      ? ticket?.title?.slice(0, 30) + '...'
                      : ticket?.title}
                  </div>
                  <div className='text-sm text-gray-500'>
                    Ticket ID: {getTicketId(ticket?.id)}
                  </div>
                  <div className='text-sm text-gray-500'>
                    Updated {getDate(ticket?.updatedAt)}
                  </div>
                </div>
              </td>
              <td>
                <div className='flex justify-end items-center gap-1 pr-6 py-2'>
                  <button
                    className={`border border-[#e5e7eb] cursor-pointer text-sm px-1.5 py-0.5 rounded ${
                      ticket?.status === 'Client Replied'
                        ? 'text-black'
                        : 'text-white'
                    } ${
                      ticket?.status === 'Open'
                        ? 'bg-[#16a34a]'
                        : ticket?.status === 'Awaiting Response'
                        ? 'bg-[#1e293b]'
                        : ticket?.status === 'Client Replied'
                        ? 'bg-[#eab308]'
                        : ticket?.status === 'Closed'
                        ? 'bg-[#3b82f6]'
                        : 'bg-[#ef4444]'
                    }`}
                  >
                    {ticket?.status}
                  </button>{' '}
                  <svg
                    width='20px'
                    height='20px'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    stroke='#504e4e'
                  >
                    <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
                    <g
                      id='SVGRepo_tracerCarrier'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    ></g>
                    <g id='SVGRepo_iconCarrier'>
                      {' '}
                      <path
                        d='M8 5L15.57 11.6237C15.7976 11.8229 15.7976 12.1771 15.57 12.3763L8 19'
                        stroke='#595959'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      ></path>{' '}
                    </g>
                  </svg>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
