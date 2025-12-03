import { MessageCircle } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3OpenCloseButton() {
  const {
    setOpenLiveChat,
    openLiveChat,
    user,
    setActiveTab,
    showChatIcon,
    chatIconText
  } = useMainApp();

  const shouldShowChatIcon = showChatIcon || chatIconText?.trim() === '';
  return (
    <>
      {!openLiveChat && (
        <button
          onClick={() => {
            setOpenLiveChat(true);
            if (user?.id) {
              setActiveTab('chat');
            }
            window.localStorage.setItem('openLiveChat', `${true}`);
          }}
          className='w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg touch-target'
        >
          {shouldShowChatIcon && (
            <MessageCircle size={20} className='stroke-white' />
          )}
          {chatIconText && (
            <span className='font-bold text-white'>{chatIconText}</span>
          )}
        </button>
      )}
    </>
  );
}
