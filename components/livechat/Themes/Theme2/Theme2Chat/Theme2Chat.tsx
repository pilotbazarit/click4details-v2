import Theme2Messages from './Theme2Messages';
import Theme2ChatEditor from './Theme2ChatEditor';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';
import ChatClosedAlert from '../../../Others/ChatClosedAlert';

export default function Theme2Chat() {
  const {
    setShowChat,
    setShowHomepage,
    setShowGuestLogin,
    setActAsIpChat,
    setIpMessages,
    isChatOn
  } = useMainApp();
  const [editorHeight, setEditorHeight] = useState<number>(
    (70 / (window?.innerWidth <= 640 ? 425 : 525)) * 100
  );

  return (
    <div
      className={`h-[calc(100%-58px)] flex flex-col ${
        isChatOn ? 'justify-between' : ''
      }`}
    >
      <div className='border-b p-4'>
        <button
          onClick={() => {
            setShowChat(false);
            setShowHomepage(true);
            setShowGuestLogin(false);
            setActAsIpChat(false);
            setIpMessages([]);
          }}
          className='flex items-center gap-2 group'
        >
          <ArrowLeft className='w-5 h-5 stroke-gray-600 group-hover:stroke-gray-900 transition-colors' />
          <span className='text-gray-600 group-hover:text-gray-900 transition-colors'>
            Back to menu
          </span>
        </button>
      </div>
      {isChatOn ? (
        <>
          <Theme2Messages editorHeight={editorHeight} />

          <Theme2ChatEditor
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
