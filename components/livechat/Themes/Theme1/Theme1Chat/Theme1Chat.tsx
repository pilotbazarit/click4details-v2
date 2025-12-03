import Theme1Messages from './Theme1Messages';
import Theme1ChatEditor from './Theme1ChatEditor';
import { useState } from 'react';
import ChatClosedAlert from '../../../Others/ChatClosedAlert';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme1Chat() {
  const { isChatOn } = useMainApp();
  const [editorHeight, setEditorHeight] = useState<number>(
    (70 / (window?.innerWidth <= 640 ? 425 : 525)) * 100
  );
  return (
    <div
      className={`h-[calc(100%-75px)] flex flex-col ${
        isChatOn ? 'justify-between' : ''
      }`}
    >
      {isChatOn ? (
        <>
          <Theme1Messages editorHeight={editorHeight} />

          <Theme1ChatEditor
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
