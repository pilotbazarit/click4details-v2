import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import { getValidNumber } from '@/helpers/livechat-utils/getValidNumber';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme3Login({
  fromSupport
}: {
  fromSupport?: boolean;
}) {
  const {
    userFormFields,
    websiteTCUrl,
    setUser,
    setActiveTab,
    setShowGuestLogin,
    isGuest,
    setIpMessages,
    setActAsIpChat,
    setIsGuest
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
      }, 4000);
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
        setIpMessages([]);
        setActAsIpChat(false);

        toast.success('Logged in successfully');
        if (!fromSupport) {
          setActiveTab('chat');
        }
        setShowGuestLogin(false);
        setIsGuest(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='p-4'>
      <button
        onClick={() => {
          if (isGuest) {
            setShowGuestLogin(false);
            setActiveTab('chat');
            return;
          }
          setActiveTab('home');
          setShowGuestLogin(false);
        }}
        className='flex items-center text-blue-600 mb-4 hover:text-blue-700 group'
      >
        <ArrowRight
          className='rotate-180 mr-1 stroke-blue-600 group-hover:stroke-blue-700'
          size={16}
        />{' '}
        Back to Menu
      </button>
      <h3 className='text-lg font-bold mb-4'>
        Start Chat {fromSupport && 'First'}
      </h3>
      {errorMessage && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {errorMessage}
        </div>
      )}
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
                    className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                    className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-24 min-h-11 outline-none'
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
                    className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                onChange={(e) => setEmail(e?.target?.value?.toLowerCase())}
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                placeholder='Enter your phone'
              />
            </div>
          </>
        )}

        <div className='flex items-center gap-2'>
          <input
            type='checkbox'
            id='terms'
            checked={isTermsAccepted}
            onChange={(e) => setIsTermsAccepted(e.target.checked)}
            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
          />
          <label htmlFor='terms' className='text-sm text-gray-600'>
            I accept the{' '}
            <a
              href={websiteTCUrl}
              className='text-blue-600 hover:underline cursor-pointer'
            >
              terms and conditions
            </a>
          </label>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-center'
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
