import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { messageAlert } from '@/helpers/livechat-utils/fetchMessages';
import { useMainApp } from './mainAppContext';

interface Context {
  socket?: Socket | null;
}

const SocketContext = createContext<Context>({});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const {
    user,
    setChatRefetch,
    setOpenLiveChat,
    setChatType,
    setShowChat,
    setActiveTab,
    setGuestChatRefetch,
    setActAsGuest,
    setShowHomepage,
    setSelectedConversationId,
    setIpChatRefetch,
    setActAsIpChat,
    setShowGuestLogin
  } = useMainApp();

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_LIVECHAT_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      query: {
        userId: user?.id,
        chatId: user?.chatId || (window as any)?.chatId,
        role: user?.role
      }
    });
    if (socketInstance) {
      setSocket(socketInstance);
    } else {
      setSocket(null);
    }

    return () => {
      if (socketInstance) {
        socketInstance?.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    socket?.on('newMessage', (silent?: boolean, callback?: any) => {
      if (callback) {
        callback('received');
      }
      setChatRefetch((prev) => !prev);
      if (!silent) {
        messageAlert(() => {
          setOpenLiveChat((prev) => {
            if (prev === false) {
              setChatType('chat');
              setShowChat(true);
              setActiveTab('chat');
              return !prev;
            }
            return prev;
          });
        });
      }
    });

    return () => {
      socket?.off('newMessage');
    };
  }, [
    socket,
    setChatRefetch,
    setOpenLiveChat,
    setChatType,
    setShowChat,
    setActiveTab
  ]);

  useEffect(() => {
    socket?.on(
      'newGuestMessage',
      (silent?: boolean, conversationId?: number, callback?: any) => {
        if (callback) {
          callback('received');
        }
        setGuestChatRefetch((prev) => !prev);
        if (conversationId) {
          setSelectedConversationId(conversationId);
        }
        setActAsGuest(true);
        setChatType('chat');
        setActiveTab('chat');
        setShowHomepage(false);
        if (!silent) {
          messageAlert(() => {
            setOpenLiveChat((prev) => {
              if (prev === false) {
                setChatType('chat');
                setActiveTab('chat');
                setActAsGuest(true);
                return !prev;
              }
              return prev;
            });
          });
        }
      }
    );

    return () => {
      socket?.off('newGuestMessage');
    };
  }, [
    socket,
    setGuestChatRefetch,
    setOpenLiveChat,
    setChatType,
    setActiveTab,
    setActAsGuest,
    setShowHomepage,
    setSelectedConversationId
  ]);

  useEffect(() => {
    socket?.on(
      'newIpMessage',
      (silent?: boolean, conversationId?: number, callback?: any) => {
        if (callback) {
          callback('received');
        }

        setIpChatRefetch((prev) => !prev);
        if (conversationId) {
          setSelectedConversationId(conversationId);
        }
        setActAsIpChat(true);
        setChatType('chat');
        setActiveTab('chat');
        setShowHomepage(false);
        setShowGuestLogin(false);
        if (!silent) {
          messageAlert(() => {
            setOpenLiveChat((prev) => {
              if (prev === false) {
                setChatType('chat');
                setActiveTab('chat');
                setActAsIpChat(true);
                return !prev;
              }
              return prev;
            });
          });
        }
      }
    );

    return () => {
      socket?.off('newIpMessage');
    };
  }, [
    socket,
    setGuestChatRefetch,
    setOpenLiveChat,
    setChatType,
    setActiveTab,
    setActAsIpChat,
    setShowHomepage,
    setSelectedConversationId,
    setIpChatRefetch,
    setShowGuestLogin
  ]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
