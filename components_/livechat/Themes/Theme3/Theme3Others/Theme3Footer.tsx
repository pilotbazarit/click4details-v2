import { HelpCircle, Home, MessageSquare, Ticket } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3Footer() {
  const { activeTab, setActiveTab } = useMainApp();
  return (
    <div className='border-t bg-white sm:rounded-b-xl rounded-b-lg'>
      <div className='flex justify-around p-3 sm:p-4'>
        <button
          onClick={() => {
            setActiveTab('home');
          }}
          className='flex flex-col items-center gap-1 transition-colors touch-target px-3 group'
        >
          <Home
            size={20}
            className={
              activeTab === 'home'
                ? 'stroke-blue-600'
                : 'stroke-gray-600 group-hover:stroke-blue-600'
            }
          />
          <span
            className={`text-xs font-bold ${
              activeTab === 'home'
                ? 'text-blue-600'
                : 'text-gray-600 group-hover:text-blue-600'
            }`}
          >
            Home
          </span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className='flex flex-col items-center gap-1 transition-colors touch-target px-3 group'
        >
          <MessageSquare
            size={20}
            className={
              activeTab === 'chat'
                ? 'stroke-blue-600'
                : 'stroke-gray-600 group-hover:stroke-blue-600'
            }
          />
          <span
            className={`text-xs font-bold ${
              activeTab === 'chat'
                ? 'text-blue-600'
                : 'text-gray-600 group-hover:text-blue-600'
            }`}
          >
            Messages
          </span>
        </button>

        <button
          onClick={() => setActiveTab('help')}
          className='flex flex-col items-center gap-1 transition-colors touch-target px-3 group'
        >
          <HelpCircle
            size={20}
            className={
              activeTab === 'help'
                ? 'stroke-blue-600'
                : 'stroke-gray-600 group-hover:stroke-blue-600'
            }
          />
          <span
            className={`text-xs font-bold ${
              activeTab === 'help'
                ? 'text-blue-600'
                : 'text-gray-600 group-hover:text-blue-600'
            }`}
          >
            Help
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ticket')}
          className='flex flex-col items-center gap-1 transition-colors touch-target px-3 group'
        >
          <Ticket
            size={20}
            className={
              activeTab === 'ticket'
                ? 'stroke-blue-600'
                : 'stroke-gray-600 group-hover:stroke-blue-600'
            }
          />
          <span
            className={`text-xs font-bold ${
              activeTab === 'ticket'
                ? 'text-blue-600'
                : 'text-gray-600 group-hover:text-blue-600'
            }`}
          >
            Ticket
          </span>
        </button>
      </div>
    </div>
  );
}
