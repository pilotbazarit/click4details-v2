import { useEffect, useRef, useState } from 'react';
import {
  Paperclip,
  File as FileIcon,
  Trash2,
  Smile,
  Mic,
  Send,
  X,
  Image as ImageIcon
} from 'lucide-react';
import getOriginalFileName from '@/helpers/livechat-utils/getOriginalFileName';
import onChangeSetURL from '@/helpers/livechat-utils/onChangeSetURL';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import { Attachment } from '@/types/livechat/Message';
import { Picker } from 'emoji-mart';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2ChatEditor({
  editorHeight,
  setEditorHeight
}: {
  editorHeight: number;
  setEditorHeight: React.Dispatch<React.SetStateAction<number>>;
}) {
  const {
    user,
    setChatRefetch,
    selectedMessageToReply,
    setSelectedMessageToReply,
    setPage,
    isGuest,
    setShowGuestLogin,
    actAsIpChat
  } = useMainApp();
  const theme2EditorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessageRef = useRef<HTMLButtonElement>(null);
  const [inputtedText, setInputtedText] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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
    const text = theme2EditorRef?.current?.innerText;
    setInputtedText(text?.trim() || '');
    if (theme2EditorRef?.current?.scrollHeight) {
      const replyHeight = selectedMessageToReply?.id
        ? replyRef?.current?.scrollHeight || 0
        : 0;
      const scrollHeight =
        theme2EditorRef.current?.scrollHeight + 38 + replyHeight;
      const heightPercentage = Math.min(
        (scrollHeight / (window?.innerWidth <= 640 ? 425 : 600)) * 100,
        window?.innerWidth <= 640
          ? selectedMessageToReply?.id
            ? 40.7
            : 27.7
          : selectedMessageToReply?.id
          ? 37.5
          : 25.5
      );
      if (!text?.trim()) {
        setEditorHeight(window?.innerWidth <= 640 ? 16.47 : 18.33);
      } else {
        setEditorHeight(heightPercentage);
      }
      if (theme2EditorRef.current) {
        theme2EditorRef.current.style.setProperty(
          'height',
          !text?.trim()
            ? '50px'
            : theme2EditorRef.current.scrollHeight > 120
            ? '120px'
            : `${theme2EditorRef.current.scrollHeight + 2}px`,
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
        if (theme2EditorRef.current) {
          theme2EditorRef.current.innerText = '';

          theme2EditorRef.current.style.setProperty(
            'height',
            '50px',
            'important'
          );
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setEditorHeight(window?.innerWidth <= 640 ? 16.47 : 13.33);
        setPage(1);
        setChatRefetch((prev) => !prev);
        setSelectedMessageToReply(null);
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleEmojiClick = (emojiData: any) => {
    const text = inputtedText + emojiData?.native;
    setInputtedText(text);
    if (theme2EditorRef?.current) {
      theme2EditorRef.current.innerText = text;
    }
  };

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
    if (theme2EditorRef?.current?.scrollHeight) {
      const scrollHeight =
        theme2EditorRef.current?.scrollHeight + 38 + replyHeight;
      const heightPercentage = Math.min(
        (scrollHeight / (window?.innerWidth <= 640 ? 425 : 525)) * 100,
        window?.innerWidth <= 640
          ? selectedMessageToReply?.id
            ? 40.7
            : 27.7
          : selectedMessageToReply?.id
          ? 100
          : 70
      );

      if (!selectedMessageToReply?.id) {
        setEditorHeight(window?.innerWidth <= 640 ? 16.47 : 30);
      } else {
        setEditorHeight(heightPercentage);
      }

      if (theme2EditorRef.current) {
        theme2EditorRef.current.style.setProperty(
          'height',
          !selectedMessageToReply?.id
            ? theme2EditorRef.current.scrollHeight > 120
              ? '120px'
              : theme2EditorRef.current.scrollHeight < 50
              ? '50px'
              : `${theme2EditorRef.current.scrollHeight + 2}px`
            : theme2EditorRef.current.scrollHeight > 120
            ? '120px'
            : `${theme2EditorRef.current.scrollHeight + 2}px`,
          'important'
        );
      }
    }
  }, [selectedMessageToReply, setEditorHeight]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
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
    <div className='p-4 border-t'>
      <form
        onSubmit={(e) => {
          if (isRecording) {
            e?.preventDefault();
            stopRecording();
          } else {
            handleSendMessage(e);
          }
        }}
        className='flex flex-col gap-2'
      >
        {attachments?.length > 0 && (
          <div className='max-h-[200px] overflow-auto absolute bottom-[65px] left-[-16px] bg-[#f8f9fa] border border-slate-700 rounded-lg m-5 p-2 w-[calc(100%-16px)] scrollbar'>
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
          className={`flex gap-2 ${
            (theme2EditorRef?.current?.scrollHeight &&
              theme2EditorRef?.current?.scrollHeight > 48) ||
            selectedMessageToReply?.id
              ? 'items-end'
              : 'items-center'
          }`}
        >
          <div className='flex-1 relative'>
            {selectedMessageToReply?.id ? (
              <div
                className='relative mb-1 rounded-md border-l-4 border-gray-400 bg-gray-300 p-1 !text-sm'
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
                ref={theme2EditorRef}
                className={`flex-1 p-3 border border-gray-200 outline-none relative whitespace-pre-wrap break-words sm:w-full max-w-[270px] overflow-auto scrollbar focus:border-blue-300 ${
                  theme2EditorRef?.current?.scrollHeight &&
                  theme2EditorRef?.current?.scrollHeight > 48
                    ? 'rounded-xl pr-12'
                    : 'rounded-full pr-14'
                } ${isRecording ? 'opacity-0' : ''}`}
                contentEditable={true}
                onInput={handleInput}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
              />

              {inputtedText?.trim()?.length === 0 && (
                <span className='absolute bottom-3.5 left-3 text-gray-400 pointer-events-none'>
                  Message...
                </span>
              )}

              <canvas
                ref={canvasRef}
                width={270}
                height={50}
                className={
                  isRecording
                    ? 'block rounded-full absolute bottom-0 z-50'
                    : 'hidden'
                }
              />

              {isRecording && (
                <button
                  className='absolute top-0 rounded-l-full left-0 outline-none mx-auto cursor-pointer bg-[#1e293b] px-4 py-[15px] z-[100]'
                  type='button'
                  onClick={() => {
                    wasCancelledRef.current = true;
                    stopRecording();
                  }}
                >
                  <Trash2 className='w-5 h-5 stroke-white rounded-full' />
                </button>
              )}
            </div>
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
              type='button'
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
              className={`absolute right-10 -translate-y-1/2 ${
                (theme2EditorRef?.current?.scrollHeight &&
                  theme2EditorRef?.current?.scrollHeight > 48) ||
                selectedMessageToReply?.id
                  ? 'bottom-1.5'
                  : 'top-1/2'
              }`}
            >
              <Paperclip className='w-5 h-5 stroke-gray-400' />
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
              className={`absolute right-3 -translate-y-1/2 ${
                (theme2EditorRef?.current?.scrollHeight &&
                  theme2EditorRef?.current?.scrollHeight > 48) ||
                selectedMessageToReply?.id
                  ? 'bottom-1.5'
                  : 'top-1/2'
              }`}
            >
              <Smile className='w-5 h-5 stroke-gray-400' />
            </button>
            {showEmojiPicker && (
              <div
                className='absolute bottom-full right-0 left-0 mb-2'
                ref={emojiPickerRef}
              >
                <Picker
                  onEmojiSelect={handleEmojiClick}
                  theme='light'
                  previewPosition='none'
                />
              </div>
            )}
          </div>

          <div
            className={`flex items-center gap-2 ${
              (theme2EditorRef?.current?.scrollHeight &&
                theme2EditorRef?.current?.scrollHeight > 48) ||
              selectedMessageToReply?.id
                ? 'mb-1'
                : ''
            }`}
          >
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
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <Mic
                className={`w-5 h-5 ${
                  isRecording ? 'stroke-red-500' : 'stroke-gray-500'
                }`}
              />
            </button>
            <button
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
              type='submit'
              className='p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors'
            >
              <Send className='w-5 h-5 stroke-white' />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
