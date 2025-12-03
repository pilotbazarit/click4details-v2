import { useEffect } from 'react';
import { useRef } from 'react';
import Theme2Chat from './Theme2Chat/Theme2Chat';
import Theme2AllArticles from './Theme2Homepage/Theme2AllArticles';
import Theme2SingleArticle from './Theme2Homepage/Theme2SingleArticle';
import Theme2WelcomeMessage from './Theme2Homepage/Theme2WelcomeMessage';
import Theme2Login from './Theme2Login/Theme2Login';
import Theme2Header from './Theme2Others/Theme2Header';
import Theme2OpenCloseButton from './Theme2Others/Theme2OpenCloseButton';
import Theme2Support from './Theme2Support/Theme2Support';
import getPixelToPercentageWidth from '@/helpers/livechat-utils/getPixelToPercentageWidth';
import { useMainApp } from '@/context/livechat/mainAppContext';

interface Theme2MainContainerProps {
  handleBackToMain: () => void;
  handleViewAllArticles: () => void;
}

export default function Theme2MainContainer({
  handleBackToMain,
  handleViewAllArticles
}: Theme2MainContainerProps) {
  const {
    user,
    chatType,
    openLiveChat,
    showChat,
    showGetStarted,
    selectedTemplateMessage,
    showHomepage,
    showAllTemplateMessages,
    positionData,
    isGuest,
    actAsIpChat,
    showGuestLogin
  } = useMainApp();
  const theme2OpenCloseButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme2OpenCloseButtonRef.current) {
      if (positionData?.position === 'topLeft') {
        theme2OpenCloseButtonRef.current.style.setProperty(
          'top',
          getPixelToPercentageWidth(positionData?.top),
          'important'
        );
        theme2OpenCloseButtonRef.current.style.setProperty(
          'left',
          getPixelToPercentageWidth(positionData?.left),
          'important'
        );
      } else if (positionData?.position === 'topRight') {
        theme2OpenCloseButtonRef.current.style.setProperty(
          'top',
          getPixelToPercentageWidth(positionData?.top),
          'important'
        );
        theme2OpenCloseButtonRef.current.style.setProperty(
          'right',
          getPixelToPercentageWidth(positionData?.right),
          'important'
        );
      } else if (positionData?.position === 'bottomLeft') {
        theme2OpenCloseButtonRef.current.style.setProperty(
          'bottom',
          getPixelToPercentageWidth(positionData?.bottom),
          'important'
        );
        theme2OpenCloseButtonRef.current.style.setProperty(
          'left',
          getPixelToPercentageWidth(positionData?.left),
          'important'
        );
      } else if (positionData?.position === 'bottomRight') {
        theme2OpenCloseButtonRef.current.style.setProperty(
          'bottom',
          getPixelToPercentageWidth(positionData?.bottom),
          'important'
        );
        theme2OpenCloseButtonRef.current.style.setProperty(
          'right',
          getPixelToPercentageWidth(positionData?.right),
          'important'
        );
      } else {
        theme2OpenCloseButtonRef.current.style.setProperty(
          'bottom',
          getPixelToPercentageWidth(12),
          'important'
        );
        theme2OpenCloseButtonRef.current.style.setProperty(
          'right',
          getPixelToPercentageWidth(12),
          'important'
        );
      }
    }
  }, [positionData]);

  return (
    <>
      {openLiveChat && (
        <div className='flex-1 overflow-hidden'>
          <Theme2Header />

          {chatType === 'chat' && (
            <>
              {showChat ||
              (isGuest && !showGuestLogin && !showHomepage) ||
              (actAsIpChat && !showGuestLogin && !showHomepage) ? (
                <div className='h-[calc(100%-90px)]'>
                  <Theme2Chat />
                </div>
              ) : (showGetStarted && !user?.id) ||
                (isGuest && showGuestLogin && !showHomepage) ||
                (actAsIpChat && showGuestLogin && !showHomepage) ? (
                <Theme2Login />
              ) : selectedTemplateMessage ? (
                <Theme2SingleArticle />
              ) : showAllTemplateMessages ? (
                <Theme2AllArticles handleBackToMain={handleBackToMain} />
              ) : showHomepage ? (
                <Theme2WelcomeMessage
                  handleViewAllArticles={handleViewAllArticles}
                />
              ) : (
                ''
              )}
            </>
          )}

          {chatType === 'support' && (
            <>
              {user?.id ? (
                <Theme2Support />
              ) : (
                <Theme2Login fromSupport={true} />
              )}
            </>
          )}
        </div>
      )}

      <div
        className={`fixed left-auto z-[99999999]`}
        ref={theme2OpenCloseButtonRef}
      >
        <Theme2OpenCloseButton />
      </div>
    </>
  );
}
