'use client';

import { useEffect, useState, useContext } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from '@/context/AppContext';
import { getChatIdForContext, getShopIdFromPath, getCompanyShopIdFromPath } from '@/helpers/livechat-utils/getChatIdForContext.js';

// Dynamically import the chat widget to avoid SSR issues
const MainChatWidget = dynamic(
  () => import('./livechat/MainChatWidget'),
  { 
    ssr: false,
    loading: () => null
  }
);

const InitializeChatWidget = dynamic(
  () => import('./livechat/InitializeChatWidget'),
  { 
    ssr: false,
    loading: () => null
  }
);

// Context providers
const MainAppProvider = dynamic(
  () => import('../context/livechat/mainAppContext').then(mod => mod.MainAppProvider),
  { ssr: false }
);

const SocketProvider = dynamic(
  () => import('../context/livechat/socket').then(mod => mod.SocketProvider),
  { ssr: false }
);

export default function LiveChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [currentChatId, setCurrentChatId] = useState('');
  const pathname = usePathname();
  const { user, selectedShop, selectedCompanyShop } = useContext(AppContext);

  useEffect(() => {
    // Determine dynamic chat ID based on context
    if (typeof window !== 'undefined') {
      const chatId = getChatIdForContext({
        userId: user?.id?.toString(),
        shopId: selectedShop || getShopIdFromPath(pathname),
        companyShopId: selectedCompanyShop || getCompanyShopIdFromPath(pathname),
        role: user?.role,
        pathname: pathname,
      });

      // Update chat ID on window
      window.chatId = chatId;
      setCurrentChatId(chatId);
      
      // console.log('🔄 LiveChatWidget: Dynamic Chat ID Updated');
      // console.log('- Chat ID:', chatId);
      // console.log('- User ID:', user?.id);
      // console.log('- User Role:', user?.role);
      // console.log('- Selected Shop:', selectedShop);
      // console.log('- Selected Company Shop:', selectedCompanyShop);
      // console.log('- Current Path:', pathname);
      // console.log('- API URL:', process.env.NEXT_PUBLIC_LIVECHAT_API_URL || 'NOT SET (using default: http://localhost:5000)');
      // console.log('- Socket URL:', process.env.NEXT_PUBLIC_LIVECHAT_SOCKET_URL || 'NOT SET (using default: http://localhost:5000)');
      
      // Dispatch event to notify widget of chat ID change
      window.dispatchEvent(new CustomEvent('chatIdChanged', { detail: { chatId } }));
    }
    setMounted(true);
  }, [pathname, user, selectedShop, selectedCompanyShop]);

  if (!mounted) {
    return null;
  }

  return (
    <MainAppProvider>
      <InitializeChatWidget />
      <SocketProvider>
        <MainChatWidget />
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </SocketProvider>
    </MainAppProvider>
  );
}

