import User from './User';

export default interface Ticket {
  id: number;
  title: string;
  description: TicketMessage[];
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  isViewed: boolean;
  isAdminViewed: boolean;
}

export interface TicketMessage {
  id: number;
  replierId: number;
  replier?: User;
  message: string;
  screenshots: string[];
  dateTime: string;
}
