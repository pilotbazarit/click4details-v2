import {
  ArrowRight,
  Dot,
  HelpCircle,
  MessageCircle,
  MessageCircleDashed
} from 'lucide-react';
import Theme3HomepageArticles from './Theme3HomepageArticles';
import { useMainApp } from '@/context/livechat/mainAppContext';
import { useEffect, useRef } from 'react';
import { timeAgo } from '@/helpers/livechat-utils/timeAgo';

export default function Theme3Homepage() {
  const hasToggledRef = useRef(false);

  const {
    setActiveTab,
    setActAsGuest,
    recentGuestConversation,
    setRefetchGuestLastConversation,
    websiteTitle,
    supportAgents,
    logoUrl,
    setSelectedConversationId
  } = useMainApp();

  useEffect(() => {
    if (hasToggledRef.current) return;

    setRefetchGuestLastConversation((prev) => !prev);

    hasToggledRef.current = true;
  }, [setRefetchGuestLastConversation]);

  const shouldShowRecentMessage = recentGuestConversation?.id
    ? recentGuestConversation?.activeAgentId
      ? true
      : recentGuestConversation?.status === 'active'
    : false;

  return (
    <div className='p-4 space-y-4'>
      <div className='text-center mb-6'>
        <p className='text-sm text-gray-500'>
          We typically reply within a few minutes
        </p>
      </div>

      {shouldShowRecentMessage && (
        <div
          onClick={() => {
            setActAsGuest(true);
            setSelectedConversationId(recentGuestConversation?.id || null);
            setActiveTab('chat');
          }}
          className='w-full bg-white p-4 rounded-lg shadow hover:shadow-md transition-all hover:translate-y-[-1px] cursor-pointer'
        >
          <div className='pb-1'>Recent Message</div>
          <div className='flex items-center gap-2 w-full'>
            {recentGuestConversation?.agent?.picture ? (
              <img
                src={recentGuestConversation?.agent?.picture}
                className='w-9 h-9 rounded-full'
              />
            ) : (
              <div className='relative w-11 h-14 mr-1'>
                <img
                  src={supportAgents[0]?.picture || logoUrl}
                  className='w-7 h-7 rounded-full absolute left-[20%] top-1 z-10 border border-gray-300'
                />
                <img
                  src={supportAgents[1]?.picture || logoUrl}
                  className='w-7 h-7 rounded-full absolute left-0 top-6 z-[5] border border-gray-300'
                />
                <img
                  src={supportAgents[2]?.picture || logoUrl}
                  className='w-7 h-7 rounded-full absolute left-[45%] top-6 z-0 border border-gray-300'
                />
              </div>
            )}

            <div className='flex flex-col w-full'>
              <div className='line-clamp-1'>
                {recentGuestConversation?.status === 'active'
                  ? recentGuestConversation?.messages[0]?.message
                  : 'Rate your conversation'}
              </div>
              <div className='text-gray-600 w-full flex items-center gap-1'>
                {recentGuestConversation?.agent?.name || websiteTitle}
                <Dot className='h-4 w-4 stroke-gray-600' />
                {timeAgo(recentGuestConversation?.messages[0]?.createdAt || '')}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setActiveTab('chat')}
        className='w-full bg-white p-4 rounded-lg shadow hover:shadow-md transition-all hover:translate-y-[-1px] flex items-center justify-between group'
      >
        <div className='flex items-center gap-3'>
          <MessageCircle size={20} className='stroke-blue-600' />
          <span className='font-medium'>Send us a message</span>
        </div>
        <ArrowRight
          size={18}
          className='stroke-blue-600 transition-transform group-hover:translate-x-1'
        />
      </button>

      <button
        onClick={() => {
          setActAsGuest(true);
          setActiveTab('chat');
        }}
        className='w-full bg-white p-4 rounded-lg shadow hover:shadow-md transition-all hover:translate-y-[-1px] flex items-center justify-between group'
      >
        <div className='flex items-center gap-3'>
          <MessageCircleDashed size={20} className='stroke-blue-600' />
          <span className='font-medium'>Send us a message as guest</span>
        </div>
        <ArrowRight
          size={18}
          className='stroke-blue-600 transition-transform group-hover:translate-x-1'
        />
      </button>

      <button
        onClick={() => setActiveTab('help')}
        className='w-full bg-white p-4 rounded-lg shadow hover:shadow-md transition-all hover:translate-y-[-1px] flex items-center justify-between group'
      >
        <div className='flex items-center gap-3'>
          <HelpCircle size={20} className='stroke-blue-600' />
          <span className='font-medium'>Help Center</span>
        </div>
        <ArrowRight
          size={18}
          className='stroke-blue-600 transition-transform group-hover:translate-x-1'
        />
      </button>

      <Theme3HomepageArticles />
    </div>
  );
}
