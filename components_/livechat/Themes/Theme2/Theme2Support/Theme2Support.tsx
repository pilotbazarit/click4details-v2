import Theme2TicketLists from './Theme2TicketLists';
import Theme2SingleTicket from './Theme2SingleTicket';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2Support() {
  const { isAddNewTicket, supportContainerRef } = useMainApp();

  return (
    <div
      className='max-h-[calc(100%-150px)] overflow-auto scrollbar'
      ref={supportContainerRef}
    >
      {isAddNewTicket ? <Theme2SingleTicket /> : <Theme2TicketLists />}
    </div>
  );
}
