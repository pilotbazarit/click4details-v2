import { Loader2, Trash2, ImageIcon } from 'lucide-react';
import onChangeSetURL from '@/helpers/livechat-utils/onChangeSetURL';
import Ticket from '@/types/livechat/Ticket';

export default function Theme3TicketEditor({
  handleSubmit,
  subject,
  setSubject,
  description,
  setDescription,
  screenshots,
  setScreenshots,
  ticket,
  fileInputRef,
  isLoading
}: {
  handleSubmit: React.FormEventHandler<HTMLFormElement>;
  subject: string;
  setSubject: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  screenshots: string[];
  setScreenshots: React.Dispatch<React.SetStateAction<string[]>>;
  ticket: Ticket | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isLoading: boolean;
}) {
  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {!ticket?.id && (
        <div>
          <label className='block text-sm font-bold text-gray-700 mb-1'>
            Subject <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            placeholder='Enter Subject...'
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
            required
          />
        </div>
      )}

      <div>
        <label className='block text-sm font-bold text-gray-700 mb-1'>
          {ticket?.id ? 'New Message' : 'Description'}{' '}
          <span className='text-red-500'>*</span>
        </label>
        <textarea
          value={description}
          placeholder={ticket?.id ? 'Enter Message...' : 'Enter Description...'}
          onChange={(e) => setDescription(e.target.value)}
          className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[60px] max-h-[150px] scrollbar'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-bold text-gray-700 mb-1'>
          Attachments
        </label>

        <button
          type='button'
          onClick={() => fileInputRef?.current?.click()}
          className='flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors'
        >
          <ImageIcon size={20} />
          <span>Add Images</span>
        </button>
        <input
          type='file'
          accept='image/*'
          multiple={true}
          onChange={onChangeSetURL(
            (url: any) => setScreenshots((p) => [...p, url]),
            'image'
          )}
          className='hidden'
          ref={fileInputRef}
        />
        <div className='flex flex-wrap gap-2 mt-2'>
          {screenshots?.map((screenshot, index) => (
            <div key={screenshot} className='relative group'>
              <img
                src={screenshot}
                alt='Attachment'
                className='w-20 h-20 object-cover rounded-lg border'
              />
              <button
                onClick={() =>
                  setScreenshots((p) => p.filter((_, i) => i !== index))
                }
                className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <Trash2 size={12} className='stroke-white' />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        type='submit'
        className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center'
      >
        Submit {ticket?.id ? '' : 'Ticket'}{' '}
        {isLoading && (
          <Loader2 className='w-4 h-4 ml-2 animate-spin stroke-white' />
        )}
      </button>
    </form>
  );
}
