import User from './User';

export default interface Message {
  id: number;
  ip: string;
  conversationId: number;
  senderId: number;
  sender: User;
  message: string;
  targetMessageId: number;
  targetMessage: Message;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  websiteTitle: string;
  websiteAdminUrl: string;
  isViewed: boolean;
  isAdminViewed: boolean;
}

export interface Attachment {
  url: string;
  name: string;
  isImage?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  isVoice?: boolean;
}
