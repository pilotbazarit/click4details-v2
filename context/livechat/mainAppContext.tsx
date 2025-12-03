import { createContext, useContext, useRef, useState } from 'react';
import UserFormField from '@/types/livechat/UserFormField';
import User from '@/types/livechat/User';
import PositionData from '@/types/livechat/PositionData';
import { GuestChatQueryTopic } from '@/types/livechat/GuestChatQueryTopic';
import TemplateMessage from '@/types/livechat/TemplateMessages';
import Message from '@/types/livechat/Message';
import Ticket from '@/types/livechat/Ticket';
import Agent from '@/types/livechat/Agent';
import GuestConversation from '@/types/livechat/GuestConversation';

interface MainAppContextType {
  openLiveChat: boolean;
  setOpenLiveChat: React.Dispatch<React.SetStateAction<boolean>>;
  logoUrl: string;
  setLogoUrl: React.Dispatch<React.SetStateAction<string>>;
  websiteTitle: string;
  setWebsiteTitle: React.Dispatch<React.SetStateAction<string>>;
  websiteTCUrl: string;
  setWebsiteTCUrl: React.Dispatch<React.SetStateAction<string>>;
  websiteAdminUrl: string;
  setWebsiteAdminUrl: React.Dispatch<React.SetStateAction<string>>;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  chatType: 'chat' | 'support';
  setChatType: React.Dispatch<React.SetStateAction<'chat' | 'support'>>;
  chatClosedTime: string;
  openChatByDefaultTimeout: React.RefObject<NodeJS.Timeout | null> | null;
  chatRefetch: boolean;
  setChatRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  isChatOn: boolean;
  setIsChatOn: React.Dispatch<React.SetStateAction<boolean>>;
  userFormFields: UserFormField[];
  setUserFormFields: React.Dispatch<React.SetStateAction<UserFormField[]>>;
  showHomepage: boolean;
  setShowHomepage: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTheme: 'theme1' | 'theme2' | 'theme3';
  setSelectedTheme: React.Dispatch<
    React.SetStateAction<'theme1' | 'theme2' | 'theme3'>
  >;
  fetched: boolean;
  setFetched: React.Dispatch<React.SetStateAction<boolean>>;
  userFetched: boolean;
  setUserFetched: React.Dispatch<React.SetStateAction<boolean>>;
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: 'home' | 'chat' | 'help' | 'ticket';
  setActiveTab: React.Dispatch<
    React.SetStateAction<'home' | 'chat' | 'help' | 'ticket'>
  >;
  positionData: PositionData | null;
  setPositionData: React.Dispatch<React.SetStateAction<PositionData | null>>;
  guestChatRefetch: boolean;
  setGuestChatRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  isGuest: boolean;
  setIsGuest: React.Dispatch<React.SetStateAction<boolean>>;
  closeButton: 'Cross' | 'Minus';
  setCloseButton: React.Dispatch<React.SetStateAction<'Cross' | 'Minus'>>;
  guestChatQueryTopics: GuestChatQueryTopic[];
  setGuestChatQueryTopics: React.Dispatch<
    React.SetStateAction<GuestChatQueryTopic[]>
  >;
  isAddNewTicket: boolean;
  setIsAddNewTicket: React.Dispatch<React.SetStateAction<boolean>>;
  showGetStarted: boolean;
  setShowGetStarted: React.Dispatch<React.SetStateAction<boolean>>;
  showAllTemplateMessages: boolean;
  setShowAllTemplateMessages: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTemplateMessage: TemplateMessage | null;
  setSelectedTemplateMessage: React.Dispatch<
    React.SetStateAction<TemplateMessage | null>
  >;
  templateMessages: TemplateMessage[];
  setTemplateMessages: React.Dispatch<React.SetStateAction<TemplateMessage[]>>;
  fromAllArticles: boolean;
  setFromAllArticles: React.Dispatch<React.SetStateAction<boolean>>;
  refetchTickets: boolean;
  setRefetchTickets: React.Dispatch<React.SetStateAction<boolean>>;
  returnToHomepage: boolean;
  setReturnToHomepage: React.Dispatch<React.SetStateAction<boolean>>;
  page: number;
  ipMessages: Message[];
  setIpMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  guestMessages: Message[];
  setGuestMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  showGuestLogin: boolean;
  setShowGuestLogin: React.Dispatch<React.SetStateAction<boolean>>;
  actAsGuest: boolean;
  setActAsGuest: React.Dispatch<React.SetStateAction<boolean>>;
  actAsGuestLanguage: string;
  topic: string;
  setTopic: React.Dispatch<React.SetStateAction<string>>;
  subTopic: string;
  setSubTopic: React.Dispatch<React.SetStateAction<string>>;
  supportAgents: Agent[];
  setSupportAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  refetchAgents: boolean;
  isAgentContinued: boolean;
  setIsAgentContinued: React.Dispatch<React.SetStateAction<boolean>>;
  isClosed: boolean;
  setIsClosed: React.Dispatch<React.SetStateAction<boolean>>;
  setActAsGuestLanguage: React.Dispatch<React.SetStateAction<string>>;
  setRefetchAgents: React.Dispatch<React.SetStateAction<boolean>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  selectedTicket: Ticket | null;
  setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
  supportContainerRef: React.RefObject<HTMLDivElement | null>;
  imageUrl: string;
  setImageUrl: React.Dispatch<React.SetStateAction<string>>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMessageToReply: Message | null;
  setSelectedMessageToReply: React.Dispatch<
    React.SetStateAction<Message | null>
  >;
  fromHomepage: boolean;
  setFromHomepage: React.Dispatch<React.SetStateAction<boolean>>;
  showAllArticles: boolean;
  setShowAllArticles: React.Dispatch<React.SetStateAction<boolean>>;
  rating: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
  feedback: string;
  setFeedback: React.Dispatch<React.SetStateAction<string>>;
  guestChatConversationId: number | null;
  setGuestChatConversationId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  agentName: string;
  setAgentName: React.Dispatch<React.SetStateAction<string>>;
  givenFeedback: string;
  setGivenFeedback: React.Dispatch<React.SetStateAction<string>>;
  givenRating: number;
  setGivenRating: React.Dispatch<React.SetStateAction<number>>;
  selectedConversationId: number | null;
  setSelectedConversationId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  recentGuestConversation: GuestConversation | null;
  setRecentGuestConversation: React.Dispatch<
    React.SetStateAction<GuestConversation | null>
  >;
  refetchGuestLastConversation: boolean;
  setRefetchGuestLastConversation: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  ipChatRefetch: boolean;
  setIpChatRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  actAsIpChat: boolean;
  setActAsIpChat: React.Dispatch<React.SetStateAction<boolean>>;
  chatIconText: string;
  setChatIconText: React.Dispatch<React.SetStateAction<string>>;
  showChatIcon: boolean;
  setShowChatIcon: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainAppContext = createContext<MainAppContextType>(
  {} as MainAppContextType
);

export function MainAppProvider({ children }: { children: React.ReactNode }) {
  const [openLiveChat, setOpenLiveChat] = useState<boolean>(
    window.localStorage.getItem('openLiveChat') === 'true'
  );
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [guestChatConversationId, setGuestChatConversationId] = useState<
    number | null
  >(null);
  const [websiteTitle, setWebsiteTitle] = useState<string>('');
  const [websiteTCUrl, setWebsiteTCUrl] = useState<string>('');
  const [websiteAdminUrl, setWebsiteAdminUrl] = useState<string>('');
  const [user, setUser] = useState<User>({} as User);
  const [chatType, setChatType] = useState<'chat' | 'support'>('chat');
  const chatClosedTime = window.localStorage.getItem('chatClosedTime') || '';
  const openChatByDefaultTimeout = useRef<NodeJS.Timeout | null>(null);
  const [chatRefetch, setChatRefetch] = useState<boolean>(false);
  const [isChatOn, setIsChatOn] = useState<boolean>(true);
  const [userFormFields, setUserFormFields] = useState<UserFormField[]>([]);
  const [chatIconText, setChatIconText] = useState<string>('');
  const [showChatIcon, setShowChatIcon] = useState<boolean>(false);
  const [showHomepage, setShowHomepage] = useState<boolean>(true);
  const [selectedTheme, setSelectedTheme] = useState<
    'theme1' | 'theme2' | 'theme3'
  >('theme1');
  const [refetchGuestLastConversation, setRefetchGuestLastConversation] =
    useState<boolean>(false);
  const [fetched, setFetched] = useState<boolean>(false);
  const [userFetched, setUserFetched] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'home' | 'chat' | 'help' | 'ticket'
  >('home');
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const [guestChatRefetch, setGuestChatRefetch] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [closeButton, setCloseButton] = useState<'Cross' | 'Minus'>('Cross');
  const [guestChatQueryTopics, setGuestChatQueryTopics] = useState<
    GuestChatQueryTopic[]
  >([]);
  const [isAddNewTicket, setIsAddNewTicket] = useState<boolean>(false);
  const [showGetStarted, setShowGetStarted] = useState<boolean>(false);
  const [showAllTemplateMessages, setShowAllTemplateMessages] =
    useState<boolean>(false);
  const [selectedTemplateMessage, setSelectedTemplateMessage] =
    useState<TemplateMessage | null>(null);
  const [templateMessages, setTemplateMessages] = useState<TemplateMessage[]>(
    []
  );
  const [showAllArticles, setShowAllArticles] = useState<boolean>(false);
  const [selectedMessageToReply, setSelectedMessageToReply] =
    useState<Message | null>(null);
  const [fromAllArticles, setFromAllArticles] = useState<boolean>(false);
  const [refetchTickets, setRefetchTickets] = useState<boolean>(false);
  const [returnToHomepage, setReturnToHomepage] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [guestMessages, setGuestMessages] = useState<Message[]>([]);
  const [ipMessages, setIpMessages] = useState<Message[]>([]);
  const [showGuestLogin, setShowGuestLogin] = useState<boolean>(false);
  const [actAsGuest, setActAsGuest] = useState<boolean>(false);
  const [actAsGuestLanguage, setActAsGuestLanguage] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [subTopic, setSubTopic] = useState<string>('');
  const [supportAgents, setSupportAgents] = useState<Agent[]>([]);
  const [refetchAgents, setRefetchAgents] = useState<boolean>(false);
  const [isAgentContinued, setIsAgentContinued] = useState<boolean>(false);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(30);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const supportContainerRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [fromHomepage, setFromHomepage] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [givenFeedback, setGivenFeedback] = useState<string>('');
  const [givenRating, setGivenRating] = useState<number>(0);
  const [agentName, setAgentName] = useState<string>('');
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [recentGuestConversation, setRecentGuestConversation] =
    useState<GuestConversation | null>(null);
  const [ipChatRefetch, setIpChatRefetch] = useState<boolean>(false);
  const [actAsIpChat, setActAsIpChat] = useState<boolean>(false);

  return (
    <MainAppContext.Provider
      value={{
        chatIconText,
        setChatIconText,
        showChatIcon,
        setShowChatIcon,
        fromHomepage,
        setFromHomepage,
        showAllArticles,
        setShowAllArticles,
        selectedMessageToReply,
        setSelectedMessageToReply,
        limit,
        setLimit,
        page,
        setPage,
        openLiveChat,
        setOpenLiveChat,
        logoUrl,
        setLogoUrl,
        websiteTitle,
        setWebsiteTitle,
        websiteTCUrl,
        setWebsiteTCUrl,
        websiteAdminUrl,
        setWebsiteAdminUrl,
        user,
        setUser,
        chatType,
        setChatType,
        chatClosedTime,
        openChatByDefaultTimeout,
        chatRefetch,
        setChatRefetch,
        isChatOn,
        setIsChatOn,
        userFormFields,
        setUserFormFields,
        showHomepage,
        setShowHomepage,
        selectedTheme,
        setSelectedTheme,
        fetched,
        setFetched,
        userFetched,
        setUserFetched,
        showChat,
        setShowChat,
        activeTab,
        setActiveTab,
        positionData,
        setPositionData,
        guestChatRefetch,
        setGuestChatRefetch,
        isGuest,
        setIsGuest,
        closeButton,
        setCloseButton,
        guestChatQueryTopics,
        setGuestChatQueryTopics,
        isAddNewTicket,
        setIsAddNewTicket,
        showGetStarted,
        setShowGetStarted,
        showAllTemplateMessages,
        setShowAllTemplateMessages,
        selectedTemplateMessage,
        setSelectedTemplateMessage,
        templateMessages,
        setTemplateMessages,
        fromAllArticles,
        setFromAllArticles,
        refetchTickets,
        setRefetchTickets,
        returnToHomepage,
        setReturnToHomepage,
        guestMessages,
        setGuestMessages,
        ipMessages,
        setIpMessages,
        showGuestLogin,
        setShowGuestLogin,
        actAsGuest,
        setActAsGuest,
        actAsGuestLanguage,
        topic,
        setTopic,
        subTopic,
        setSubTopic,
        supportAgents,
        setSupportAgents,
        refetchAgents,
        isAgentContinued,
        setIsAgentContinued,
        isClosed,
        setIsClosed,
        setActAsGuestLanguage,
        setRefetchAgents,
        selectedTicket,
        setSelectedTicket,
        supportContainerRef,
        imageUrl,
        setImageUrl,
        openModal,
        setOpenModal,
        rating,
        setRating,
        feedback,
        setFeedback,
        guestChatConversationId,
        setGuestChatConversationId,
        agentName,
        setAgentName,
        givenFeedback,
        setGivenFeedback,
        givenRating,
        setGivenRating,
        selectedConversationId,
        setSelectedConversationId,
        recentGuestConversation,
        setRecentGuestConversation,
        refetchGuestLastConversation,
        setRefetchGuestLastConversation,
        ipChatRefetch,
        setIpChatRefetch,
        actAsIpChat,
        setActAsIpChat
      }}
    >
      {children}
    </MainAppContext.Provider>
  );
}

export function useMainApp() {
  return useContext(MainAppContext);
}
