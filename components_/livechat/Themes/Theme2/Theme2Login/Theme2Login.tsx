import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import { getValidNumber } from '@/helpers/livechat-utils/getValidNumber';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme2Login({
  fromSupport
}: {
  fromSupport?: boolean;
}) {
  const {
    setShowGetStarted,
    userFormFields,
    websiteTCUrl,
    setUser,
    setShowChat,
    setShowHomepage,
    isGuest,
    setIsGuest,
    setShowGuestLogin,
    actAsIpChat,
    setIpMessages,
    setActAsIpChat
  } = useMainApp();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userFormFieldData, setUserFormFieldData] = useState<{
    [key: string]: string;
  }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let userName = name;
    let userPhone = phone;
    let userEmail = email;

    if (Array.isArray(userFormFields) && userFormFields?.length > 0) {
      userName = userFormFieldData['name'] || userFormFieldData['Name'];
      userPhone = userFormFieldData['phone'] || userFormFieldData['Phone'];
      userEmail = userFormFieldData['email'] || userFormFieldData['Email'];
      if (userName && userEmail && userPhone) {
        delete userFormFieldData['name'];
        delete userFormFieldData['phone'];
        delete userFormFieldData['email'];
        delete userFormFieldData['Name'];
        delete userFormFieldData['Phone'];
        delete userFormFieldData['Email'];
      }
    }

    if (!userEmail && !userPhone) {
      setErrorMessage('Name or Email is required');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    const { number, isValid, message } = getValidNumber(userPhone);

    if (!isValid) {
      setErrorMessage(message);
      setTimeout(() => {
        setErrorMessage('');
      }, 4000);
      return;
    } else if (number?.length < 10 || number?.length > 15) {
      setErrorMessage('Phone number must be 10-15 digits long');
      setTimeout(() => {
        setErrorMessage('');
      }, 4000);
      return;
    }

    userPhone = number;

    if (!isTermsAccepted) {
      setErrorMessage('Please accept the terms and conditions');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    setIsLoading(true);

    const payload = {
      name: userName,
      email: userEmail,
      phone: userPhone,
      chatId: (window as any)?.chatId,
      userFormFieldData: userFormFields?.length > 0 ? userFormFieldData : null
    };

    try {
      const response = await fetch(`${getApiUrl()}/auth/external-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('ca_token', data?.access_token);
        localStorage.setItem('chat_user', JSON.stringify(data?.user));
        setUser(data?.user);

        toast.success('Logged in successfully');
        if (!fromSupport) {
          setShowChat(true);
        }
        setShowGuestLogin(false);
        setIsGuest(false);
        setActAsIpChat(false);
        setIpMessages([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='h-[calc(100%-150px)] overflow-y-auto scrollbar p-6'>
      <div className='flex items-center gap-2 mb-6'>
        {!fromSupport && (
          <button
            onClick={() => {
              if (isGuest || actAsIpChat) {
                setShowGuestLogin(false);
                return;
              }
              setShowGetStarted(false);
              setShowHomepage(true);
            }}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <ArrowLeft className='w-5 h-5 text-gray-600' />
          </button>
        )}
        <h2 className='text-xl font-bold'>
          Start a conversation {fromSupport && 'first'}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {Array.isArray(userFormFields) && userFormFields?.length > 0 ? (
          <>
            {userFormFields?.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className='block text-sm font-bold text-gray-700 mb-1'
                >
                  {field?.label}{' '}
                  {field?.required && <span className='text-red-600'>*</span>}
                </label>
                {field?.type === 'input' && (
                  <input
                    type='text'
                    id={field?.id}
                    name={field?.id}
                    value={userFormFieldData[field?.label]}
                    onChange={(e) =>
                      setUserFormFieldData({
                        ...userFormFieldData,
                        [field?.label]:
                          field?.label?.toLowerCase() === 'email'
                            ? e?.target?.value?.toLowerCase()
                            : field?.label?.toLowerCase() === 'phone'
                            ? e?.target?.value?.replace(/\D/g, '')
                            : e?.target?.value
                      })
                    }
                    className='w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300'
                    placeholder={field?.label}
                    required={field?.required}
                  />
                )}
                {field?.type === 'textarea' && (
                  <textarea
                    id={field?.id}
                    name={field?.id}
                    value={userFormFieldData[field?.label]}
                    onChange={(e) =>
                      setUserFormFieldData({
                        ...userFormFieldData,
                        [field?.label]: e.target.value
                      })
                    }
                    className='w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 max-h-24 min-h-11'
                    placeholder={field?.label}
                    required={field?.required}
                  />
                )}
                {field?.type === 'select' && (
                  <select
                    id={field?.id}
                    name={field?.id}
                    value={userFormFieldData[field?.label]}
                    onChange={(e) =>
                      setUserFormFieldData({
                        ...userFormFieldData,
                        [field?.label]: e.target.value
                      })
                    }
                    className='w-full px-2.5 py-2 border border-gray-400 bg-white rounded-lg outline-none'
                    required={field?.required}
                  >
                    <option value=''>Select {field?.label}</option>
                    {field?.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-bold text-gray-700 mb-1'
              >
                Name
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300'
                placeholder='Enter your name'
                required
              />
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-bold text-gray-700 mb-1'
              >
                Email
              </label>

              <input
                type='email'
                id='email'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300'
                placeholder='Enter your email'
              />
            </div>

            <div>
              <label
                htmlFor='phone'
                className='block text-sm font-bold text-gray-700 mb-1'
              >
                Phone
              </label>
              <input
                type='tel'
                name='phone'
                value={phone}
                onChange={(e) => {
                  const value = e?.target?.value?.replace(/\D/g, '');
                  setPhone(value);
                }}
                className='w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300'
                placeholder='Enter your phone'
              />
            </div>
          </>
        )}

        <span className='flex items-center gap-1'>
          <input
            type='checkbox'
            className='w-3.5 h-3.5'
            checked={isTermsAccepted}
            onChange={(e) => setIsTermsAccepted(e.target.checked)}
          />
          I accept the
          <a
            href={websiteTCUrl}
            className='text-blue-600 hover:underline cursor-pointer'
          >
            Terms and Conditions
          </a>
        </span>

        {errorMessage && (
          <p className='text-red-600 text-center'>{errorMessage}</p>
        )}

        <button
          type='submit'
          className='w-full flex items-center justify-center p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors'
        >
          {fromSupport ? 'Submit' : 'Start Chat'}
          {isLoading && (
            <Loader2 className='w-4 h-4 ml-2 animate-spin stroke-white' />
          )}
        </button>
      </form>
    </div>
  );
}
