import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Info, Send } from 'lucide-react';
import SelectInput from '../SelectInput';
import toast from "react-hot-toast";
import MasterDataService from '@/services/MasterDataService';
import constData from "@/lib/constant";
import PresetQuestionService from '@/services/PresetQuestionService';
import ConversationService from '@/services/ConversationService';
import { set } from 'lodash';
import Link from 'next/link';

const presetQuestionsOld = [
  { value: 'Is this available?', label: 'Is this available?' },
  { value: 'What is the price?', label: 'What is the price?' },
  { value: 'Can you deliver to my location?', label: 'Can you deliver to my location?' }
];

const presetAnswersOld = [
  { value: 'Yes, it is available.', label: 'Yes, it is available.' },
  { value: 'The price is on the product page.', label: 'The price is on the product page.' },
  { value: 'Please provide your address for delivery details.', label: 'Please provide your address for delivery details.' }
];

const staticAnswerOptions = [
  { value: 'Yes, it is available.', label: 'Yes, it is available.' },
  { value: 'Price is fixed.', label: 'Price is fixed.' },
  { value: 'Please share your location.', label: 'Please share your location.' },
  { value: 'Home delivery is available.', label: 'Home delivery is available.' },
  { value: 'Please call for details.', label: 'Please call for details.' },
];

// Generate price array from 500 to 100000 with increment of 500
const generatePriceOptionsOld = () => {
  const prices = [];
  for (let i = 500; i <= 100000; i += 500) {
    prices.push({ value: i, label: `${i.toFixed(2)}` });
  }
  return prices;
};

const priceOptionsOld = generatePriceOptionsOld();

const formatIndianNumber = (value) => {
  const digits = String(value).replace(/\D+/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('en-IN').format(Number(digits));
};

const buildPriceOptions = (baseValue) => {
  if (baseValue === null || baseValue === undefined) {
    return [];
  }

  const normalized = String(baseValue).trim();
  if (normalized.length === 0 || normalized.startsWith('0') || !/^\d+$/.test(normalized)) {
    return [];
  }

  return Array.from({ length: 5 }, (_, i) => {
    const value = `${normalized}${'0'.repeat(i)}`;
    return { value, label: formatIndianNumber(value) };
  });
};

// const categories = [
//     { value: 'electronics', label: 'Electronics' },
//     { value: 'fashion', label: 'Fashion' },
//     { value: 'home', label: 'Home' },
// ];

const initialMessagesOld = [
  { id: 1, text: 'Assala-mualikum', time: '2:47 pm', sender: 'other' },
  { id: 2, text: 'Walaikumus-salam, How can i help you?', time: '2:48 pm', sender: 'me' },
  { id: 3, text: 'okay', time: '3:49 pm', sender: 'other' },
  { id: 4, text: 'great', time: '3:49 pm', sender: 'other' },
];

// product,

const ViewAdminConversationModal = ({ open, setOpen, productInfo, conversationId: initialConversationId = 0, selectedConversation = '' }) => {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showSubCategory, setShowSubCategory] = useState(false);
  const [presetQuestions, setPresetQuestions] = useState([]);
  const [presetAnswers, setPresetAnswers] = useState([]);
  const answerSelectRef = useRef(null);
  // const [presetQuestionsList, setPresetQuestionsList] = useState([]);
  const [user, setUser] = useState(null);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [loading, setLoading] = useState(false);
  const [priceOptions, setPriceOptions] = useState([]);
  const [product, setProduct] = useState(productInfo);


  // console.log("selectedQuestion", selectedQuestion);
  // console.log("selectedAnswer", selectedAnswer);
  // console.log("selectedPrice", selectedPrice);


  console.log("product selectedConversation---------------", selectedConversation);



  const getPresetCategories = async () => {
    try {
      setCategories([]);
      const preset_category_code = constData.PRESET_CATEGORY_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(preset_category_code);

      const presetCategoryMasterData = response.data?.master_data;
      const presetCategoryData = presetCategoryMasterData.map((brand) => ({
        value: brand.md_id,
        label: brand.md_title,
        _page: 1,
        _perPage: 1000,
      }));
      setCategories(presetCategoryData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const [fromConversation, setFromConversation] = useState(null);
  const [toConversation, setToConversation] = useState(null);

  const getSingleConversation = async () => {
    try {
      setLoading(true);
      // Assuming product.v_id is the conversation ID for simplicity
      const params = {
        _page: 1,
        _perPage: 1000,
      }
      const response = await ConversationService.Queries.getSingleConversation(conversationId);
      const conversationData = response?.data;

      const incomingEntity = conversationData?.entity || null;
      const incomingId = incomingEntity?.v_id;
      const currentId = product?.v_id;
      const sameProduct = incomingId && currentId && String(incomingId) === String(currentId);

      if (!product || !sameProduct) {
        setProduct(incomingEntity);
      }

      setFromConversation(conversationData?.from_user || null);
      setToConversation(conversationData?.to_user || null);


      // console.log("conversationData--------", conversationData.items);

      // Transform conversation data to messages format
      const formattedMessages = conversationData?.items?.map((msg, index) => ({
        // id: index + 1,
        id: msg.ci_id,
        text: msg.ci_message,
        time: new Date(msg.ci_created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        sender: Number(msg.ci_sender_id) === Number(user.id) ? 'me' : 'other', // Assuming 1 is the current user ID
        preset: msg.preset || '',
      })) || [];

      setMessages(formattedMessages);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to fetch conversation")
    }
  }


  useEffect(() => {
    if (!open || !user || conversationId === 0) return;

    getSingleConversation();

    // const intervalId = setInterval(() => {
    //     getSingleConversation();
    // }, 5000);

    // return () => clearInterval(intervalId);
  }, [open, user, conversationId]);

  useEffect(() => {
    if (!open) return;
    setConversationId(initialConversationId || 0);
  }, [open, initialConversationId]);


  const unreadConversations = async () => {
    try {
      if (conversationId === 0) return;
      const response = await ConversationService.Commands.unreadAllConversations(conversationId);

      // console.log("response", response);

      if (response.status !== "success") {
        console.log("mark as read failed");
        // throw new Error('Something went wrong');
      }

      // console.log("mark as read response", response);
    } catch (error) {
      console.log("error", error);
    }
  }



  useEffect(() => {
    if (conversationId === 0) return;
    unreadConversations();
  }, [conversationId]);




  useEffect(() => {
    if (open) {
      getPresetCategories();

      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);
      setUser(user);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const baseValue = selectedPrice?.value ?? selectedPrice;
    setPriceOptions(buildPriceOptions(baseValue));
  }, [selectedPrice]);

  const handleQuestionSelect = (selectedOption) => {
    if (selectedOption) {
      setChatMessage(selectedOption.label);
      handleSendMessage(selectedOption.label, selectedOption.value);
    }

    setSelectedQuestion(selectedOption);
    setSelectedAnswer(null);
    setSelectedPrice(null);
  };

  const handleAnswerSelect = (selectedOption) => {
    if (selectedOption) {
      setChatMessage(selectedOption.label);
      handleSendMessage(selectedOption.label, selectedOption.value);
    }
    setSelectedAnswer(selectedOption);
    setSelectedQuestion(null);
    setSelectedPrice(null);
  };

  const handlePriceSelect = (selectedOption) => {
    if (selectedOption) {
      setChatMessage(selectedOption.label);
      handleSendMessage(selectedOption.label, 0);
    }
    setSelectedPrice(selectedOption);

    setSelectedQuestion(null);
    setSelectedAnswer(null);
  };

  const handlePriceInputChange = (inputValue, actionMeta) => {
    if (actionMeta?.action !== 'input-change') return inputValue;
    const normalized = String(inputValue).replace(/\D+/g, '').slice(0, 5);
    setPriceOptions(buildPriceOptions(normalized));
    return normalized;
  };


  const getPresetQuestionAnswer = async (catId) => {
    try {
      setSelectedQuestion(null);
      setSelectedAnswer(null);
      setSelectedPrice(null);

      setLoading(true);
      const response = await PresetQuestionService.Queries.getPresetQuestionAnswerList({
        _page: 1,
        _perPage: 1000,
        _cat_id: catId,
      });

      if (response?.data?.data?.length > 0) {
        const questions = response.data.data
          .filter(item => item.pqa_type === 'q')
          .map((item) => ({
            value: item.pqa_id,
            label: item.pqa_title,
          }));
        setPresetQuestions(questions);

        const answers = response.data.data
          .filter(item => item.pqa_type === 'a')
          .map((item) => ({
            value: item.pqa_id,
            label: item.pqa_title,
          }));
        setPresetAnswers(answers);
      } else {
        setPresetQuestions([]);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to fetch data types");
    }
  }




  const handleCategorySelect = (selectedOption) => {
    setSelectedCategory(selectedOption);
    if (selectedOption) {
      getPresetQuestionAnswer(selectedOption.value);
    } else {
      setPresetQuestions([]);
    }
  };

  const saveMessageToDatabase = async (messageText, presetIdOverride = null) => {
    try {
      const presetId = presetIdOverride !== null
        ? presetIdOverride
        : selectedPrice
          ? 0
          : selectedAnswer
            ? selectedAnswer.value
            : selectedQuestion
              ? selectedQuestion.value
              : 0;
      const response = await ConversationService.Commands.addConversation({
        conv_entity_id: product?.v_id,
        conv_entity_type: 'vehicle',
        conv_from_id: user?.id,
        conv_to_id: product?.v_user_id,
        ci_message: messageText,
        ci_type: 'text',
        conv_id: conversationId,
        ci_preset_id: presetId
      });

      if (response.status !== "success") {
        console.log("message not sent");
        throw new Error('Something went wrong');
      }

      setConversationId(response.data.conv_id);

      return response.data;

    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
      throw error;
    }
  }

  const handleSendMessage = async (overrideMessage, presetIdOverride = null) => {
    const messageText = (overrideMessage ?? chatMessage).trim();
    if (messageText === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: messageText,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      sender: 'me',
      preset: ''
    };

    try {
      setLoading(true);
      await saveMessageToDatabase(messageText, presetIdOverride);

      setMessages([...messages, newMessage]);
      setChatMessage('');
      setSelectedQuestion(null);
      setSelectedAnswer(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setSelectedAnswer(null);
      setSelectedQuestion(null);
      setSelectedPrice(null);
      setChatMessage('');

    }
  };

  const handleOpenChange = (open) => {
    setMessages([]);
    setSelectedAnswer(null);
    setSelectedQuestion(null);
    setSelectedPrice(null);
    setChatMessage('');
    setCategories([]);
    setSelectedCategory(null);
    setPresetQuestions([]);
    setPresetAnswers([]);
    setConversationId(0);
    setOpen(open);
  }



  const handleAnswerClick = async (msg) => {
    getPresetQuestionAnswer(msg?.preset?.pqa_cat_id);

    setSelectedAnswer(null);
    setTimeout(() => {
      answerSelectRef.current?.focus();
    }, 0);
  }

  const handleAcceptClick = (msg) => {
    // console.log("msg", msg);
    handleSendMessage('I accept the offer.');
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-11/12 max-w-xl h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden">
        <DialogHeader className="border-b border-gray-200 bg-white px-5 py-4">

          <div className="flex items-start gap-3">
            <button type="button" className="mt-1 rounded-full p-1 text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <span>
                    {'Chat With Importer'}
                  </span>
                  <Link
                    target='_blank'
                    href={`/product/${product?.v_id}`}
                    title="Product Details"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Info
                      className="h-6 w-6"
                      title="Show Product Details"
                    />
                  </Link>
                </div>
              </DialogTitle>
              <p className="text-xs text-gray-500">
                {product?.v_title?.slice(0, 60)}
              </p>
            </div>


          </div>

        </DialogHeader>

        <div className="relative flex-1 bg-[#f7f7f7] px-5 py-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length > 0 && messages.map((msg, index) => {
              const isNumericText = (() => {
                if (typeof msg.text === 'number') return true;
                if (typeof msg.text !== 'string') return false;
                const numeric = msg.text.replace(/,/g, '').trim();
                return numeric !== '' && !Number.isNaN(Number(numeric));
              })();

              return (
                <div key={index} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'items-end gap-2'}`}>

                  {msg.sender === 'me' ? (
                    <div className="max-w-[75%] rounded-2xl rounded-br-none bg-[#b7dcb1] px-4 py-3 text-sm text-gray-900 shadow">
                      {msg.text}
                      <div className="mt-1 text-xs text-gray-600">{msg.time}</div>
                      {/* <div className="mt-1 text-xs ">
                        <span className='font-400'>{toConversation?.name}</span><br />
                        <span className='text-gray-600'>{toConversation?.email}</span>
                      </div> */}
                    </div>
                  ) : (
                    <>
                      <div className="max-w-[70%] rounded-2xl rounded-bl-none bg-white px-4 py-3 text-sm text-gray-900 shadow">
                        {
                          msg.text
                        }
                        <div className="mt-1 text-xs text-gray-400">{msg.time}</div>
                        {/* <div className="mt-1 text-xs ">
                          <span className='font-400'>{fromConversation?.name}</span><br />
                          <span className='text-gray-400'>{fromConversation?.email}</span>
                        </div> */}
                      </div>
                      {
                        msg.preset && (
                          <div>
                            <button
                              onClick={() => handleAnswerClick(msg)}
                              type="button"
                              className="rounded-full bg-gray-200 px-4 py-1 text-xs font-medium text-gray-700"
                            >
                              Answer
                            </button>

                            {isNumericText && (
                              <button
                                onClick={() => handleAcceptClick(msg)}
                                type="button"
                                className="rounded-full bg-gray-200 px-4 py-1 text-xs font-medium text-gray-700"
                              >
                                Accept
                              </button>
                            )}
                          </div>
                        )
                      }

                    </>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* <div className="border-t border-gray-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <SelectInput
              options={categories}
              value={selectedCategory}
              onChange={handleCategorySelect}
              placeholder="Select a Category"
              isClearable
              menuPlacement="top"
            />
          </div>

          <div className="flex items-center gap-3">
            <SelectInput
              options={presetQuestions}
              value={selectedQuestion}
              onChange={handleQuestionSelect}
              placeholder="Questions"
              isClearable
              menuPlacement="top"
            />

            <SelectInput
              options={presetAnswers}
              value={selectedAnswer}
              onChange={handleAnswerSelect}
              placeholder="Answers"
              isClearable
              menuPlacement="top"
              isSearchable
              closeMenuOnSelect
              openMenuOnFocus
              selectRef={answerSelectRef}
            />



            <SelectInput
              options={priceOptions}
              value={selectedPrice}
              onChange={handlePriceSelect}
              onInputChange={handlePriceInputChange}
              placeholder="Select Price"
              isClearable
              menuPlacement="top"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="message..."
              className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm focus:outline-none"
              value={chatMessage}
              readOnly
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2196f3] text-white shadow-md"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div> */}
      </DialogContent>
    </Dialog>
  );
};

export default ViewAdminConversationModal;
