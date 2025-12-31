import { useMainApp } from '@/context/livechat/mainAppContext';
import Theme3AllArticles from './Theme3AllArticles';
import Theme3SingleArticle from './Theme3SingleArticle';

export default function Theme3Help() {
  const { selectedTemplateMessage } = useMainApp();
  return (
    <>
      {selectedTemplateMessage?.id ? (
        <Theme3SingleArticle />
      ) : (
        <Theme3AllArticles />
      )}
    </>
  );
}
