import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import Theme1MainContainer from './Themes/Theme1/Theme1MainContainer';
import Theme2MainContainer from './Themes/Theme2/Theme2MainContainer';
import Theme3MainContainer from './Themes/Theme3/Theme3MainContainer';
import Agent from '@/types/livechat/Agent';
import { useSocket } from '@/context/livechat/socket';
import { useMainApp } from '@/context/livechat/mainAppContext';

const LIMIT = 30;

export default function MainChatWidget() {
  const {
    user,
    fetched,
    userFetched,
    openLiveChat,
    selectedTheme,
    setShowChat,
    guestChatRefetch,
    setShowHomepage,
    setShowAllTemplateMessages,
    setSelectedTemplateMessage,
    setTemplateMessages,
    page,
    setGuestMessages,
    actAsGuest,
    setTopic,
    setSubTopic,
    setSupportAgents,
    refetchAgents,
    setIsAgentContinued,
    setIsClosed,
    setActAsGuestLanguage,
    setRefetchAgents,
    setGuestChatConversationId,
    setAgentName,
    setGivenFeedback,
    setGivenRating,
    selectedConversationId,
    setRecentGuestConversation,
    refetchGuestLastConversation,
    actAsIpChat,
    ipChatRefetch,
    setIpMessages
  } = useMainApp();
  const { socket } = useSocket();

  useEffect(() => {
    const chatId = (window as any)?.chatId;
    if (!chatId || selectedTheme === 'theme1') {
      return;
    }
    (async () => {
      try {
        const response = await fetch(
          `${getApiUrl()}/template/client-template-messages/external?chatId=${
            (window as any)?.chatId
          }`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('ca_token')}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTemplateMessages(data?.templates);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [selectedTheme, setTemplateMessages]);

  function handleViewAllArticles() {
    setShowAllTemplateMessages(true);
  }

  function handleBackToMain() {
    setShowAllTemplateMessages(false);
    setSelectedTemplateMessage(null);
  }

  useEffect(() => {
    if (user?.id) {
      setShowChat(true);
      setShowHomepage(false);
    } else {
      setShowChat(false);
      setShowHomepage(true);
    }
  }, [user, setShowHomepage, setShowChat]);

  useEffect(() => {
    async function fetchGuestMessages() {
      try {
        if (!actAsGuest) {
          return;
        }

        const response = await fetch(
          `${getApiUrl()}/message/guest/external?chatId=${
            (window as any)?.chatId
          }&page=${page}&limit=${9999}&conversationId=${selectedConversationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('ca_token')}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setGuestMessages(data?.messages?.toReversed());
          setActAsGuestLanguage(data?.language);
          setTopic(data?.topic);
          setSubTopic(data?.subTopic);
          setIsAgentContinued(data?.isAgentContinued);
          setGuestChatConversationId(data?.conversationId);
          setAgentName(data?.agentName);
          setGivenFeedback(data?.feedback);
          setGivenRating(data?.rating);
          setIsClosed(data?.isClosed);
        } else {
          setGuestMessages([]);
          setIsClosed(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchGuestMessages();
  }, [
    page,
    guestChatRefetch,
    actAsGuest,
    setActAsGuestLanguage,
    setGuestMessages,
    setIsAgentContinued,
    setIsClosed,
    setSubTopic,
    setTopic,
    setGuestChatConversationId,
    setGivenFeedback,
    setGivenRating,
    selectedConversationId,
    setAgentName
  ]);

  useEffect(() => {
    async function fetchIpMessages() {
      try {
        if (!actAsIpChat) {
          return;
        }

        const response = await fetch(
          `${getApiUrl()}/message/ip/external?chatId=${
            (window as any)?.chatId
          }&page=${page}&limit=${9999}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('ca_token')}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setIpMessages(data?.messages?.toReversed());
        } else {
          setIpMessages([]);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchIpMessages();
  }, [page, ipChatRefetch, actAsIpChat, setIpMessages]);

  useEffect(() => {
    async function fetchGuestLastConversation() {
      try {
        if (selectedTheme !== 'theme3') {
          return;
        }

        const response = await fetch(
          `${getApiUrl()}/message/recent-guest-conversation/external?chatId=${
            (window as any)?.chatId
          }`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('ca_token')}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setRecentGuestConversation(data?.conversation);
        } else {
          setRecentGuestConversation(null);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchGuestLastConversation();
  }, [selectedTheme, setRecentGuestConversation, refetchGuestLastConversation]);

  useEffect(() => {
    const fetchActiveAgents = async () => {
      try {
        if (selectedTheme !== 'theme3') {
          return;
        }
        const response = await fetch(
          `${getApiUrl()}/message/active-agents/external?chatId=${
            (window as any)?.chatId
          }`
        );
        if (response.ok) {
          const data = await response.json();

          const agents = Array.isArray(data?.activeAgents)
            ? data?.activeAgents
            : [];
          const onlineAgents = agents?.filter(
            (agent: Agent) => agent?.status === 'online'
          );
          const offlineAgents = agents?.filter(
            (agent: Agent) => agent?.status === 'offline'
          );

          const activeAgents = [...onlineAgents, ...offlineAgents];
          setSupportAgents(activeAgents?.slice(0, 3));
        } else {
          const data = await response.json();
          toast.error(data?.message || 'Failed to fetch active agents');
        }
      } catch (error: any) {
        console.log(error);
      }
    };

    fetchActiveAgents();
  }, [refetchAgents, selectedTheme, setSupportAgents]);

  useEffect(() => {
    if (selectedTheme !== 'theme3') {
      return;
    }
    socket?.on('agentUpdate', (data: any, callback: any) => {
      if (callback) {
        callback('received');
      }
      setRefetchAgents((prev) => !prev);
    });

    return () => {
      socket?.off('agentUpdate');
    };
  }, [socket, selectedTheme, setRefetchAgents]);

  if (!fetched || !userFetched) {
    return null;
  }

  return (
    <div
      className={`fixed right-3 bottom-3 left-auto z-[99999999] ${
        openLiveChat
          ? selectedTheme === 'theme1'
            ? user?.id
              ? 'sm:h-[600px] sm:w-[420px] w-[340px] h-[560px]'
              : 'sm:h-[490px] sm:w-[420px] w-[340px] h-[560px]'
            : selectedTheme === 'theme2'
            ? 'sm:w-[400px] w-[335px] sm:h-[600px] h-[530px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden'
            : '' // theme3 styles are in the Theme3MainContainer.tsx
          : 'w-fit h-fit'
      }`}
      id='bs_livechat_main_container'
    >
      {selectedTheme === 'theme1' && <Theme1MainContainer />}

      {selectedTheme === 'theme2' && (
        <Theme2MainContainer
          handleViewAllArticles={handleViewAllArticles}
          handleBackToMain={handleBackToMain}
        />
      )}

      {selectedTheme === 'theme3' && <Theme3MainContainer />}

      <ToastContainer autoClose={2000} />
    </div>
  );
}
