import Theme3TicketLists from './Theme3TicketLists';
import Theme3SingleTicket from './Theme3SingleTicket';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3Support() {
  const { isAddNewTicket, supportContainerRef } = useMainApp();

  return (
    <div ref={supportContainerRef}>
      {isAddNewTicket ? <Theme3SingleTicket /> : <Theme3TicketLists />}
    </div>
  );
}
