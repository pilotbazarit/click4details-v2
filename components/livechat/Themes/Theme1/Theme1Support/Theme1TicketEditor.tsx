import { Loader2, Upload, Trash2 } from 'lucide-react';
import onChangeSetURL from '@/helpers/livechat-utils/onChangeSetURL';
import Ticket from '@/types/livechat/Ticket';

export default function Theme1TicketEditor({
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
    <form onSubmit={handleSubmit} className='mt-4'>
      {!ticket?.id && (
        <div className='mb-3'>
          <label htmlFor='subject' className='mb-1 block font-bold text-black'>
            Subject <span className='text-red-500'>*</span>
          </label>
          <input
            id='subject'
            className='w-full border border-gray-300 outline-none rounded p-2'
            placeholder='Enter Subject...'
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      )}

      <label htmlFor='message' className='mb-1 block font-bold text-black'>
        {ticket?.id ? 'New Message' : 'Description'}{' '}
        <span className='text-red-500'>*</span>
      </label>
      <textarea
        id='message'
        className='w-full border border-gray-300 outline-none rounded p-2 h-14 min-h-[60px] max-h-[150px] scrollbar'
        placeholder={ticket?.id ? 'Enter Message...' : 'Enter Description...'}
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className='mt-2'>
        <label className='mb-1 block font-bold text-black'>
          Screenshots / Images
        </label>
        {screenshots?.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-1'>
            {screenshots?.map((image: any, index) => (
              <div key={index} className='relative'>
                <button
                  title='remove'
                  onClick={() =>
                    setScreenshots((p) => p.filter((_, i) => i !== index))
                  }
                  type='button'
                  className='absolute top-2 right-2 text-red-600 bg-white hover:bg-red-100 w-9 h-9 cursor-pointer rounded-full'
                >
                  <Trash2 className='w-5 h-5 mx-auto' />
                </button>
                {image ? (
                  <img
                    src={image}
                    alt='screenshot'
                    className='w-full h-auto rounded'
                  />
                ) : (
                  ''
                )}
              </div>
            ))}
          </div>
        )}
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
        <button
          type='button'
          onClick={() => fileInputRef?.current?.click()}
          className='flex flex-col items-center justify-center text-black border-2 border-dashed border-gray-300 rounded py-3 cursor-pointer w-full'
        >
          <Upload className='w-5 h-5' />
          <span>Upload</span>
        </button>
      </div>
      <button
        type='submit'
        className='w-full px-6 py-2 rounded border-none bg-blue-600 hover:opacity-90 text-white mt-3 cursor-pointer font-bold flex items-center justify-center'
      >
        {isLoading ? (
          <Loader2 className='w-5 h-5 ml-2 animate-spin stroke-white' />
        ) : (
          'Submit'
        )}
      </button>
    </form>
  );
}
