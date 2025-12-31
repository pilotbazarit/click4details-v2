import { useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '@/helpers/livechat-utils/getApiUrl';
import { Loader2 } from 'lucide-react';
import { getValidNumber } from '@/helpers/livechat-utils/getValidNumber';
import { useMainApp } from '@/context/livechat/mainAppContext';

export default function Theme1Login() {
  const {
    websiteTCUrl,
    setUser,
    userFormFields,
    setIsGuest,
    setShowGuestLogin,
    setActAsIpChat,
    setIpMessages
  } = useMainApp();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(true);
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
        setShowGuestLogin(false);
        setIsGuest(false);
        setActAsIpChat(false);
        setIpMessages([]);
        toast.success('Logged in successfully');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className='px-6 mt-3 flex flex-col pb-4' onSubmit={handleSubmit}>
      <div className='text-center py-3'>
        <p>Hello there Ã°Å¸â€˜â€¹</p>
        <span className='text-sm'>
          Please let us know who you are to start the conversation.
        </span>
      </div>

      <div
        className={`flex flex-col gap-3 mb-3 max-h-[240px] overflow-y-auto scrollbar ${
          userFormFields?.length > 0 ? '-mr-6 pr-6' : ''
        }`}
      >
        {Array.isArray(userFormFields) && userFormFields?.length > 0 ? (
          <>
            {userFormFields?.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className='block mb-1 font-bold'>
                  {field.label}{' '}
                  {field?.required && <span className='text-red-600'>*</span>}
                </label>
                {field.type === 'input' && (
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
                    className='w-full px-2.5 py-2 border border-gray-400 rounded outline-none'
                    placeholder={field?.label}
                    required={field?.required}
                  />
                )}
                {field.type === 'textarea' && (
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
                    className='w-full px-2.5 py-2 border border-gray-400 rounded outline-none max-h-24 min-h-11'
                    placeholder={field?.label}
                    required={field?.required}
                  />
                )}
                {field.type === 'select' && (
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
                    className='w-full px-2.5 py-2 border border-gray-400 bg-white rounded outline-none'
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
              <label htmlFor='name' className='block mb-1 font-bold'>
                Name
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-2.5 py-2 border border-gray-400 rounded outline-none'
                placeholder='Enter your name'
                required
              />
            </div>

            <div>
              <label htmlFor='email' className='block mb-1 font-bold'>
                Email
              </label>

              <input
                type='email'
                id='email'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-2.5 py-2 border border-gray-400 rounded outline-none'
                placeholder='Enter your email'
              />
            </div>

            <div>
              <label htmlFor='phone' className='block mb-1 font-bold'>
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
                className='w-full px-2.5 py-2 border border-gray-400 rounded outline-none'
                placeholder='Enter your phone'
              />
            </div>
          </>
        )}
      </div>

      <span className='flex items-center gap-1'>
        <input
          type='checkbox'
          className='w-3.5 h-3.5'
          checked={isTermsAccepted}
          onChange={(e) => setIsTermsAccepted(e.target.checked)}
        />
        I accept the
        <a href={websiteTCUrl} className='text-blue-600 hover:underline'>
          Terms and Conditions
        </a>
      </span>

      {errorMessage && (
        <p className='text-red-600 text-center'>{errorMessage}</p>
      )}

      <button
        type='submit'
        className='flex items-center justify-center w-full px-6 py-2 rounded border-none bg-blue-600 hover:opacity-90 text-white mt-3 cursor-pointer font-bold'
      >
        Get Started{' '}
        {isLoading && (
          <Loader2 className='w-4 h-4 ml-2 animate-spin stroke-white' />
        )}
      </button>
    </form>
  );
}
