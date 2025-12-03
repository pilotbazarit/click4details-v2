import Theme3Messages from './Theme3Messages';
import Theme3ChatEditor from './Theme3ChatEditor';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';
import ChatClosedAlert from '../../../Others/ChatClosedAlert';

export default function Theme3Chat() {
  const {
    setActiveTab,
    setShowGuestLogin,
    setActAsGuest,
    setActAsIpChat,
    setSelectedConversationId,
    setGuestChatConversationId,
    isChatOn
  } = useMainApp();

  const [editorHeight, setEditorHeight] = useState<number>(
    (70 / (window?.innerWidth <= 640 ? 425 : 525)) * 100
  );

  return (
    <div
      className={`h-full flex flex-col ${isChatOn ? 'justify-between' : ''}`}
    >
      <div className='border-b p-4'>
        <button
          onClick={() => {
            setGuestChatConversationId(null);
            setSelectedConversationId(null);
            setActiveTab('home');
            setShowGuestLogin(false);
            setActAsGuest(false);
            setActAsIpChat(false);
          }}
          className='flex items-center text-blue-600 hover:text-blue-700 group'
        >
          <ArrowRight
            className='rotate-180 mr-1 stroke-blue-600 group-hover:stroke-blue-700'
            size={16}
          />{' '}
          End Chat
        </button>
      </div>

      {isChatOn ? (
        <>
          <Theme3Messages editorHeight={editorHeight} />

          <Theme3ChatEditor
            editorHeight={editorHeight}
            setEditorHeight={setEditorHeight}
          />
        </>
      ) : (
        <ChatClosedAlert />
      )}
    </div>
  );
}
