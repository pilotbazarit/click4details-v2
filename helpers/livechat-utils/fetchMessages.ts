import { getApiUrl } from './getApiUrl';
import Message from '@/types/livechat/Message';
import User from '@/types/livechat/User';

export async function fetchMessages({
  user,
  setMessages,
  mainChatContainer,
  page,
  limit,
  setHasMore,
  setLoading
}: {
  user: User;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  mainChatContainer: React.RefObject<HTMLDivElement>;
  page: number;
  limit: number;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  try {
    if (user?.id) {
      setLoading(true);
      const response = await fetch(
        `${getApiUrl()}/message/external?chatId=${
          (window as any)?.chatId
        }&page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ca_token')}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => {
          if (page === 1) {
            scrollToBottom(mainChatContainer);
          }

          if (page === 1) {
            return [...(data?.messages || []).toReversed()];
          } else {
            return [...(data?.messages || []).toReversed(), ...prev];
          }
        });
        if (data?.messages?.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        setMessages([]);
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    setLoading(false);
  }
}

export function messageAlert(callback?: any) {
  const notificationSound = window.localStorage.getItem('notification_sound');
  if (notificationSound) {
    const audio = new Audio(notificationSound);
    audio.play()?.catch((error) => {});
  }
  if (callback) {
    callback();
  }
}

export function scrollToBottom(
  mainChatContainer: React.RefObject<HTMLDivElement>,
  timeout?: number
) {
  setTimeout(() => {
    mainChatContainer.current?.scrollTo({
      top: mainChatContainer.current?.scrollHeight,
      behavior: 'smooth'
    });
  }, timeout || 100);
}
