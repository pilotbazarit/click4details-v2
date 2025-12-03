import Message from './Message';
import User from './User';

export default interface GuestConversation {
  id: number;
  activeAgentId: number;
  agent: User;
  status: 'active' | 'closed';
  messages: Message[];
  updatedAt: string;
}
