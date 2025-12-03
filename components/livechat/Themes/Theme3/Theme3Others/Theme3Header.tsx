import { EllipsisVertical, Loader2, Minus, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import User from '@/types/livechat/User';
import { toast } from 'react-toastify';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import Modal from '../../../Others/Modal';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3Header() {
  const {
    logoUrl,
    user,
    setUser,
    websiteTitle,
    setOpenLiveChat,
    setChatRefetch,
    setRefetchTickets,
    setPage,
    activeTab,
    setActiveTab,
    closeButton,
    supportAgents
  } = useMainApp();
  const [isChatMenuOpen, setIsChatMenuOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [type, setType] = useState<'clear' | 'delete' | 'deleteTickets'>(
    'clear'
  );
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function logoutHandler() {
    if (!user?.id) {
      setIsChatMenuOpen(false);
      return;
    }

    setUser({} as User);
    localStorage.removeItem('ca_token');
    localStorage.removeItem('chat_user');
    setIsChatMenuOpen(false);
    setActiveTab('home');
    toast.success('Logged out successfully');
  }

  async function clearChatHandler() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${getApiUrl()}/message/external/clear?chatId=${
          (window as any)?.chatId
        }`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ca_token')}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success('Chat cleared successfully');
        setPage(1);
        setChatRefetch((prev) => !prev);
        setIsModalOpen(false);
      } else {
        toast.error(data?.message || 'Failed to clear chat');
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || 'Failed to clear chat');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteChatHandler() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${getApiUrl()}/message/external/delete?chatId=${
          (window as any)?.chatId
        }`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ca_token')}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPage(1);
        setChatRefetch((prev) => !prev);
        setIsChatMenuOpen(false);
        toast.success('Chat deleted successfully');
        setIsModalOpen(false);
      } else {
        toast.error(data?.message || 'Failed to delete chat');
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || 'Failed to delete chat');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteTicketsHandler() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${getApiUrl()}/ticket/external/delete?chatId=${
          (window as any)?.chatId
        }`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ca_token')}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsChatMenuOpen(false);
        toast.success('Tickets deleted successfully');
        setRefetchTickets((prev) => !prev);
        setIsModalOpen(false);
      } else {
        toast.error(data?.message || 'Failed to delete tickets');
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || 'Failed to delete tickets');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const path = event.composedPath();

      if (
        chatMenuRef.current &&
        buttonRef.current &&
        menuButtonRef.current &&
        !path.includes(chatMenuRef.current) &&
        !path.includes(buttonRef.current) &&
        !path.includes(menuButtonRef.current)
      ) {
        setIsChatMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='bg-gray-300 p-4 sm:p-5 sm:rounded-t-xl rounded-t-lg'>
      <div
        className={`flex justify-between items-center ${
          activeTab === 'home' ? 'mb-4 sm:mb-6' : ''
        }`}
      >
        <div className='flex items-center gap-2'>
          <img src="https://pilotbazar.com/_next/static/media/pilotbazar.feb1df42.webp" alt='logo' className='w-10 h-10 rounded' />
          <div>
            <span className='text-blue-500 text-lg sm:text-lg font-bold'>
              {websiteTitle}
            </span>
            <p className='text-blue-400 text-sm'>Replies Instantlty</p>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          {supportAgents?.map((agent) => (
            <div
              key={agent?.id}
              className='relative -ml-2 first:ml-0 hidden sm:block'
              title={`${agent?.name} ${
                agent?.status === 'online'
                  ? 'is online to help you'
                  : 'will join to help you'
              }`}
            >
              <img
                src={agent?.picture || logoUrl}
                alt='Support Agent'
                className='w-7 h-7 rounded-full object-cover border-2 border-white'
                loading='lazy'
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  agent?.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
            </div>
          ))}
          {user?.id ? (
            <button
              ref={buttonRef}
              className='p-1 transition-colors touch-target'
              onClick={() => setIsChatMenuOpen((prev) => !prev)}
            >
              <EllipsisVertical className='w-5 h-5 stroke-white/80 hover:stroke-white' />
            </button>
          ) : (
            ''
          )}
          <button
            onClick={() => {
              setOpenLiveChat(false);
              setActiveTab('home');
              window.localStorage.setItem('openLiveChat', `${false}`);
            }}
            className={`transition-colors touch-target ${
              user?.id ? '' : 'ml-1'
            }`}
          >
            {closeButton === 'Cross' ? (
              <X size={24} className='stroke-white/80 hover:stroke-white' />
            ) : (
              <Minus size={24} className='stroke-white/80 hover:stroke-white' />
            )}
          </button>

          {isChatMenuOpen && (
            <div
              ref={chatMenuRef}
              className='flex flex-col absolute top-16 right-[48px] bg-white rounded z-[99999999] shadow-[0_0_3px_rgba(0,0,0,0.2)] py-1'
            >
              {activeTab === 'chat' ? (
                <>
                  <div
                    ref={menuButtonRef}
                    className='cursor-pointer px-6 py-1.5 hover:bg-gray-100'
                    onClick={() => {
                      setType('clear');
                      setIsModalOpen(true);
                      setIsChatMenuOpen(false);
                    }}
                  >
                    Clear Chat
                  </div>
                  <div
                    ref={menuButtonRef}
                    className='cursor-pointer px-6 py-1.5 hover:bg-gray-100'
                    onClick={() => {
                      setType('delete');
                      setIsModalOpen(true);
                      setIsChatMenuOpen(false);
                    }}
                  >
                    Delete Chat
                  </div>
                </>
              ) : (
                <>
                  <div
                    ref={menuButtonRef}
                    className='cursor-pointer px-6 py-1.5 hover:bg-gray-100'
                    onClick={() => {
                      setType('deleteTickets');
                      setIsModalOpen(true);
                      setIsChatMenuOpen(false);
                    }}
                  >
                    Delete Tickets
                  </div>
                </>
              )}
              <div
                ref={menuButtonRef}
                className='cursor-pointer px-6 py-1.5 hover:bg-gray-100'
                onClick={() => {
                  logoutHandler();
                }}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
      {activeTab === 'home' && (
        <div className='text-center text-black'>
          <h2 className='text-xl sm:text-2xl font-semibold text-black'>
            Hi dear,
          </h2>
          <h3 className='text-lg sm:text-xl opacity-90 text-black'>
            How may I assist you?
          </h3>
        </div>
      )}
      <Modal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          type === 'clear'
            ? 'Clear Chat'
            : type === 'delete'
            ? 'Delete Chat'
            : 'Delete Tickets'
        }
      >
        <p>
          {type === 'clear'
            ? 'Are you sure you want to clear this chat history?'
            : type === 'delete'
            ? 'Are you sure you want to delete this chat?'
            : 'Are you sure you want to delete your tickets?'}
        </p>

        <div className='flex justify-end gap-2 mt-4'>
          <button
            className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer flex items-center outline-none'
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className='bg-red-500 hover:opacity-90 text-white px-4 py-2 rounded cursor-pointer flex items-center outline-none'
            onClick={() => {
              type === 'clear'
                ? clearChatHandler()
                : type === 'delete'
                ? deleteChatHandler()
                : deleteTicketsHandler();
            }}
          >
            {type === 'clear'
              ? 'Clear'
              : type === 'delete'
              ? 'Delete'
              : 'Delete'}{' '}
            {isLoading && (
              <Loader2 className='w-4 h-4 ml-2 animate-spin stroke-white' />
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
