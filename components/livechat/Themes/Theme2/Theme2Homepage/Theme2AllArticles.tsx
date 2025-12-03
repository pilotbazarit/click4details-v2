import { ArrowLeft } from 'lucide-react';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2AllArticles({
  handleBackToMain
}: {
  handleBackToMain: () => void;
}) {
  const {
    templateMessages,
    setSelectedTemplateMessage,
    setShowAllTemplateMessages,
    setFromAllArticles
  } = useMainApp();

  return (
    <div className='h-[calc(100%-150px)] overflow-y-auto scrollbar p-6'>
      <div className='flex items-center gap-2 mb-6'>
        <button
          onClick={handleBackToMain}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
        >
          <ArrowLeft className='w-5 h-5 text-gray-600' />
        </button>
        <h2 className='text-xl font-semibold'>Help Center Articles</h2>
      </div>

      <div className='space-y-3'>
        {templateMessages.map((templateMessage) => (
          <button
            key={templateMessage?.id}
            onClick={() => {
              setShowAllTemplateMessages(false);
              setFromAllArticles(true);
              setSelectedTemplateMessage(templateMessage);
            }}
            className='w-full p-4 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 group'
          >
            <div className='flex justify-between items-start'>
              <div>
                <h3 className='font-medium mt-2 group-hover:text-blue-600 transition-colors'>
                  {templateMessage?.question}
                </h3>
                <p className='text-sm text-gray-600 mt-2 line-clamp-2'>
                  {templateMessage?.answer}
                </p>
              </div>
              <ArrowLeft className='w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity mt-2' />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
