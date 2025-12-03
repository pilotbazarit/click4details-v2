import { Fragment, useEffect, useRef, useState } from 'react';
import Message from '@/types/livechat/Message';
import {
  ChevronDown,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  SendIcon
} from 'lucide-react';
import getOriginalFileName from '@/helpers/livechat-utils/getOriginalFileName';
import downloadAttachment from '@/helpers/livechat-utils/downloadAttachment';
import getDate from '@/helpers/livechat-utils/getDate';
import { fetchMessages, scrollToBottom } from '@/helpers/livechat-utils/fetchMessages';
import ShowTextWithLink from '../../../Others/ShowTextWithLink';
import ShowImageModal from '../../../Others/ShowImageModal';
import AudioPlayer from '../../../Others/AudioPlayer';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import { toast } from 'react-toastify';
import { useMainApp } from '@/context/livechat/mainAppContext';
import Theme3Rating from './Theme3Rating';

export default function Theme3Messages({
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
    ipMessages,
    guestChatRefetch,
    actAsGuest,
    websiteTitle,
    actAsGuestLanguage,
    setActAsGuestLanguage,
    isAgentContinued,
    setGuestChatRefetch,
    topic,
    setTopic,
    subTopic,
    setSubTopic,
    guestChatQueryTopics,
    supportAgents,
    openModal,
    setOpenModal,
    imageUrl,
    setImageUrl,
    isClosed,
    rating,
    setRating,
    feedback,
    setFeedback,
    guestChatConversationId,
    agentName,
    givenFeedback,
    givenRating,
    actAsIpChat
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

  const selectedTopic = guestChatQueryTopics?.find(
    (queryTopic) => queryTopic?.topic === topic
  );

  useEffect(() => {
    if (!user?.id || actAsGuest || actAsIpChat) {
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
  }, [user, chatRefetch, page, limit, actAsGuest, actAsIpChat]);

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

  function handleLoadMore() {
    setPage((prev) => prev + 1);
  }

  useEffect(() => {
    if (isGuest || actAsIpChat) {
      setTimeout(() => {
        mainChatContainer.current?.scrollTo({
          top: mainChatContainer.current?.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [isGuest, guestChatRefetch, actAsIpChat]);

  async function sendGuestChatMessage({
    message,
    isLanguage,
    isTopic,
    isSubTopic
  }: {
    message: string;
    isLanguage?: boolean;
    isTopic?: boolean;
    isSubTopic?: boolean;
  }) {
    const payload = {
      message,
      isLanguage,
      isTopic,
      isSubTopic,
      chatId: (window as any)?.chatId
    };
    try {
      const response = await fetch(
        `${getApiUrl()}/message/guest/external/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        setGuestChatRefetch((prev) => !prev);
      } else {
        toast.error(response?.statusText || 'Something went wrong');
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || 'Something went wrong');
    }
  }

  async function sendGuestChatMessageFeedback(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    if (givenFeedback || givenRating) {
      return;
    }
    const payload = {
      feedback,
      rating,
      chatId: (window as any)?.chatId,
      conversationId: guestChatConversationId
    };
    try {
      const response = await fetch(
        `${getApiUrl()}/message/guest/external/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        setGuestChatRefetch((prev) => !prev);
        setRating(0);
        setFeedback('');
      } else {
        toast.error(response?.statusText || 'Something went wrong');
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || 'Something went wrong');
    }
  }

  useEffect(() => {
    scrollToBottom(mainChatContainer as React.RefObject<HTMLDivElement>, 200);
  }, [guestChatRefetch]);

  return (
    <div className='overflow-auto relative scrollbar' ref={mainChatContainer}>
      {!fetched && !isGuest && !actAsGuest && !actAsIpChat && (
        <div className='flex justify-center items-center h-full'>
          <Loader2 className='h-10 w-10 animate-spin stroke-blue-600' />
        </div>
      )}

      {hasMore && !isGuest && !actAsGuest && !actAsIpChat && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className='flex items-center mx-auto gap-2 my-4 w-32 justify-center bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md'
        >
          Load More{' '}
          {loading && <Loader2 className='w-4 h-4 animate-spin stroke-white' />}
        </button>
      )}

      {actAsGuest && (
        <div className='flex flex-col justify-center items-start bg-zinc-100 p-3 m-3 rounded-md'>
          <div className='flex items-center gap-2'>
            <img src={logoUrl} alt={websiteTitle} className='w-5 h-5 rounded' />
            <h2 className='text-base font-bold'>{websiteTitle}</h2>
          </div>
          <p>
            Hi, Welcome to {websiteTitle}. Please select a language to continue.
            Ã Â¦ÂªÃ Â¦Â°Ã Â¦Â¬Ã Â¦Â°Ã Â§ÂÃ Â¦Â¤Ã Â§â‚¬ Ã Â¦Â§Ã Â¦Â¾Ã Â¦ÂªÃ Â§â€¡ Ã Â¦Â¯Ã Â§â€¡Ã Â¦Â¤Ã Â§â€¡ Ã Â¦ÂÃ Â¦â€¢Ã Â¦Å¸Ã Â¦Â¿ Ã Â¦Â­Ã Â¦Â¾Ã Â¦Â·Ã Â¦Â¾ Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Â°Ã Â§ÂÃ Â¦Â¬Ã Â¦Â¾Ã Â¦Å¡Ã Â¦Â¨ Ã Â¦â€¢Ã Â¦Â°Ã Â§ÂÃ Â¦Â¨Ã Â¥Â¤
          </p>
        </div>
      )}

      {actAsGuest && guestMessages?.length === 0 ? (
        <>
          <div className='flex items-center justify-end gap-2 mt-40 p-4'>
            <button
              onClick={async () => {
                setActAsGuestLanguage('English');
                await sendGuestChatMessage({
                  message: 'English',
                  isLanguage: true
                });
              }}
              className={`border hover:bg-blue-600 hover:text-white transition-all duration-300 border-blue-600 text-blue-600 px-4 py-2 rounded-md ${
                actAsGuestLanguage === 'English' ? 'bg-blue-600 text-white' : ''
              }`}
            >
              English
            </button>
            <button
              onClick={async () => {
                setActAsGuestLanguage('Bangla');
                await sendGuestChatMessage({
                  message: 'Bangla',
                  isLanguage: true
                });
              }}
              className={`border hover:bg-blue-600 hover:text-white transition-all duration-300 border-blue-600 text-blue-600 px-4 py-2 rounded-md ${
                actAsGuestLanguage === 'Bangla' ? 'bg-blue-600 text-white' : ''
              }`}
            >
              Bangla
            </button>
          </div>
        </>
      ) : (
        ''
      )}

      {(isGuest || actAsGuest
        ? guestMessages
        : actAsIpChat
        ? ipMessages
        : messages
      )?.map((message, messageIndex) => (
        <Fragment key={message?.id}>
          <div
            className={`mb-[15px] flex flex-col ${
              message?.sender?.role === 'user' || message?.ip?.length > 0
                ? 'items-end'
                : 'items-start'
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
              {message?.sender?.role && message?.sender?.role !== 'user' && (
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
                    message?.sender?.role === 'user' || message?.ip?.length > 0
                      ? 'text-white rounded-bl-[23px] rounded-br-[6px]'
                      : 'text-black rounded-bl-[6px] rounded-br-[23px]'
                  } ${
                    !Array.isArray(message?.attachments) ||
                    message?.attachments?.length === 0
                      ? message?.sender?.role === 'user' ||
                        message?.ip?.length > 0
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
                              message?.sender?.role === 'user' ||
                              message?.ip?.length > 0
                                ? 'bg-[#183572]'
                                : 'bg-[#d1d5db]'
                            }`}
                            onClick={() => downloadAttachment(attachment?.url)}
                          >
                            <FileText
                              className={`w-4 h-4 ${
                                message?.sender?.role === 'user' ||
                                message?.ip?.length > 0
                                  ? 'stroke-white'
                                  : 'stroke-black'
                              }`}
                            />
                            <span
                              className={`truncate max-w-[200px] ${
                                message?.sender?.role === 'user' ||
                                message?.ip?.length > 0
                                  ? 'text-white'
                                  : 'text-black'
                              }`}
                              title={getOriginalFileName(attachment?.url)}
                            >
                              {getOriginalFileName(attachment?.url)}
                            </span>
                            <Download
                              className={`w-4 h-4 ${
                                message?.sender?.role === 'user' ||
                                message?.ip?.length > 0
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
                        ? message?.sender?.role === 'user' ||
                          message?.ip?.length > 0
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
                        message?.sender?.role === 'user' ||
                        message?.ip?.length > 0
                          ? 'text-white'
                          : 'text-black'
                      }`}
                    >
                      <ShowTextWithLink
                        text={message?.message}
                        className={`${
                          message?.sender?.role === 'user' ||
                          message?.ip?.length > 0
                            ? 'text-white'
                            : 'text-blue-600'
                        }`}
                      />
                    </p>
                    {actAsGuest &&
                    (messageIndex === 0 ||
                      messageIndex === 1 ||
                      (Array.isArray(selectedTopic?.subTopic) &&
                        selectedTopic?.subTopic?.length > 0)) ? null : (
                      <span
                        className={`text-xs mt-1 text-right block ${
                          Array.isArray(message?.attachments) &&
                          message?.attachments?.length
                            ? message?.message
                              ? message?.sender?.role === 'user' || message?.ip
                                ? 'text-white'
                                : 'text-black'
                              : 'text-black'
                            : message?.sender?.role === 'user' || message?.ip
                            ? 'text-white'
                            : 'text-black'
                        }`}
                      >
                        {getDate(message?.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
                {actAsGuest &&
                (messageIndex === 0 ||
                  messageIndex === 1 ||
                  (Array.isArray(selectedTopic?.subTopic) &&
                    selectedTopic?.subTopic?.length > 0 &&
                    messageIndex === 2)) ? null : (
                  <span
                    className={`text-xs mt-0.5 ${
                      message?.sender?.role === 'user' || message?.ip
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {message?.sender?.role === 'user' || message?.ip
                      ? `${message?.isAdminViewed ? 'Seen' : ''}`
                      : `${message?.sender?.name} (${
                          message?.sender?.position
                            ? message?.sender?.position
                            : message?.sender?.role
                        })`}
                  </span>
                )}
              </div>

              {actAsGuest &&
              (messageIndex === 0 ||
                messageIndex === 1 ||
                (Array.isArray(selectedTopic?.subTopic) &&
                  selectedTopic?.subTopic?.length > 0 &&
                  messageIndex === 2)) ? null : (
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
              )}

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
          {actAsGuest && messageIndex === 0 && (
            <div className='flex flex-col justify-center items-start bg-zinc-100 p-3 m-3 rounded-md'>
              <div className='flex items-center gap-2'>
                <img
                  src={logoUrl}
                  alt={websiteTitle}
                  className='w-5 h-5 rounded'
                />
                <h2 className='text-base font-bold'>{websiteTitle}</h2>
              </div>
              <p>
                {actAsGuestLanguage === 'English'
                  ? 'Hi Valued Customer, how can we help you? Please select one of the options below to help us better understand your query.'
                  : 'Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¿Ã Â§Å¸ Ã Â¦â€”Ã Â§ÂÃ Â¦Â°Ã Â¦Â¾Ã Â¦Â¹Ã Â¦â€¢, Ã Â¦â€¢Ã Â¦Â¿Ã Â¦Â­Ã Â¦Â¾Ã Â¦Â¬Ã Â§â€¡ Ã Â¦â€ Ã Â¦ÂªÃ Â¦Â¨Ã Â¦Â¾Ã Â¦â€¢Ã Â§â€¡ Ã Â¦Â¸Ã Â¦Â¹Ã Â¦Â¾Ã Â§Å¸Ã Â¦Â¤Ã Â¦Â¾ Ã Â¦â€¢Ã Â¦Â°Ã Â¦Â¤Ã Â§â€¡ Ã Â¦ÂªÃ Â¦Â¾Ã Â¦Â°Ã Â¦Â¿? Ã Â¦â€ Ã Â¦ÂªÃ Â¦Â¨Ã Â¦Â¾Ã Â¦Â° Ã Â¦â€¦Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¸Ã Â¦Â¨Ã Â§ÂÃ Â¦Â§Ã Â¦Â¾Ã Â¦Â¨Ã Â¦Å¸Ã Â¦Â¿ Ã Â¦Â­Ã Â¦Â¾Ã Â¦Â²Ã Â§â€¹Ã Â¦Â­Ã Â¦Â¾Ã Â¦Â¬Ã Â§â€¡ Ã Â¦Â¬Ã Â§ÂÃ Â¦ÂÃ Â¦Â¾Ã Â¦Â¬Ã Â¦Â¾Ã Â¦Â° Ã Â¦Å“Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¯ Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Å¡Ã Â§â€¡Ã Â¦Â° Ã Â¦Â¬Ã Â¦Â¿Ã Â¦â€¢Ã Â¦Â²Ã Â§ÂÃ Â¦ÂªÃ Â¦â€”Ã Â§ÂÃ Â¦Â²Ã Â¦Â¿Ã Â¦Â° Ã Â¦Â®Ã Â¦Â§Ã Â§ÂÃ Â¦Â¯Ã Â§â€¡ Ã Â¦Â¥Ã Â§â€¡Ã Â¦â€¢Ã Â§â€¡ Ã Â¦Â¯Ã Â§â€¡ Ã Â¦â€¢Ã Â§â€¹Ã Â¦Â¨Ã Â§â€¹ Ã Â¦ÂÃ Â¦â€¢Ã Â¦Å¸Ã Â¦Â¿ Ã Â¦â€¦Ã Â¦ÂªÃ Â¦Â¶Ã Â¦Â¨ Ã Â¦Â¸Ã Â¦Â¿Ã Â¦Â²Ã Â§â€¡Ã Â¦â€¢Ã Â§ÂÃ Â¦Å¸ Ã Â¦â€¢Ã Â¦Â°Ã Â§ÂÃ Â¦Â¨Ã Â¥Â¤'}
              </p>
            </div>
          )}
          {actAsGuest && guestMessages?.length === 1 ? (
            <>
              <div className='flex flex-wrap items-center justify-end gap-2 mt-4 p-4'>
                {guestChatQueryTopics?.map((queryTopic, index) => (
                  <button
                    key={index}
                    onClick={async () => {
                      setTopic(queryTopic?.topic);
                      await sendGuestChatMessage({
                        message: queryTopic?.topic,
                        isTopic: true
                      });
                    }}
                    className={`border hover:bg-blue-600 hover:text-white transition-all duration-300 border-blue-600 text-blue-600 px-4 py-2 rounded-md ${
                      topic === queryTopic?.topic
                        ? 'bg-blue-600 text-white'
                        : ''
                    }`}
                  >
                    {queryTopic?.topic}
                  </button>
                ))}
              </div>
            </>
          ) : (
            ''
          )}

          {actAsGuest &&
            messageIndex === 1 &&
            Array.isArray(selectedTopic?.subTopic) &&
            selectedTopic?.subTopic?.length > 0 && (
              <div className='flex flex-col justify-center items-start bg-zinc-100 p-3 m-3 rounded-md'>
                <div className='flex items-center gap-2'>
                  <img
                    src={logoUrl}
                    alt={websiteTitle}
                    className='w-5 h-5 rounded'
                  />
                  <h2 className='text-base font-bold'>{websiteTitle}</h2>
                </div>
                <p className='whitespace-pre-wrap break-words'>
                  {actAsGuestLanguage === 'English'
                    ? `You have selected:\n${selectedTopic?.topic}\nPlease select one of the options below again to help us better understand your query.`
                    : `Ã Â¦â€ Ã Â¦ÂªÃ Â¦Â¨Ã Â¦Â¿ Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Â°Ã Â§ÂÃ Â¦Â¬Ã Â¦Â¾Ã Â¦Å¡Ã Â¦Â¨ Ã Â¦â€¢Ã Â¦Â°Ã Â§â€¡Ã Â¦â€ºÃ Â§â€¡Ã Â¦Â¨: \n${selectedTopic?.topic}\nÃ Â¦â€ Ã Â¦ÂªÃ Â¦Â¨Ã Â¦Â¾Ã Â¦Â° Ã Â¦â€¢Ã Â§â€¹Ã Â§Å¸Ã Â§â€¡Ã Â¦Â°Ã Â¦Â¿ Ã Â¦â€ Ã Â¦Â°Ã Â¦â€œ Ã Â¦Â­Ã Â¦Â¾Ã Â¦Â²Ã Â¦Â­Ã Â¦Â¾Ã Â¦Â¬Ã Â§â€¡ Ã Â¦Â¬Ã Â§ÂÃ Â¦ÂÃ Â¦Â¤Ã Â§â€¡ Ã Â¦â€ Ã Â¦Â®Ã Â¦Â¾Ã Â¦Â¦Ã Â§â€¡Ã Â¦Â° Ã Â¦Â¸Ã Â¦Â¾Ã Â¦Â¹Ã Â¦Â¾Ã Â¦Â¯Ã Â§ÂÃ Â¦Â¯ Ã Â¦â€¢Ã Â¦Â°Ã Â¦Â¤Ã Â§â€¡ Ã Â¦Â¦Ã Â¦Â¯Ã Â¦Â¼Ã Â¦Â¾ Ã Â¦â€¢Ã Â¦Â°Ã Â§â€¡ Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Å¡Ã Â§â€¡Ã Â¦Â° Ã Â¦Â¬Ã Â¦Â¿Ã Â¦â€¢Ã Â¦Â²Ã Â§ÂÃ Â¦ÂªÃ Â¦â€”Ã Â§ÂÃ Â¦Â²Ã Â¦Â¿Ã Â¦Â° Ã Â¦Â®Ã Â¦Â§Ã Â§ÂÃ Â¦Â¯Ã Â§â€¡ Ã Â¦ÂÃ Â¦â€¢Ã Â¦Å¸Ã Â¦Â¿ Ã Â¦â€ Ã Â¦Â¬Ã Â¦Â¾Ã Â¦Â° Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Â°Ã Â§ÂÃ Â¦Â¬Ã Â¦Â¾Ã Â¦Å¡Ã Â¦Â¨ Ã Â¦â€¢Ã Â¦Â°Ã Â§ÂÃ Â¦Â¨Ã Â¥Â¤`}
                </p>
              </div>
            )}

          {actAsGuest &&
          guestMessages?.length === 2 &&
          messageIndex === 1 &&
          Array.isArray(selectedTopic?.subTopic) &&
          selectedTopic?.subTopic?.length > 0 ? (
            <div className='flex flex-wrap items-center justify-end gap-2 mt-4 p-4'>
              {selectedTopic?.subTopic?.map((subQueryTopic, index) => (
                <button
                  key={index}
                  onClick={async () => {
                    setSubTopic(subQueryTopic);
                    await sendGuestChatMessage({
                      message: subQueryTopic,
                      isSubTopic: true
                    });
                  }}
                  className={`border hover:bg-blue-600 hover:text-white transition-all duration-300 border-blue-600 text-blue-600 px-4 py-2 rounded-md ${
                    subTopic === subQueryTopic ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  {subQueryTopic}
                </button>
              ))}
            </div>
          ) : (
            ''
          )}

          {actAsGuest &&
            ((messageIndex === 1 &&
              (!Array.isArray(selectedTopic?.subTopic) ||
                (selectedTopic?.subTopic || [])?.length <= 0)) ||
              (messageIndex === 2 &&
                Array.isArray(selectedTopic?.subTopic) &&
                selectedTopic?.subTopic?.length > 0)) && (
              <>
                <div className='flex flex-col justify-center items-start bg-zinc-100 p-3 m-3 rounded-md'>
                  <div className='flex items-center gap-2'>
                    <img
                      src={logoUrl}
                      alt={websiteTitle}
                      className='w-5 h-5 rounded'
                    />
                    <h2 className='text-base font-bold'>{websiteTitle}</h2>
                  </div>
                  <p className='whitespace-pre-wrap break-words'>
                    {actAsGuestLanguage === 'English'
                      ? `You have selected:\n${selectedTopic?.topic}\nHold on, we're connecting you with our Support Representative.`
                      : `Ã Â¦â€ Ã Â¦ÂªÃ Â¦Â¨Ã Â¦Â¿ Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Â°Ã Â§ÂÃ Â¦Â¬Ã Â¦Â¾Ã Â¦Å¡Ã Â¦Â¨ Ã Â¦â€¢Ã Â¦Â°Ã Â§â€¡Ã Â¦â€ºÃ Â§â€¡Ã Â¦Â¨: \n${selectedTopic?.topic}\nÃ Â¦Â¦Ã Â§Å¸Ã Â¦Â¾Ã Â¦â€¢Ã Â¦Â°Ã Â§â€¡ Ã Â¦â€¦Ã Â¦ÂªÃ Â§â€¡Ã Â¦â€¢Ã Â§ÂÃ Â¦Â·Ã Â¦Â¾ Ã Â¦â€¢Ã Â¦Â°Ã Â§ÂÃ Â¦Â¨, Ã Â¦â€ Ã Â¦Â®Ã Â¦Â°Ã Â¦Â¾ Ã Â¦â€ Ã Â¦ÂªÃ Â¦Â¨Ã Â¦Â¾Ã Â¦â€¢Ã Â§â€¡ Ã Â¦â€ Ã Â¦Â®Ã Â¦Â¾Ã Â¦Â¦Ã Â§â€¡Ã Â¦Â° Ã Â¦â€¢Ã Â¦Â¾Ã Â¦Â¸Ã Â§ÂÃ Â¦Å¸Ã Â¦Â®Ã Â¦Â¾Ã Â¦Â° Ã Â¦Â¸Ã Â¦Â¾Ã Â¦ÂªÃ Â§â€¹Ã Â¦Â°Ã Â§ÂÃ Â¦Å¸Ã Â§â€¡ Ã Â¦Â¸Ã Â¦â€šÃ Â¦Â¯Ã Â§ÂÃ Â¦â€¢Ã Â§ÂÃ Â¦Â¤ Ã Â¦â€¢Ã Â¦Â°Ã Â¦â€ºÃ Â¦Â¿Ã Â¥Â¤`}
                  </p>
                </div>

                {!isAgentContinued && !isClosed && (
                  <div className='flex items-center justify-center gap-2 mb-4'>
                    <div className='flex items-center gap-1'>
                      {supportAgents?.map((agent) => (
                        <div
                          key={agent?.id}
                          className='relative -ml-2 first:ml-0 hidden sm:block'
                        >
                          <img
                            src={agent?.picture || logoUrl}
                            alt='Support Agent'
                            className='w-6 h-6 rounded-full object-cover border-2 border-white'
                            loading='lazy'
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              agent?.status === 'online'
                                ? 'bg-green-500'
                                : 'bg-yellow-500'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <span>Waiting for an agent</span>
                  </div>
                )}
              </>
            )}
        </Fragment>
      ))}

      {isClosed && (
        <form onSubmit={sendGuestChatMessageFeedback}>
          <div className='flex flex-col justify-center items-start bg-zinc-100 p-3 m-3 rounded-md'>
            <div className='flex items-center gap-2'>
              <img
                src={logoUrl}
                alt={websiteTitle}
                className='w-5 h-5 rounded'
              />
              <h2 className='text-base font-bold'>{websiteTitle}</h2>
            </div>
            <p>Help {agentName} understand how they're doing:</p>
          </div>
          <div className='flex flex-col justify-center items-start bg-zinc-100 p-3 m-3 rounded-md relative'>
            <div className='flex items-center justify-center text-center mx-auto gap-2'>
              {givenFeedback
                ? 'You rated your conversation'
                : 'Rate your conversation'}
            </div>
            <Theme3Rating rating={rating} setRating={setRating} />
            {rating && !givenFeedback ? (
              <>
                <textarea
                  required
                  className='w-full max-h-20 min-h-11 mt-2 pr-8 scrollbar px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                  placeholder='Tell us more...'
                  onChange={(e) => setFeedback(e.target.value)}
                  value={feedback}
                />
                <button
                  className='absolute right-[22px] top-[106px]'
                  type='submit'
                >
                  <SendIcon className='h-5 w-5 stroke-blue-500' />
                </button>
              </>
            ) : (
              ''
            )}
            {givenFeedback && (
              <p className='text-sm text-gray-500 mt-2'>
                Feedback: {givenFeedback}
              </p>
            )}
          </div>
          <p className='text-center py-2 bg-gray-200 text-gray-700'>
            Your conversation has ended
          </p>
        </form>
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
        message?.sender?.role === 'user' || message?.ip ? '' : 'ml-5'
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
        {message?.targetMessage?.sender?.role === 'user' ||
        message?.targetMessage?.ip
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
