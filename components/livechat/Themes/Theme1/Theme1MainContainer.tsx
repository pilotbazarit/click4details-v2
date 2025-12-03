import Theme1Login from './Theme1Login/Theme1Login';
import Theme1Chat from './Theme1Chat/Theme1Chat';
import Theme1Header from './Theme1Others/Theme1Header';
import Theme1Support from './Theme1Support/Theme1Support';
import Theme1ChatOpenCloseButton from './Theme1Others/Theme1ChatOpenCloseButton';
import { useEffect, useRef } from 'react';
import getPixelToPercentageWidth from '@/helpers/livechat-utils/getPixelToPercentageWidth';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme1MainContainer() {
  const theme1OpenCloseButtonRef = useRef<HTMLDivElement>(null);
  const {
    user,
    chatType,
    openLiveChat,
    positionData,
    isGuest,
    showGuestLogin,
    actAsIpChat
  } = useMainApp();

  useEffect(() => {
    if (theme1OpenCloseButtonRef.current) {
      if (positionData?.position === 'topLeft') {
        theme1OpenCloseButtonRef.current.style.setProperty(
          'top',
          getPixelToPercentageWidth(positionData?.top),
          'important'
        );
        theme1OpenCloseButtonRef.current.style.setProperty(
          'left',
          getPixelToPercentageWidth(positionData?.left),
          'important'
        );
      } else if (positionData?.position === 'topRight') {
        theme1OpenCloseButtonRef.current.style.setProperty(
          'top',
          getPixelToPercentageWidth(positionData?.top),
          'important'
        );
        theme1OpenCloseButtonRef.current.style.setProperty(
          'right',
          getPixelToPercentageWidth(positionData?.right),
          'important'
        );
      } else if (positionData?.position === 'bottomLeft') {
        theme1OpenCloseButtonRef.current.style.setProperty(
          'bottom',
          getPixelToPercentageWidth(positionData?.bottom),
          'important'
        );
        theme1OpenCloseButtonRef.current.style.setProperty(
          'left',
          getPixelToPercentageWidth(positionData?.left),
          'important'
        );
      } else if (positionData?.position === 'bottomRight') {
        theme1OpenCloseButtonRef.current.style.setProperty(
          'bottom',
          getPixelToPercentageWidth(positionData?.bottom),
          'important'
        );
        theme1OpenCloseButtonRef.current.style.setProperty(
          'right',
          getPixelToPercentageWidth(positionData?.right),
          'important'
        );
      } else {
        theme1OpenCloseButtonRef.current.style.setProperty(
          'bottom',
          getPixelToPercentageWidth(12),
          'important'
        );
        theme1OpenCloseButtonRef.current.style.setProperty(
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
        <div className='rounded h-full w-full bg-white shadow-[0_0_3px_rgba(0,0,0,0.1)]'>
          <Theme1Header />

          {user?.id || ((isGuest || actAsIpChat) && !showGuestLogin) ? (
            chatType === 'chat' ||
            ((isGuest || actAsIpChat) && !showGuestLogin) ? (
              <Theme1Chat />
            ) : (
              <Theme1Support />
            )
          ) : (
            <Theme1Login />
          )}
        </div>
      )}

      <div
        className={`fixed left-auto z-[99999999] ${
          openLiveChat ? 'hidden' : ''
        }`}
        ref={theme1OpenCloseButtonRef}
      >
        <Theme1ChatOpenCloseButton />
      </div>
    </>
  );
}
