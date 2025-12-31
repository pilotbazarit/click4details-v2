import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3HomepageArticles() {
  const {
    templateMessages,
    setSelectedTemplateMessage,
    setShowAllArticles,
    setActiveTab,
    setFromHomepage
  } = useMainApp();

  return (
    <div className='space-y-3'>
      {templateMessages.map((templateMessage) => (
        <button
          key={templateMessage?.id}
          onClick={() => {
            setSelectedTemplateMessage(templateMessage);
            setShowAllArticles(false);
            setActiveTab('help');
            setFromHomepage(true);
          }}
          className='w-full bg-white p-4 rounded-lg shadow hover:shadow-md transition-all hover:translate-y-[-1px] text-left'
        >
          <h4 className='mb-1 text-lg font-bold'>
            {templateMessage?.question}
          </h4>
          {templateMessage?.pictures?.[0] && (
            <img
              src={templateMessage?.pictures?.[0]}
              alt={templateMessage?.question}
              className='w-full h-40 object-cover rounded-lg'
            />
          )}
          <p className='line-clamp-2 mt-2'>{templateMessage?.answer}</p>
        </button>
      ))}
    </div>
  );
}
