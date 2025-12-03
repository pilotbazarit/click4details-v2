import { ArrowLeft } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2WelcomeMessage({
  handleViewAllArticles
}: {
  handleViewAllArticles: () => void;
}) {
  const {
    user,
    setShowGetStarted,
    setSelectedTemplateMessage,
    templateMessages,
    setFromAllArticles,
    setChatType,
    setIsAddNewTicket,
    setShowHomepage,
    setShowChat,
    setReturnToHomepage
  } = useMainApp();
  return (
    <div className='h-[calc(100%-150px)] flex flex-col'>
      <div className='p-6 overflow-y-auto scrollbar'>
        <h1 className='text-2xl font-bold mb-2 text-black'>
          Welcome to Live Chat
        </h1>
        <p className='text-gray-600 mb-6'>
          Our team is here to assist you with any questions or concerns.
        </p>

        <div className='grid gap-4 mb-6'>
          <button
            onClick={() => {
              setShowGetStarted(true);
              setShowHomepage(false);
              if (user?.id) {
                setShowChat(true);
              }
            }}
            className='px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors w-full text-left relative group'
          >
            <h3 className='font-bold mb-1 text-white'>
              {user?.id ? 'Continue Conversation' : 'Start New Conversation'}
            </h3>
            <p className='text-sm text-blue-100'>
              Connect with our support team
            </p>
            <ArrowLeft className='w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity stroke-white' />
          </button>

          <button
            onClick={() => {
              setChatType('support');
              setIsAddNewTicket(true);
              setReturnToHomepage(true);
            }}
            className='px-6 py-4 bg-[#E6F0FA] hover:bg-blue-100 text-gray-900 rounded-lg transition-colors w-full text-left relative group'
          >
            <h3 className='font-bold mb-1 text-black'>Submit a Ticket</h3>
            <p className='text-sm text-gray-500'>Create a support ticket</p>
            <ArrowLeft className='w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity' />
          </button>
        </div>

        <div className='w-full'>
          <div className='space-y-2'>
            {templateMessages?.slice?.(0, 3)?.map((templateMessage) => (
              <button
                key={templateMessage?.id}
                onClick={() => {
                  setFromAllArticles(false);
                  setSelectedTemplateMessage(templateMessage);
                }}
                className='w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 group'
              >
                <div className='flex justify-between items-center'>
                  <div>
                    <h3 className='font-medium group-hover:text-blue-600 transition-colors'>
                      {templateMessage?.question}
                    </h3>
                  </div>
                  <ArrowLeft className='w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity' />
                </div>
              </button>
            ))}
          </div>
          <div
            className='flex items-center justify-between mt-4 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 group cursor-pointer'
            onClick={handleViewAllArticles}
          >
            <h2 className='font-medium group-hover:text-blue-600 transition-colors'>
              Help Center
            </h2>
            <button className='text-sm text-blue-500 hover:text-blue-600'>
              View all articles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
