import { ArrowRight } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3SingleArticle() {
  const {
    selectedTemplateMessage,
    setSelectedTemplateMessage,
    setShowAllArticles,
    fromHomepage,
    setFromHomepage,
    setActiveTab
  } = useMainApp();
  return (
    <div className='p-4'>
      <button
        onClick={() => {
          setSelectedTemplateMessage(null);
          setShowAllArticles(true);
          if (fromHomepage) {
            setActiveTab('home');
            setFromHomepage(false);
          }
        }}
        className='flex items-center text-blue-600 mb-4 hover:text-blue-700 group'
      >
        <ArrowRight
          className='rotate-180 mr-1 stroke-blue-600 group-hover:stroke-blue-700'
          size={16}
        />{' '}
        Back to Articles
      </button>
      <h3 className='text-xl font-bold mb-2 text-black'>
        {selectedTemplateMessage?.question}
      </h3>

      <div className='flex flex-col gap-2'>
        {selectedTemplateMessage?.pictures?.map((picture) => (
          <img
            src={picture}
            alt={selectedTemplateMessage?.question}
            className='w-full h-40 object-cover rounded-lg'
          />
        ))}
      </div>
      <p className='mt-2'>{selectedTemplateMessage?.answer}</p>
    </div>
  );
}
