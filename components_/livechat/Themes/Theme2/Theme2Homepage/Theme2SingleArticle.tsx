import { ArrowLeft } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2SingleArticle() {
  const {
    setSelectedTemplateMessage,
    setShowAllTemplateMessages,
    selectedTemplateMessage,
    fromAllArticles
  } = useMainApp();
  return (
    <div className='h-full overflow-y-auto scrollbar-thin p-6'>
      <button
        onClick={() => {
          setSelectedTemplateMessage(null);
          if (fromAllArticles) {
            setShowAllTemplateMessages(true);
          }
        }}
        className='mb-4 text-blue-500 hover:text-blue-600 flex items-center gap-1'
      >
        <ArrowLeft className='w-5 h-5' />
        Back to {fromAllArticles ? 'articles' : 'home'}
      </button>
      <div className='mb-6'></div>
      <h2 className='text-xl font-semibold mb-4'>
        {selectedTemplateMessage?.question}
      </h2>
      <p className='text-gray-600 leading-relaxed'>
        {selectedTemplateMessage?.answer}
      </p>
    </div>
  );
}
