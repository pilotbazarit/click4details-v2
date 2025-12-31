import {
  CircleDot,
  Clock,
  EllipsisVertical,
  Loader2,
  Minus,
  X
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import User from '@/types/livechat/User';
import { toast } from 'react-toastify';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import Modal from '../../../Others/Modal';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2Header() {
  const {
    logoUrl,
    user,
    setUser,
    websiteTitle,
    setOpenLiveChat,
    setShowGetStarted,
    chatType,
    setChatType,
    setChatRefetch,
    setShowChat,
    setShowHomepage,
    setIsAddNewTicket,
    setRefetchTickets,
    setPage,
    closeButton
  } = useMainApp();

  const [isChatMenuOpen, setIsChatMenuOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [type, setType] = useState<'clear' | 'delete' | 'deleteTickets'>(
    'clear'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);

  function logoutHandler() {
    if (!user?.id) {
      setIsChatMenuOpen(false);
      return;
    }

    setUser({} as User);
    localStorage.removeItem('ca_token');
    localStorage.removeItem('chat_user');
    setIsChatMenuOpen(false);
    setShowChat(false);
    setShowGetStarted(false);
    setChatType('chat');
    setShowHomepage(true);
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
    <div className='bg_blue_gradient rounded-t-lg flex-shrink-0'>
      <div className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg'>
              <img src={logoUrl} alt='logo' className='w-10 h-10 rounded' />
            </div>
            <div>
              <h2 className='text-white font-bold'>{websiteTitle}</h2>
              <p className='text-blue-100 text-sm'>Replies Instantly</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {user?.id ? (
              <button
                ref={buttonRef}
                className='p-2 hover:bg-blue-600/50 rounded-full transition-colors'
                onClick={() => setIsChatMenuOpen((prev) => !prev)}
              >
                <EllipsisVertical className='w-5 h-5 stroke-white' />
              </button>
            ) : (
              ''
            )}
            <button
              onClick={() => {
                setOpenLiveChat(false);
                setShowGetStarted(false);
                window.localStorage.setItem('openLiveChat', `${false}`);
              }}
              className='p-2 hover:bg-blue-600/50 rounded-full transition-colors'
            >
              {closeButton === 'Cross' ? (
                <X className='w-5 h-5 stroke-white' />
              ) : (
                <Minus className='w-5 h-5 stroke-white' />
              )}
            </button>
          </div>
        </div>
        {isChatMenuOpen && (
          <div
            ref={chatMenuRef}
            className='flex flex-col absolute top-14 right-[40px] bg-white rounded z-[99999999] shadow-[0_0_3px_rgba(0,0,0,0.2)] py-1'
          >
            {chatType === 'chat' ? (
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
        <div className='flex items-center gap-2 mt-3'>
          <CircleDot className='w-3 h-3 stroke-green-400' />
          <span className='text-sm text-white flex items-center gap-2'>
            <span className='text-white'>We are online</span>
            <span className='text-blue-200'>Ã¢â‚¬Â¢</span>
            <Clock className='w-3 h-3 stroke-blue-200' />
            <span className='text-blue-200 text-xs'>Response time: ~2 min</span>
          </span>
        </div>
      </div>
      <div className='flex border-b border-blue-500/30'>
        <button
          onClick={() => {
            setChatType('chat');
            if (user?.id) {
              setPage(1);
              setShowChat(true);
            } else {
              setShowHomepage(true);
            }
          }}
          className={`flex-1 px-4 py-2 text-sm font-bold border-b-2 text-white ${
            chatType === 'chat'
              ? 'border-white'
              : 'opacity-70 border-transparent'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => {
            setChatType('support');
            setShowChat(false);
            setShowGetStarted(false);
            setIsAddNewTicket(false);
          }}
          className={`flex-1 px-4 py-2 text-sm font-bold border-b-2 text-white ${
            chatType === 'support'
              ? 'border-white'
              : 'opacity-70 border-transparent'
          }`}
        >
          Tickets
        </button>
      </div>

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
