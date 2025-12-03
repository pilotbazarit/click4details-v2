import { useEffect, useRef, useState } from 'react';
import Message from '@/types/livechat/Message';
import {
  ChevronDown,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import getOriginalFileName from '@/helpers/livechat-utils/getOriginalFileName';
import downloadAttachment from '@/helpers/livechat-utils/downloadAttachment';
import getDate from '@/helpers/livechat-utils/getDate';
import { fetchMessages } from '@/helpers/livechat-utils/fetchMessages';
import ShowTextWithLink from '../../../Others/ShowTextWithLink';
import ShowImageModal from '../../../Others/ShowImageModal';
import AudioPlayer from '../../../Others/AudioPlayer';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2Messages({
  editorHeight
}: {
  editorHeight: number;
}) {
  const {
    user,
    logoUrl,
    chatRefetch,
    limit,
    page,
    setPage,
    setSelectedMessageToReply,
    isGuest,
    guestMessages,
    guestChatRefetch,
    imageUrl,
    setImageUrl,
    openModal,
    setOpenModal,
    actAsIpChat,
    ipMessages
  } = useMainApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const mainChatContainer = useRef<HTMLDivElement>(null);
  const [openMessageMenu, setOpenMessageMenu] = useState<boolean>(false);
  const [messageMenuId, setMessageMenuId] = useState<number | null>(null);
  const [selectedTargetMessageId, setSelectedTargetMessageId] = useState<
    number | null
  >(null);
  const openMessageMenuRef = useRef<HTMLButtonElement>(null);
  const replyMessageMenuRef = useRef<HTMLButtonElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [fetched, setFetched] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    fetchMessages({
      user,
      setMessages,
      mainChatContainer: mainChatContainer as React.RefObject<HTMLDivElement>,
      page,
      limit,
      setLoading,
      setHasMore
    }).then((res) => {
      setFetched(true);
    });
  }, [user, chatRefetch, page, limit]);

  useEffect(() => {
    if (mainChatContainer.current) {
      mainChatContainer.current.style.setProperty(
        'height',
        `calc(100% - ${editorHeight}%)`,
        'important'
      );
    }
  }, [editorHeight]);

  useEffect(() => {
    function handleClickOutside(e: any) {
      if (
        !replyMessageMenuRef.current?.contains(e.target) &&
        !openMessageMenuRef.current?.contains(e.target)
      ) {
        setOpenMessageMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [replyMessageMenuRef, openMessageMenuRef]);

  useEffect(() => {
    if (!selectedTargetMessageId) return;

    const handleClick = (e: MouseEvent) => {
      if (e.target instanceof HTMLDivElement) {
        setSelectedTargetMessageId(null);
      }
    };

    window.document.addEventListener('click', handleClick);

    return () => {
      window.document.removeEventListener('click', handleClick);
    };
  }, [selectedTargetMessageId]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (isGuest) {
      setTimeout(() => {
        mainChatContainer.current?.scrollTo({
          top: mainChatContainer.current?.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [isGuest, guestChatRefetch]);

  return (
    <div className='overflow-auto relative scrollbar' ref={mainChatContainer}>
      {!fetched && !isGuest && !actAsIpChat && (
        <div className='flex justify-center items-center h-full'>
          <Loader2 className='h-10 w-10 animate-spin stroke-blue-600' />
        </div>
      )}

      {hasMore && !isGuest && !actAsIpChat && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className='flex items-center mx-auto gap-2 my-4 w-32 justify-center bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md'
        >
          Load More{' '}
          {loading && <Loader2 className='w-4 h-4 animate-spin stroke-white' />}
        </button>
      )}
      {(isGuest ? guestMessages : actAsIpChat ? ipMessages : messages)?.map(
        (message) => (
          <div
            key={message?.id}
            className={`mb-[15px] flex flex-col ${
              message?.sender?.role === 'user' ? 'items-end' : 'items-start'
            } ${
              selectedTargetMessageId === message?.id ? 'bg-gray-300' : ''
            } px-6 py-2.5`}
            ref={(el) => {
              messageRefs.current[message?.id] = el;
            }}
          >
            {message?.targetMessage?.id ? (
              <ReplyComponent
                message={message}
                messageRefs={messageRefs}
                setSelectedTargetMessageId={setSelectedTargetMessageId}
              />
            ) : (
              ''
            )}
            <div className='flex items-end gap-1 group relative'>
              {message?.sender?.role !== 'user' && (
                <img
                  className='w-[15px] h-[15px] mb-0.5 rounded'
                  src={
                    message?.sender?.picture
                      ? message?.sender?.picture
                      : logoUrl
                  }
                />
              )}
              <div className='flex flex-col'>
                <div
                  className={`relative max-w-[250px] break-words rounded-[23px] ${
                    message?.sender?.role === 'user'
                      ? 'text-white rounded-bl-[23px] rounded-br-[6px]'
                      : 'text-black rounded-bl-[6px] rounded-br-[23px]'
                  } ${
                    Array.isArray(message?.attachments) &&
                    !message?.attachments?.length
                      ? message?.sender?.role === 'user'
                        ? 'bg-[#0a7cff] px-3 py-2'
                        : 'bg-[#e5e7eb] px-3 py-2'
                      : ''
                  }`}
                >
                  {Array.isArray(message?.attachments) &&
                    message?.attachments?.map((attachment, index) => {
                      if (attachment?.isImage) {
                        return (
                          <div
                            className='bg-white cursor-pointer mb-[5px] rounded-[5px] border border-gray-200'
                            key={index}
                          >
                            <img
                              className='w-[250px] hover:opacity-80 rounded-[5px]'
                              id={`img_${index}`}
                              src={attachment?.url}
                              onClick={() => {
                                setImageUrl(attachment?.url);
                                setOpenModal(true);
                              }}
                            />
                          </div>
                        );
                      }

                      if (attachment?.isVideo) {
                        return (
                          <div
                            key={index}
                            className='bg-white mb-[5px] rounded-[5px] border border-gray-200'
                          >
                            <video
                              className='w-[250px] rounded-[5px]'
                              id={`video_${index}`}
                              src={attachment?.url}
                              controls
                            />
                          </div>
                        );
                      } else if (attachment?.isAudio) {
                        return (
                          <div
                            key={index}
                            className='bg-white mb-[5px] rounded-[5px]'
                          >
                            <AudioPlayer src={attachment?.url} />
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-1 p-[5px] rounded-[5px] mb-[5px] cursor-pointer ${
                              message?.sender?.role === 'user'
                                ? 'bg-[#183572]'
                                : 'bg-[#d1d5db]'
                            }`}
                            onClick={() => downloadAttachment(attachment?.url)}
                          >
                            <FileText
                              className={`w-4 h-4 ${
                                message?.sender?.role === 'user'
                                  ? 'stroke-white'
                                  : 'stroke-black'
                              }`}
                            />
                            <span
                              className={`truncate max-w-[200px] ${
                                message?.sender?.role === 'user'
                                  ? 'text-white'
                                  : 'text-black'
                              }`}
                              title={getOriginalFileName(attachment?.url)}
                            >
                              {getOriginalFileName(attachment?.url)}
                            </span>
                            <Download
                              className={`w-4 h-4 ${
                                message?.sender?.role === 'user'
                                  ? 'stroke-white'
                                  : 'stroke-black'
                              }`}
                            />
                          </div>
                        );
                      }
                    })}
                  <div
                    className={
                      Array.isArray(message?.attachments) &&
                      message?.attachments?.length > 0 &&
                      message?.message?.trim()
                        ? message?.sender?.role === 'user'
                          ? 'rounded-[23px] rounded-bl-[23px] rounded-br-[6px] bg-[#0a7cff] px-3 py-2 w-fit ml-auto'
                          : 'rounded-[23px] rounded-bl-[6px] rounded-br-[23px] bg-[#e5e7eb] px-3 py-2 w-fit mr-auto'
                        : ''
                    }
                  >
                    <p
                      className={`whitespace-pre-wrap break-words ${
                        Array.isArray(message?.attachments) &&
                        message?.attachments?.length > 0
                          ? 'mt-[5px]'
                          : ''
                      } ${
                        message?.sender?.role === 'user'
                          ? 'text-white'
                          : 'text-black'
                      }`}
                    >
                      <ShowTextWithLink
                        text={message?.message}
                        className={`${
                          message?.sender?.role === 'user'
                            ? 'text-white'
                            : 'text-blue-600'
                        }`}
                      />
                    </p>
                    <span
                      className={`text-xs mt-1 text-right block ${
                        Array.isArray(message?.attachments) &&
                        message?.attachments?.length
                          ? message?.message
                            ? message?.sender?.role === 'user'
                              ? 'text-white'
                              : 'text-black'
                            : 'text-black'
                          : message?.sender?.role === 'user'
                          ? 'text-white'
                          : 'text-black'
                      }`}
                    >
                      {getDate(message?.createdAt)}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs mt-0.5 ${
                    message?.sender?.role === 'user'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {message?.sender?.role === 'user'
                    ? `${message?.isAdminViewed ? 'Seen' : ''}`
                    : `${message?.sender?.name} (${
                        message?.sender?.position
                          ? message?.sender?.position
                          : message?.sender?.role
                      })`}
                </span>
              </div>

              <button
                ref={openMessageMenuRef}
                className='absolute right-1.5 top-1.5 hidden rounded-full bg-white p-1 text-black shadow group-hover:inline'
                onClick={() => {
                  setMessageMenuId(message?.id);
                  setOpenMessageMenu(true);
                }}
              >
                <ChevronDown className='h-4 w-4' />
              </button>

              {openMessageMenu && messageMenuId === message?.id && (
                <div className='absolute right-5 top-5 w-24 rounded bg-white py-2 text-black shadow'>
                  <button
                    className='flex w-full items-center justify-start px-4 py-1 text-center hover:bg-gray-200'
                    ref={replyMessageMenuRef}
                    onClick={(e) => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      setSelectedMessageToReply(message);
                      setOpenMessageMenu(false);
                    }}
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        )
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

function ReplyComponent({
  message,
  messageRefs,
  setSelectedTargetMessageId
}: {
  message: Message;
  messageRefs: any;
  setSelectedTargetMessageId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
}) {
  return (
    <div
      className={`relative cursor-pointer rounded-md border-l-6 border-gray-400 bg-gray-600 px-2 py-1 !text-sm text-white dark:bg-gray-700 -mb-2 pb-3 ${
        message?.sender?.role === 'user' ? '' : 'ml-5'
      }`}
      onClick={() => {
        if (messageRefs.current) {
          const el = messageRefs.current[message?.targetMessage?.id as any];
          el?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
          setSelectedTargetMessageId(message?.targetMessage?.id);
        }
      }}
    >
      <span className='text-white'>
        {message?.targetMessage?.sender?.name}{' '}
        {message?.targetMessage?.sender?.role === 'user'
          ? ''
          : `(${
              message?.targetMessage?.sender?.position
                ? message?.targetMessage?.sender?.position
                : message?.targetMessage?.sender?.role
            })`}
      </span>
      <div className='flex items-center justify-between text-white'>
        <div className='flex items-center gap-1'>
          {Array.isArray(message?.targetMessage?.attachments) &&
            message?.targetMessage?.attachments?.length > 0 &&
            (message?.targetMessage?.attachments[0]?.isImage ? (
              <ImageIcon className='h-5 w-5 stroke-white' />
            ) : (
              <File className='h-5 w-5 stroke-white' />
            ))}
          <span className='max-w-[200px] truncate text-white'>
            {message?.targetMessage?.message || 'Attachment'}
          </span>
        </div>
        <div>
          {Array.isArray(message?.targetMessage?.attachments) &&
            message?.targetMessage?.attachments?.length > 0 &&
            message?.targetMessage?.attachments[0]?.isImage && (
              <img
                src={message?.targetMessage?.attachments[0]?.url}
                alt=''
                className='mr-10 h-12 w-12 rounded'
              />
            )}
        </div>
      </div>
    </div>
  );
}
