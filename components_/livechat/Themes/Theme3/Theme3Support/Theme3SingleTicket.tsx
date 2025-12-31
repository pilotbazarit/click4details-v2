import { useRef, useState, useEffect } from 'react';
import Ticket from '@/types/livechat/Ticket';
import getDate from '@/helpers/livechat-utils/getDate';
import { fetchTicket } from '@/helpers/livechat-utils/fetchTickets';
import { ArrowRight } from 'lucide-react';
import getHexCode from '@/helpers/livechat-utils/getHexCode';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import { toast } from 'react-toastify';
import ShowTextWithLink from '../../../Others/ShowTextWithLink';
import ShowImageModal from '../../../Others/ShowImageModal';
import { useSocket } from '@/context/livechat/socket';
import Theme2TicketEditor from './Theme3TicketEditor';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3SingleTicket() {
  const {
    selectedTicket,
    setSelectedTicket,
    user,
    websiteTitle,
    websiteAdminUrl,
    setIsAddNewTicket,
    supportContainerRef,
    setOpenModal,
    setImageUrl,
    imageUrl,
    openModal
  } = useMainApp();
  const [ticket, setTicket] = useState<Ticket | null>(selectedTicket);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [refetchTicket, setRefetchTicket] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (!user?.id || !selectedTicket?.id) {
      return;
    }

    fetchTicket({
      ticketId: selectedTicket?.id,
      setTicket
    });
  }, [user, selectedTicket?.id, refetchTicket]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (ticket?.id) {
        const newMessage = {
          id: getHexCode(),
          message: description,
          screenshots,
          dateTime: new Date().getTime()
        };

        const previousMessages = ticket?.description ?? [];
        const updatedMessages = [...previousMessages, newMessage];

        const updatedTicket = {
          description: updatedMessages,
          isViewed: 1,
          isAdminViewed: 0,
          status: 'Client Replied'
        };

        const response = await fetch(
          `${getApiUrl()}/ticket/external?id=${ticket?.id}&chatId=${
            (window as any)?.chatId
          }`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('ca_token')}`
            },
            body: JSON.stringify(updatedTicket)
          }
        );
        if (response.ok) {
          setDescription('');
          setScreenshots([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setRefetchTicket((prev) => !prev);
          scrollToBottom();
        } else {
          const data = await response.json();
          toast.error(data?.message || 'Failed to send message');
        }
      } else {
        const newTicket = {
          title: subject,
          status: 'Open',
          senderId: user?.id,
          department: websiteTitle,
          websiteAdminUrl,
          chatId: (window as any)?.chatId,
          description: JSON.stringify([
            {
              id: getHexCode(),
              message: description,
              screenshots,
              dateTime: new Date().getTime()
            }
          ]),
          isAdminViewed: 0,
          isViewed: 1
        };

        const response = await fetch(`${getApiUrl()}/ticket/external/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('ca_token')}`
          },
          body: JSON.stringify(newTicket)
        });
        if (response.ok) {
          const data = await response.json();
          setDescription('');
          setScreenshots([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setSelectedTicket(data?.ticket || null);
          setRefetchTicket((prev) => !prev);
          scrollToBottom();
        } else {
          const data = await response.json();
          toast.error(data?.message || 'Failed to create ticket');
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (supportContainerRef.current) {
        supportContainerRef.current.scrollTo({
          top: supportContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    socket?.on('newTicketMessage', (sentTicketId: any) => {
      if (Number(selectedTicket?.id) === Number(sentTicketId)) {
        setRefetchTicket((prev) => !prev);
      }
    });

    return () => {
      socket?.off('newTicketMessage');
    };
  }, [socket, selectedTicket?.id]);

  return (
    <div className='p-4'>
      <button
        onClick={() => {
          setIsAddNewTicket(false);
        }}
        className='flex items-center text-blue-600 mb-4 hover:text-blue-700 group'
      >
        <ArrowRight
          className='rotate-180 mr-1 stroke-gray-600 group-hover:stroke-blue-600'
          size={16}
        />{' '}
        Back to Tickets
      </button>
      {!ticket?.id && (
        <h3 className='text-lg font-bold mb-4'>Create Support Ticket</h3>
      )}

      {ticket?.id && (
        <>
          <div className='bg-white p-4 rounded-lg shadow mb-4'>
            <div className='flex justify-between items-start mb-2'>
              <h3
                className='text-lg font-bold line-clamp-2 max-w-[64%]'
                title={ticket?.title}
              >
                {ticket?.title}
              </h3>
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
                }`}
              >
                {ticket?.status}
              </span>
            </div>
            <p
              className='text-gray-600 mb-4 line-clamp-2'
              title={ticket?.description[0]?.message}
            >
              {ticket?.description[0]?.message}
            </p>
            <div className='flex justify-start items-center text-sm text-gray-500'>
              <span>Created on {getDate(ticket?.createdAt)}</span>
            </div>
          </div>

          <div className='flex flex-col gap-2.5 mb-4'>
            <div className='flex flex-col gap-5 mt-2'>
              {Array.isArray(ticket?.description) &&
                ticket?.description?.map((message) => (
                  <div className='flex flex-col gap-2.5' key={message?.id}>
                    <div className='flex items-center gap-2 w-fit'>
                      <div className='font-bold px-3.5 py-2 border border-gray-500 rounded-full w-fit'>
                        {message?.replierId
                          ? message?.replier?.name?.slice(0, 1)
                          : user?.name?.slice(0, 1)}
                      </div>
                      <div className='flex flex-col'>
                        <div className='font-bold'>
                          {message?.replierId
                            ? message?.replier?.name
                            : user?.name}
                        </div>
                        <small>{getDate(message?.dateTime)}</small>
                      </div>
                    </div>

                    <div className='flex flex-col gap-2.5'>
                      <div className='whitespace-pre-wrap break-words text-left'>
                        <ShowTextWithLink
                          text={message?.message}
                          className='text-blue-600'
                        />
                      </div>
                      <div className='flex flex-wrap items-center gap-5 w-full'>
                        {message?.screenshots?.map((screenshot) => (
                          <div
                            className='hover:opacity-80 cursor-pointer w-[200px] rounded'
                            key={screenshot}
                          >
                            <img
                              src={screenshot}
                              alt='Screenshot'
                              onClick={() => {
                                setImageUrl(screenshot);
                                setOpenModal(true);
                              }}
                              className='rounded'
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {ticket?.status === 'Closed' ? (
        <p className='bg-green-200 text-center py-2 rounded'>
          The ticket is marked as closed
        </p>
      ) : (
        <Theme2TicketEditor
          handleSubmit={handleSubmit}
          subject={subject}
          setSubject={setSubject}
          description={description}
          setDescription={setDescription}
          screenshots={screenshots}
          setScreenshots={setScreenshots}
          ticket={ticket}
          fileInputRef={fileInputRef}
          isLoading={isLoading}
        />
      )}

      {openModal && (
        <ShowImageModal
          imageUrl={imageUrl}
          onClose={() => {
            setImageUrl('');
            setOpenModal(false);
          }}
        />
      )}
    </div>
  );
}
