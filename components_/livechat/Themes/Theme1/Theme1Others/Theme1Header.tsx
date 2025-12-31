import { EllipsisVertical, Loader2, Minus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import User from '@/types/livechat/User';
import Modal from '../../../Others/Modal';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import { toast } from 'react-toastify';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme1Header() {
  const {
    logoUrl,
    websiteTitle,
    user,
    setUser,
    setChatType,
    chatType,
    setChatRefetch,
    setRefetchTickets,
    setOpenLiveChat,
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

  function logoutHandler() {
    if (!user?.id) {
      setIsChatMenuOpen(false);
      return;
    }

    setUser({} as User);
    localStorage.removeItem('ca_token');
    localStorage.removeItem('chat_user');
    setIsChatMenuOpen(false);
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

  return (
    <div className='flex justify-between items-center px-6 py-2.5 relative shadow-[0_4px_6px_rgba(0,0,0,0.1)]'>
      <div className='flex items-center gap-3'>
        {logoUrl && (
          <img
            src={logoUrl}
            alt='Logo'
            width='44'
            height='44'
            className='w-11 h-11 rounded'
          />
        )}

        <div className='flex flex-col items-start'>
          <p className='font-bold text-gray-800'>{websiteTitle}</p>
          <p className='text-gray-800 text-sm'>Replies Instantlya</p>
        </div>
      </div>

      <div className='flex items-center gap-1'>
        <div className='w-[100px] h-9 block'>
          <select
            className='w-full h-full border border-gray-300 rounded py-1 px-1.5 outline-none bg-white text-black'
            onChange={(e) => setChatType(e.target.value as 'chat' | 'support')}
            value={chatType}
          >
            <option value='chat'>Chat</option>
            <option value='support'>Support</option>
          </select>
        </div>

        <button
          ref={buttonRef}
          className='cursor-pointer'
          onClick={() => setIsChatMenuOpen((prev) => !prev)}
        >
          <EllipsisVertical className='w-5 h-5' />
        </button>

        <button
          ref={buttonRef}
          className='cursor-pointer'
          onClick={() => {
            setOpenLiveChat(false);
            window.localStorage.setItem('openLiveChat', `${false}`);
          }}
        >
          {closeButton === 'Cross' ? (
            <X className='w-5 h-5' />
          ) : (
            <Minus className='w-5 h-5' />
          )}
        </button>
      </div>

      {isChatMenuOpen && (
        <div
          ref={chatMenuRef}
          className='flex flex-col absolute top-14 right-[40px] bg-white rounded z-[99999999] shadow-[0_0_3px_rgba(0,0,0,0.2)]'
        >
          {user?.id ? (
            <>
              {chatType === 'chat' ? (
                <>
                  <div
                    ref={menuButtonRef}
                    className='cursor-pointer px-6 py-1.5 hover:bg-gray-100'
                    onClick={() => {
                      if (!user?.id) {
                        toast.error('Please login to clear chat');
                        setIsChatMenuOpen(false);
                        return;
                      }
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
                      if (!user?.id) {
                        toast.error('Please login to delete chat');
                        setIsChatMenuOpen(false);
                        return;
                      }
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
                      if (!user?.id) {
                        toast.error('Please login to delete tickets');
                        setIsChatMenuOpen(false);
                        return;
                      }
                      setType('deleteTickets');
                      setIsModalOpen(true);
                      setIsChatMenuOpen(false);
                      setRefetchTickets((prev) => !prev);
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
            </>
          ) : (
            <div
              ref={menuButtonRef}
              className='cursor-pointer px-6 py-1.5 hover:bg-gray-100'
              onClick={() => setIsChatMenuOpen(false)}
            >
              Login
            </div>
          )}
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
