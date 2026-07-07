'use client';

import { useEffect, useState } from 'react';
import { useMainApp } from '@/context/livechat/mainAppContext';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';

export default function InitializeChatWidget() {
  const [currentChatId, setCurrentChatId] = useState<string>('');
  
  const {
    setIsChatOn,
    setUserFormFields,
    setSelectedTheme,
    setFetched,
    setUserFetched,
    setPositionData,
    setCloseButton,
    setGuestChatQueryTopics,
    setUser,
    setLogoUrl,
    setWebsiteTitle,
    setWebsiteTCUrl,
    setWebsiteAdminUrl,
    setChatIconText,
    setShowChatIcon
  } = useMainApp();

  // Listen for chat ID changes from parent component
  useEffect(() => {
    const handleChatIdChange = (event: any) => {
      const newChatId = event.detail?.chatId || (window as any)?.chatId;
      if (newChatId && newChatId !== currentChatId) {
        console.log('🔄 LiveChat: Chat ID changed from', currentChatId, 'to', newChatId);
        setCurrentChatId(newChatId);
        // Reset fetched state to trigger re-fetch
        setFetched(false);
      }
    };

    window.addEventListener('chatIdChanged', handleChatIdChange);
    
    // Initialize with current chatId on mount
    const initialChatId = (window as any)?.chatId;
    if (initialChatId) {
      setCurrentChatId(initialChatId);
    }

    return () => {
      window.removeEventListener('chatIdChanged', handleChatIdChange);
    };
  }, [currentChatId, setFetched]);

  // Fetch chat configuration
  useEffect(() => {
    const chatId = currentChatId || (window as any)?.chatId;
    if (!chatId) {
      console.log('❌ LiveChat: chatId not found on window');
      return;
    }

    // console.log('🔄 LiveChat: Fetching configuration for chatId:', chatId);

    (async () => {
      try {
        const url = `${getApiUrl()}/chat/chat-codes/external?chatId=${chatId}`;
        // console.log('📡 LiveChat: API Request:', url);

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          console.log('✅ LiveChat: Configuration fetched successfully', data);

          setLogoUrl(data?.chatCode?.logoUrl || '');
          setWebsiteTitle(data?.chatCode?.websiteTitle || '');
          setWebsiteAdminUrl(data?.chatCode?.websiteAdminUrl || '');
          setWebsiteTCUrl(data?.chatCode?.websiteTCUrl || '');
          setCloseButton(data?.chatCode?.closeButton || 'Cross');
          setGuestChatQueryTopics(data?.chatCode?.guestChatQueryTopics || []);
          
          window.localStorage.setItem(
            'notification_sound',
            data?.notification_sound || ''
          );

          setSelectedTheme(data?.theme || 'theme3');
          setChatIconText(data?.chatCode?.chatIconText || 'Chat with us');
          setShowChatIcon(data?.chatCode?.showChatIcon !== false);

          setUserFormFields(data?.chatCode?.userFormFields || []);
          setPositionData(data?.chatCode?.positionData || null);

          let isChatOn = true;
          const timeZone = data?.chatCode?.timeZone || '';

          if (data?.chatCode?.disabled) {
            isChatOn = false;
          }

          setIsChatOn(isChatOn);
          setFetched(true);
          console.log('✅ LiveChat: Configuration initialized (fetched=true)');
        } else {
          // console.log('LiveChat: Failed to fetch configuration:', data);
          // Still set fetched to true to prevent infinite loading
          setFetched(true);
        }
      } catch (error) {
        console.log('LiveChat: Error fetching configuration:', error);
        // Still set fetched to true to prevent infinite loading
        setFetched(true);
      }
    })();
  }, [
    currentChatId, // Re-fetch when chat ID changes
    setCloseButton,
    setFetched,
    setGuestChatQueryTopics,
    setIsChatOn,
    setLogoUrl,
    setPositionData,
    setSelectedTheme,
    setUserFormFields,
    setWebsiteAdminUrl,
    setWebsiteTCUrl,
    setWebsiteTitle,
    setChatIconText,
    setShowChatIcon
  ]);

  // Check user authentication
  useEffect(() => {
    const caToken = localStorage.getItem('ca_token');
    if (!caToken) {
      // console.log('📝 LiveChat: No auth token found (guest mode)');
      setUserFetched(true);
      return;
    }

    // console.log('🔄 LiveChat: Checking authentication...');

    (async () => {
      try {
        const response = await fetch(`${getApiUrl()}/auth/refresh`, {
          headers: {
            Authorization: `Bearer ${caToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('ca_token', data?.access_token);
          setUser(data?.user);
          // console.log('✅ LiveChat: User authenticated', data?.user);
        } else {
          console.log('❌ LiveChat: Authentication failed');
        }
      } catch (error) {
        console.error('❌ LiveChat: Auth error:', error);
      } finally {
        setUserFetched(true);
        console.log('✅ LiveChat: User check complete (userFetched=true)');
      }
    })();
  }, [setUser, setUserFetched]);

  return null; // This component doesn't render anything
}

