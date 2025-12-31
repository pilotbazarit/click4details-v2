import Theme1TicketLists from './Theme1TicketLists.tsx';
import Theme1SingleTicket from './Theme1SingleTicket.tsx';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme1Support() {
  const { selectedTicket, isAddNewTicket, supportContainerRef } = useMainApp();

  return (
    <div
      className='max-h-[calc(100%-75px)] overflow-auto scrollbar'
      ref={supportContainerRef}
    >
      {selectedTicket?.id || isAddNewTicket ? (
        <Theme1SingleTicket />
      ) : (
        <Theme1TicketLists />
      )}
    </div>
  );
}
