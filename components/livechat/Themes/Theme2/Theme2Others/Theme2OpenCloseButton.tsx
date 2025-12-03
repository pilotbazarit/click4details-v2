import { MessageCircle } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2OpenCloseButton() {
  const {
    setOpenLiveChat,
    openLiveChat,
    setChatType,
    setShowChat,
    user,
    setShowHomepage,
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
            setChatType('chat');
            if (user?.id) {
              setShowChat(true);
            } else {
              setShowHomepage(true);
            }
            window.localStorage.setItem('openLiveChat', `${true}`);
          }}
          className='p-4 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg transition-colors flex items-center gap-2 text-white'
        >
          {shouldShowChatIcon && (
            <MessageCircle className='w-6 h-6 stroke-white' />
          )}
          {chatIconText && (
            <span className='font-bold text-white'>{chatIconText}</span>
          )}
        </button>
      )}
    </>
  );
}
