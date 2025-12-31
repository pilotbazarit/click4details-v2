import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme1ChatOpenCloseButton() {
  const { setOpenLiveChat, showChatIcon, chatIconText } = useMainApp();

  const shouldShowChatIcon = showChatIcon || chatIconText?.trim() === '';

  return (
    <button
      className='px-4 h-12 text-2xl block rounded-full bg-blue-600 text-white relative z-[99999999] outline-none border-none cursor-pointer shadow-[0_4px_6px_rgba(0,0,0,0.1)]'
      id='bs_livechat_open_close_button'
      onClick={() => {
        setOpenLiveChat(true);
        window.localStorage.setItem('openLiveChat', `${true}`);
      }}
    >
      <span className='w-full flex items-center justify-center gap-0.5 text-white'>
        {shouldShowChatIcon && (
          <svg
            viewBox='0 0 64 64'
            xmlns='http://www.w3.org/2000/svg'
            strokeWidth='4'
            stroke='#fff'
            fill='none'
            className='w-6 h-6'
          >
            <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
            <g
              id='SVGRepo_tracerCarrier'
              strokeLinecap='round'
              strokeLinejoin='round'
            ></g>
            <g id='SVGRepo_iconCarrier'>
              <path
                d='M12.91,31.8V26.1a19.09,19.09,0,0,1,38.18,0v5.7'
                strokeLinecap='round'
              ></path>
              <path
                d='M12.06,31.8h4.7a0,0,0,0,1,0,0V45.18a0,0,0,0,1,0,0h-4.7a3,3,0,0,1-3-3V34.8A3,3,0,0,1,12.06,31.8Z'
                strokeLinecap='round'
              ></path>
              <path
                d='M50.24,31.8h4.7a0,0,0,0,1,0,0V45.18a0,0,0,0,1,0,0h-4.7a3,3,0,0,1-3-3V34.8A3,3,0,0,1,50.24,31.8Z'
                transform='translate(102.18 76.98) rotate(180)'
                strokeLinecap='round'
              ></path>
              <path
                d='M51.7,45.56v5a4,4,0,0,1-4,4H36.56'
                strokeLinecap='round'
              ></path>
              <rect
                x='28.45'
                y='51.92'
                width='8.1'
                height='5.07'
                rx='2'
                strokeLinecap='round'
              ></rect>
            </g>
          </svg>
        )}
        {chatIconText && (
          <span className='text-white text-lg'>{chatIconText}</span>
        )}
      </span>
    </button>
  );
}
