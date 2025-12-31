import { useEffect, useRef, useState } from 'react';
import {
  Paperclip,
  File as FileIcon,
  MessageCircleMore,
  Trash2,
  Image as ImageIcon,
  X,
  Mic,
  Smile
} from 'lucide-react';
import getOriginalFileName from '@/helpers/livechat-utils/getOriginalFileName';
import TemplateMessage from '@/types/livechat/TemplateMessages';
import onChangeSetURL from '@/helpers/livechat-utils/onChangeSetURL';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import { Attachment } from '@/types/livechat/Message';
import { Picker } from 'emoji-mart';
// import 'emoji-mart/css/emoji-mart.css';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme1ChatEditor({
  editorHeight,
  setEditorHeight
}: {
  editorHeight: number;
  setEditorHeight: React.Dispatch<React.SetStateAction<number>>;
}) {
  const {
    user,
    setChatRefetch,
    templateMessages,
    setTemplateMessages,
    selectedMessageToReply,
    setSelectedMessageToReply,
    setPage,
    isGuest,
    setShowGuestLogin,
    actAsIpChat
  } = useMainApp();
  const editorRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessageRef = useRef<HTMLButtonElement>(null);
  const [inputtedText, setInputtedText] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [openTemplateMenu, setOpenTemplateMenu] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [voiceMessage, setVoiceMessage] = useState<Attachment | null>(null);
  const wasCancelledRef = useRef(false);

  const handleInput = () => {
    const text = editorRef.current?.innerText;
    setInputtedText(text?.trim() || '');
    if (editorRef?.current?.scrollHeight) {
      const replyHeight = selectedMessageToReply?.id
        ? replyRef?.current?.scrollHeight || 0
        : 0;
      const scrollHeight = editorRef.current?.scrollHeight + 38 + replyHeight;
      const heightPercentage = Math.min(
        (scrollHeight / (window?.innerWidth <= 640 ? 425 : 525)) * 100,
        window?.innerWidth <= 640
          ? selectedMessageToReply?.id
            ? 40.7
            : 27.7
          : selectedMessageToReply?.id
          ? 37.5
          : 22.5
      );
      if (!text?.trim()) {
        setEditorHeight(window?.innerWidth <= 640 ? 16.47 : 13.33);
      } else {
        setEditorHeight(heightPercentage);
      }
      if (editorRef.current) {
        editorRef.current.style.setProperty(
          'height',
          !text?.trim()
            ? '32px'
            : editorRef.current.scrollHeight > 80
            ? '80px'
            : `${editorRef.current.scrollHeight}px`,
          'important'
        );
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e?.ctrlKey || e?.metaKey) {
      const blockedKeys = ['b', 'i', 'u', 'e', 's'];
      if (blockedKeys.includes(e?.key?.toLowerCase())) {
        e?.preventDefault();
      }
    } else if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      sendMessageRef.current?.click();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevents pasting with formatting
    const items = e?.clipboardData?.items;
    const files: File[] = [];

    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      handleFilesPasted(files);
    } else {
      // Handle plain text paste
      const text = e?.clipboardData?.getData('text/plain');
      document.execCommand('insertText', false, text);
    }
  };

  const handleFilesPasted = (files: File[]) => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));

    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(
        new Event('change', { bubbles: true })
      );
    }
  };

  async function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (actAsIpChat) {
      setShowGuestLogin(true);
      return;
    }

    if (
      (!inputtedText?.length &&
        attachments?.length === 0 &&
        !voiceMessage?.url) ||
      !user?.id
    ) {
      return;
    }

    const newMessage: any = {
      senderId: user?.id,
      message: inputtedText,
      attachments,
      chatId: (window as any)?.chatId
    };

    if (voiceMessage?.url) {
      newMessage.attachments = [voiceMessage];
    }

    if (selectedMessageToReply?.id) {
      newMessage.targetMessageId = selectedMessageToReply?.id;
    }

    try {
      const response = await fetch(`${getApiUrl()}/message/external/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ca_token')}`
        },
        body: JSON.stringify(newMessage)
      });
      if (response.ok) {
        setAttachments([]);
        setInputtedText('');
        setVoiceMessage(null);
        if (editorRef.current) {
          editorRef.current.innerText = '';

          editorRef.current.style.setProperty('height', '32px', 'important');
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setEditorHeight(window?.innerWidth <= 640 ? 16.47 : 13.33);
        setPage(1);
        setChatRefetch((prev) => !prev);
        setSelectedMessageToReply(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSendTemplateMessage(template: TemplateMessage) {
    if (!template?.question) {
      return;
    }

    const newMessage = {
      senderId: user?.id,
      message: template?.question,
      attachments: [],
      chatId: (window as any)?.chatId,
      templateId: template?.id
    };

    try {
      const response = await fetch(`${getApiUrl()}/message/external/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ca_token')}`
        },
        body: JSON.stringify(newMessage)
      });

      if (response.ok) {
        setAttachments([]);
        setInputtedText('');
        if (editorRef.current) {
          editorRef.current.innerText = '';
          editorRef.current.style.setProperty('height', '32px', 'important');
        }
        setEditorHeight(13.33);
        setPage(1);
        setChatRefetch((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!localStorage.getItem('ca_token')) {
        return;
      }
      try {
        const response = await fetch(
          `${getApiUrl()}/template/client-template-messages/external?chatId=${
            (window as any)?.chatId
          }`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('ca_token')}`
            }
          }
        );
        const data = await response.json();
        if (response.ok) {
          setTemplateMessages(data?.templates);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplates();
  }, [setTemplateMessages]);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.style.setProperty(
        'height',
        `${editorHeight}%`,
        'important'
      );
    }
  }, [editorHeight]);

  useEffect(() => {
    let replyHeight = 0;
    if (selectedMessageToReply?.id) {
      replyHeight = replyRef?.current?.scrollHeight || 0;
    }
    if (editorRef?.current?.scrollHeight) {
      const scrollHeight = editorRef.current?.scrollHeight + 38 + replyHeight;
      const heightPercentage = Math.min(
        (scrollHeight / (window?.innerWidth <= 640 ? 425 : 525)) * 100,
        window?.innerWidth <= 640
          ? selectedMessageToReply?.id
            ? 40.7
            : 27.7
          : selectedMessageToReply?.id
          ? 37.5
          : 22.5
      );
      if (!selectedMessageToReply?.id) {
        setEditorHeight(window?.innerWidth <= 640 ? 16.47 : 13.33);
      } else {
        setEditorHeight(heightPercentage);
      }
      if (editorRef.current) {
        editorRef.current.style.setProperty(
          'height',
          !selectedMessageToReply?.id
            ? '32px'
            : editorRef.current.scrollHeight > 80
            ? '80px'
            : `${editorRef.current.scrollHeight}px`,
          'important'
        );
      }
    }
  }, [selectedMessageToReply, setEditorHeight]);

  const handleEmojiClick = (emojiData: any) => {
    const text = inputtedText + emojiData?.native;
    setInputtedText(text);
    if (editorRef?.current) {
      editorRef.current.innerText = text;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512; // lower value = fewer, larger "dots"
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      try {
        if (wasCancelledRef.current) {
          wasCancelledRef.current = false;
          setVoiceMessage(null);
          setIsRecording(false);
          return;
        }

        const audioFile = new File(audioChunks.current, 'voice-message.webm', {
          type: 'audio/webm'
        });
        const formData = new FormData();
        formData.append('file', audioFile);

        const response = await fetch(
          `${getApiUrl()}/upload/single?convert=true`,
          {
            method: 'POST',
            body: formData
          }
        );
        if (response.ok) {
          const data = await response.json();
          setVoiceMessage({
            url: data?.url,
            name: 'voice-message.webm',
            isAudio: true,
            isImage: false,
            isVideo: false,
            isVoice: true
          });

          setTimeout(() => {
            setInputtedText('');
            sendMessageRef.current?.click();
          }, 100);
        }
      } catch (error) {
        console.log(error);
      } finally {
        const stream = mediaRecorderRef.current?.stream;
        if (stream) {
          stream?.getTracks()?.forEach((track) => track?.stop());
        }
      }
    };
    audioChunks.current = [];
    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);

    drawVisualizer();
  }

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!ctx || !analyser || !dataArray || !canvas) return;

    const centerY = canvas.height / 2;
    const barWidth = 2;
    const gap = 1;
    const MAX_BARS = Math.floor(canvas.width / (barWidth + gap));
    const SAMPLE_INTERVAL = 80;
    const scale = 2;
    const minVisibleHeight = 1;

    const barHistory: number[] = Array(MAX_BARS).fill(0);

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i] - 128;
        sum += val * val;
      }

      const rms = Math.sqrt(sum / dataArray.length);
      const normalized = rms / 128;

      // Always push a new bar: real or flat
      let barHeight = normalized * scale * canvas.height;
      if (isNaN(barHeight) || barHeight === 0) {
        barHeight = minVisibleHeight;
      } else {
        barHeight = Math.min(
          canvas.height,
          Math.max(barHeight, minVisibleHeight)
        );
      }

      // Shift and update history
      barHistory.push(barHeight);
      if (barHistory.length > MAX_BARS) barHistory.shift();

      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw history as moving bars
      barHistory.forEach((h, i) => {
        const x = i * (barWidth + gap);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, centerY - h / 2, barWidth, h);
      });
    };

    animationRef.current = window.setInterval(draw, SAMPLE_INTERVAL);
  };

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    if (animationRef.current) clearInterval(animationRef.current);
    setIsRecording(false);
  }

  return (
    <form
      onSubmit={(e) => {
        if (isRecording) {
          e?.preventDefault();
          stopRecording();
        } else {
          handleSendMessage(e);
        }
      }}
      ref={formRef}
      className='relative mx-2'
      onClick={() => {
        setOpenTemplateMenu(false);
      }}
    >
      {attachments?.length > 0 && (
        <div className='max-h-[300px] overflow-auto absolute bottom-[50px] left-[-16px] bg-[#f8f9fa] border border-slate-700 rounded-lg m-5 p-2 w-[calc(100%-16px)] scrollbar'>
          <div className='flex flex-wrap gap-3 w-full'>
            {attachments?.map((file, index) => (
              <div key={index} className='relative'>
                <button
                  title='remove'
                  onClick={() =>
                    setAttachments((p) => p.filter((_, i) => i !== index))
                  }
                  type='button'
                  className='absolute top-0 right-1 text-red-700 bg-red-100 rounded-full outline-none hover:bg-gray-200 mx-auto p-2 cursor-pointer'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
                {file ? (
                  file?.isImage ? (
                    <img
                      src={file?.url}
                      alt={getOriginalFileName(file?.url) ?? ''}
                      className='w-[300px] h-auto rounded-lg'
                    />
                  ) : (
                    <div className='flex items-center gap-2 pr-10'>
                      <FileIcon className='w-6 h-6' />{' '}
                      {getOriginalFileName(file?.url)}
                    </div>
                  )
                ) : (
                  ''
                )}
                <span className='text-sm'>
                  {getOriginalFileName(file?.url)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className='w-full border border-gray-300 rounded flex flex-col absolute left-0 right-0 pb-8 px-1 pt-1'
        ref={parentRef}
      >
        {selectedMessageToReply?.id ? (
          <div
            className='relative mb-2 rounded-md border-l-4 border-gray-400 bg-gray-300 p-1 !text-sm'
            ref={replyRef}
          >
            <span>
              {selectedMessageToReply?.sender?.name}{' '}
              {selectedMessageToReply?.sender?.role === 'user'
                ? ''
                : `(${
                    selectedMessageToReply?.sender?.position
                      ? selectedMessageToReply?.sender?.position
                      : selectedMessageToReply?.sender?.role
                  })`}
            </span>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-1'>
                {Array.isArray(selectedMessageToReply?.attachments) &&
                  selectedMessageToReply?.attachments?.length > 0 &&
                  (selectedMessageToReply?.attachments[0]?.isImage ? (
                    <ImageIcon className='h-5 w-5' />
                  ) : (
                    <FileIcon className='h-5 w-5' />
                  ))}
                <span className='max-w-[200px] truncate'>
                  {selectedMessageToReply?.message || 'Attachment'}
                </span>
              </div>
              <div>
                {Array.isArray(selectedMessageToReply?.attachments) &&
                  selectedMessageToReply?.attachments?.length > 0 &&
                  selectedMessageToReply?.attachments[0]?.isImage && (
                    <img
                      src={selectedMessageToReply?.attachments[0]?.url}
                      alt=''
                      className='mr-10 h-12 w-12 rounded'
                    />
                  )}
              </div>
            </div>

            <button
              type='button'
              className='absolute right-1 top-1 rounded-full bg-gray-200 p-1 outline-none'
              onClick={() => setSelectedMessageToReply(null)}
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        ) : (
          ''
        )}
        <div className='flex items-start justify-start relative'>
          <div
            ref={editorRef}
            className={`flex-1 px-2 py-1 outline-none relative whitespace-pre-wrap break-words sm:w-full overflow-auto scrollbar h-[32px] ${
              isRecording ? 'opacity-0' : ''
            }`}
            contentEditable={true}
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
          />

          {inputtedText?.trim()?.length === 0 && (
            <span className='absolute bottom-1 left-2 text-gray-400 pointer-events-none'>
              Message...
            </span>
          )}

          <canvas
            ref={canvasRef}
            width={403}
            height={35}
            className={
              isRecording
                ? 'block rounded absolute bottom-0.5 -left-1 z-50'
                : 'hidden'
            }
          />

          {isRecording && (
            <button
              className='absolute -top-[4.55px] rounded-l -left-1 outline-none mx-auto cursor-pointer bg-[#1e293b] px-2 py-[9.5px] z-[100]'
              type='button'
              onClick={() => {
                wasCancelledRef.current = true;
                stopRecording();
              }}
            >
              <Trash2 className='w-4 h-4 stroke-white rounded-full' />
            </button>
          )}
        </div>

        <div className='flex items-center gap-4 absolute right-2 -bottom-0 !text-base pb-1'>
          {openTemplateMenu && (
            <div
              className={`absolute bottom-[88px] right-0 min-w-96 py-4 border border-gray-200 flex flex-col items-start gap-2 rounded-lg z-[150] [&>*]:px-4 bg-white`}
              onClick={(e: any) => {
                e?.preventDefault();
                e?.stopPropagation();
              }}
            >
              <div className='max-h-60 overflow-auto w-full'>
                {templateMessages?.toReversed()?.map((message) => (
                  <div
                    key={message?.id}
                    className='w-full py-2 text-left hover:bg-gray-200 cursor-pointer rounded'
                    onClick={(e: any) => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      handleSendTemplateMessage(message);
                      setOpenTemplateMenu(false);
                    }}
                  >
                    <div className='flex items-center gap-2 px-4 w-full'>
                      <span className='text-sm'>{message?.question}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type='button'
            className='text-cyan-600 cursor-pointer'
            title='Send Template Message'
            onClick={(e: any) => {
              e?.preventDefault();
              e?.stopPropagation();
              if (isGuest) {
                setShowGuestLogin(true);
                return;
              }
              setOpenTemplateMenu((prev: any) => !prev);
            }}
            id='bs_livechat_template_message_button'
          >
            <MessageCircleMore className='w-6 h-6 stroke-cyan-600' />
          </button>

          <input
            type='file'
            className='hidden'
            ref={fileInputRef}
            multiple={true}
            onChange={onChangeSetURL(
              (url: any, type: 'image' | 'video' | 'audio' | 'others') =>
                setAttachments((p: any) => [
                  ...p,
                  {
                    url,
                    isImage: type === 'image',
                    isVideo: type === 'video',
                    isAudio: type === 'audio'
                  }
                ]),
              'others'
            )}
          />
          <button
            className='text-cyan-600 cursor-pointer'
            title='Attachment'
            onClick={(e: any) => {
              e?.preventDefault();
              e?.stopPropagation();
              if (isGuest) {
                setShowGuestLogin(true);
                return;
              }
              if (fileInputRef?.current) {
                fileInputRef.current.click();
              }
            }}
            id='bs_livechat_attachment_button'
          >
            <Paperclip className='w-6 h-6 stroke-cyan-600' />
          </button>

          <button
            type='button'
            ref={emojiButtonRef}
            onClick={() => {
              if (isGuest) {
                setShowGuestLogin(true);
                return;
              }
              setShowEmojiPicker(!showEmojiPicker);
            }}
          >
            <Smile className='w-5 h-5 stroke-cyan-600' />
          </button>
          {showEmojiPicker && (
            <div
              className='absolute bottom-16 right-10 mb-2'
              ref={emojiPickerRef}
            >
              <Picker
                onEmojiSelect={handleEmojiClick}
                theme='light'
                previewPosition='none'
              />
            </div>
          )}

          <button
            type='button'
            onClick={() => {
              if (isGuest) {
                setShowGuestLogin(true);
                return;
              }
              if (isRecording) {
                wasCancelledRef.current = true;
                stopRecording();
              } else {
                startRecording();
              }
            }}
            className='hover:bg-gray-100 rounded-full transition-colors'
          >
            <Mic
              className={`w-5 h-5 ${
                isRecording ? 'stroke-red-500' : 'stroke-cyan-600'
              }`}
            />
          </button>

          <button
            className='text-cyan-600 cursor-pointer'
            title='Send Message'
            ref={sendMessageRef}
            onClick={(e: any) => {
              if (isGuest) {
                e?.preventDefault();
                e?.stopPropagation();
                setShowGuestLogin(true);
                return;
              }
              handleSendMessage(e);
            }}
          >
            <svg
              viewBox='0 0 24 24'
              height='24'
              width='24'
              preserveAspectRatio='xMidYMid meet'
              className=''
              version='1.1'
              x='0px'
              y='0px'
              enableBackground='new 0 0 24 24'
            >
              <path
                fill='currentColor'
                style={{ fill: '#0891b2' }}
                d='M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z'
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
