import { ArrowRight } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3AllArticles() {
  const {
    templateMessages,
    setActiveTab,
    setSelectedTemplateMessage,
    setShowAllArticles
  } = useMainApp();
  return (
    <div className='p-4'>
      <button
        onClick={() => {
          setActiveTab('home');
          setShowAllArticles(false);
        }}
        className='flex items-center text-blue-600 mb-4 hover:text-blue-700 group'
      >
        <ArrowRight
          className='rotate-180 mr-1 stroke-blue-600 group-hover:stroke-blue-700'
          size={16}
        />{' '}
        Back to Menu
      </button>
      <h3 className='text-lg font-bold mb-4'>Help Articles</h3>
      <div className='space-y-3'>
        {templateMessages.map((templateMessage) => (
          <button
            key={templateMessage?.id}
            onClick={() => {
              setSelectedTemplateMessage(templateMessage);
              setShowAllArticles(false);
            }}
            className='w-full bg-white p-4 rounded-lg shadow hover:shadow-md transition-all hover:translate-y-[-1px] text-left'
          >
            <h4 className='font-bold mb-1'>{templateMessage?.question}</h4>
          </button>
        ))}
      </div>
    </div>
  );
}
