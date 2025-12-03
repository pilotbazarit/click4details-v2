import { useEffect } from 'react';
import { useRef } from 'react';
import getPixelToPercentageWidth from '@/helpers/livechat-utils/getPixelToPercentageWidth';
import Theme3Chat from './Theme3Chat/Theme3Chat';
import Theme3Help from './Theme3Help/Theme3Help';
import Theme3Homepage from './Theme3Homepage/Theme3Homepage';
import Theme3Login from './Theme3Login/Theme3Login';
import Theme3Footer from './Theme3Others/Theme3Footer';
import Theme3Header from './Theme3Others/Theme3Header';
import Theme3OpenCloseButton from './Theme3Others/Theme3OpenCloseButton';
import Theme3Support from './Theme3Support/Theme3Support';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3MainContainer() {
  const {
    user,
    activeTab,
    openLiveChat,
    positionData,
    isGuest,
    showGuestLogin,
    actAsGuest,
    actAsIpChat
  } = useMainApp();
  const theme3OpenCloseButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme3OpenCloseButtonRef.current) {
      if (positionData?.position === 'topLeft') {
        theme3OpenCloseButtonRef.current.style.setProperty(
          'top',
          getPixelToPercentageWidth(positionData?.top),
          'important'
        );
        theme3OpenCloseButtonRef.current.style.setProperty(
          'left',
          getPixelToPercentageWidth(positionData?.left),
          'important'
        );
      } else if (positionData?.position === 'topRight') {
        theme3OpenCloseButtonRef.current.style.setProperty(
          'top',
          getPixelToPercentageWidth(positionData?.top),
          'important'
        );
        theme3OpenCloseButtonRef.current.style.setProperty(
          'right',
          getPixelToPercentageWidth(positionData?.right),
          'important'
        );
      } else if (positionData?.position === 'bottomLeft') {
        theme3OpenCloseButtonRef.current.style.setProperty(
          'bottom',
          getPixelToPercentageWidth(positionData?.bottom),
          'important'
        );
        theme3OpenCloseButtonRef.current.style.setProperty(
          'left',
          getPixelToPercentageWidth(positionData?.left),
          'important'
        );
      } else if (positionData?.position === 'bottomRight') {
        theme3OpenCloseButtonRef.current.style.setProperty(
          'bottom',
          getPixelToPercentageWidth(positionData?.bottom),
          'important'
        );
        theme3OpenCloseButtonRef.current.style.setProperty(
          'right',
          getPixelToPercentageWidth(positionData?.right),
          'important'
        );
      } else {
        theme3OpenCloseButtonRef.current.style.setProperty(
          'bottom',
          getPixelToPercentageWidth(12),
          'important'
        );
        theme3OpenCloseButtonRef.current.style.setProperty(
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
        <div className='t3-chat-widget t3-chat-widget-transition fixed inset-0 left-auto top-auto bottom-3 rounded-lg right-2 sm:relative sm:inset-auto bg-white sm:rounded-xl shadow-2xl w-[340px] sm:w-[400px] sm:h-[600px] h-[530px] flex flex-col'>
          <Theme3Header />

          <div className='h-full overflow-y-auto scrollbar bg-gray-50'>
            {activeTab === 'home' && <Theme3Homepage />}

            {activeTab === 'chat' && (
              <>
                {user?.id ||
                (isGuest && !showGuestLogin) ||
                actAsGuest ||
                (actAsIpChat && !showGuestLogin) ? (
                  <Theme3Chat />
                ) : (
                  <Theme3Login />
                )}
              </>
            )}

            {activeTab === 'help' && <Theme3Help />}

            {activeTab === 'ticket' && (
              <>
                {user?.id ? (
                  <Theme3Support />
                ) : (
                  <Theme3Login fromSupport={true} />
                )}
              </>
            )}
          </div>

          <Theme3Footer />
        </div>
      )}

      <div
        className={`fixed left-auto z-[99999999] `}
        ref={theme3OpenCloseButtonRef}
      >
        <Theme3OpenCloseButton />
      </div>
    </>
  );
}
