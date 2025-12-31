'use client'
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { addressDummyData } from "@/assets/assets";
import { formatPrice } from "@/helpers/functions";
import MasterDataService from "@/services/MasterDataService";
import constData from "@/lib/constant";
import CartService from "@/services/CartService";
import _ from "lodash";
import Select from "react-select";
import { toast } from "react-toastify";
import OrderService from "@/services/OrderService";
import LoginService from "@/services/LoginService";

const Checkout = () => {
  const { currency, router, getCartCount, getCartAmount, cartItems, user, setCartItems } = useAppContext();
  // const [cartId, setLocalCartId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddNewAddressOpen, setIsAddNewAddressOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [thanaData, setThanaData] = useState([]);
  const [selectedThana, setSelectedThana] = useState(null);
  const [areaData, setAreaData] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    country: '',
    district: '',
    upazila: '',
    area: '',
    address_line: '',
    landmark: '',
    postal_code: '',
    post_office: '',
    is_default: false
  });

  // Guest user registration data
  const [guestFormData, setGuestFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: ''
  });


  let parsedUser = null;
  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
  }

  // Sync context cartId with local state whenever it changes
  // useEffect(() => {
  //   if (contextCartId) {
  //     setLocalCartId(contextCartId);
  //     console.log("cartId updated:", contextCartId);
  //   }
  // }, [contextCartId]);


  // console.log("localCartId", cartId);


  // console.log("parsedUser", parsedUser);

  // const fetchUserAddresses = async () => {
  //   // setUserAddresses(addressDummyData);
  // };

  // Handle input change for guest registration form
  const handleGuestInputChange = (e) => {
    const { name, value } = e.target;
    setGuestFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input change for address form
  const handleAddressInputChange = (e) => {
    const { id, value } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle address form submit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    // Format data for API call
    const formattedAddressData = {
      name: addressFormData.name,
      phone: addressFormData.phone,
      country: addressFormData.country,
      district_id: selectedDistrict?.value || null,
      district_name: selectedDistrict?.label || '',
      upazila_id: selectedThana?.value || null,
      upazila_name: selectedThana?.label || '',
      area_id: selectedArea?.value || null,
      area_name: selectedArea?.label || '',
      address_line: addressFormData.address_line,
      landmark: addressFormData.landmark,
      postal_code: addressFormData.postal_code,
      post_office: addressFormData.post_office
    };

    // console.log('Formatted Address Data for API:', formattedAddressData);

    try {
      let formData = {
        a_user_id: parsedUser?.id || 0,
        a_name: formattedAddressData?.name || '',
        a_phone: formattedAddressData.phone || '',
        a_country_id: Number(formattedAddressData.country) || '',
        a_district_id: formattedAddressData.district_id,
        a_thana_id: formattedAddressData.upazila_id,
        a_area_id: formattedAddressData.area_id,
        a_address_line: formattedAddressData.address_line,
        a_landmark: formattedAddressData.landmark,
        a_postal_code: formattedAddressData.postal_code,
        a_postoffice: formattedAddressData.post_office,
        a_is_default: addressFormData.is_default ? 1 : 0
      }

      const response = await CartService.Commands.saveAddress(formData);

      if (response.status === 'success') {
        toast.success('Address saved successfully');
        setIsAddNewAddressOpen(false);
        setIsAddressModalOpen(true);
        fetchUserAddresses(); // Refresh address list
      }


      // TODO: Replace with your actual API endpoint
      // const response = await CartService.Mutations.saveAddress(formattedAddressData);
      // if (response.status === 'success') {
      //   toast.success('Address saved successfully');
      //   setIsAddNewAddressOpen(false);
      //   setIsAddressModalOpen(true);
      //   fetchUserAddresses(); // Refresh address list
      // }

      // For now, just close the modal
      // setIsAddNewAddressOpen(false);
      // setIsAddressModalOpen(true);
    } catch (error) {
      console.error('Error saving address:', error);
      // toast.error(error.message || 'Failed to save address');
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
    setIsAddressModalOpen(false);
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Check if cart is empty
    if (getCartCount() === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // === FOR GUEST USER (Not logged in) ===
    if (!user) {
      // Validate guest registration form
      if (!guestFormData.name || !guestFormData.phone || !guestFormData.email) {
        toast.error('Please fill in all registration fields');
        return;
      }

      // Validate password
      if (guestFormData.password && guestFormData.password !== guestFormData.password_confirmation) {
        toast.error('Passwords do not match');
        return;
      }

      // Validate guest address
      if (!addressFormData.name || !addressFormData.phone || !addressFormData.address_line) {
        toast.error('Please fill in delivery address details');
        return;
      }

      if (!selectedDistrict || !selectedThana) {
        toast.error('Please select district and upazila');
        return;
      }
    }
    // === FOR LOGGED-IN USER ===
    else {
      // Validate address selection for logged-in users
      if (!selectedAddress) {
        toast.error('Please select a delivery address');
        return;
      }
    }

    // Set loading state
    setIsPlacingOrder(true);

    try {
      let userId = parsedUser?.id;
      let shippingAddressId = selectedAddress?.a_id || 0;
      let token = '';

      // === GUEST USER CHECKOUT FLOW ===
      if (!user) {
        // Step 1: Register the guest user
        try {
          // Create FormData for registration
          const registerFormData = new FormData();
          registerFormData.append('name', guestFormData.name);
          registerFormData.append('phone', guestFormData.phone);
          registerFormData.append('email', guestFormData.email);

          // If password is provided, use it. Otherwise, generate a random password
          const password = guestFormData.password || Math.random().toString(36).slice(-8);
          registerFormData.append('password', password);
          registerFormData.append('password_confirmation', guestFormData.password_confirmation || password);

          const registerResponse = await LoginService.Commands.registration(registerFormData);

          console.log('Registration response::', registerResponse);

          // Check if registration was successful
          if (registerResponse.status === 'success') {
            userId = registerResponse.data?.id;
            token = registerResponse.token;
            console.log('New user ID:', userId);
          } else {
            // If registration fails, stop the checkout process
            const errorMessage = registerResponse.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
            setIsPlacingOrder(false);
            return;
          }
        } catch (registerError) {
          console.error('Registration error:', registerError);
          const errorMessage = registerError.response?.data?.message
            || registerError.message
            || 'Failed to register. Please try again.';
          toast.error(errorMessage);
          setIsPlacingOrder(false);
          return;
        }


        console.log('Registration response user Id::', userId);


        // Step 2: Save guest address
        try {
          const guestAddressData = {
            a_user_id: userId,
            a_name: addressFormData.name,
            a_phone: addressFormData.phone,
            a_country_id: Number(addressFormData.country) || 0,
            a_district_id: selectedDistrict?.value || 0,
            a_thana_id: selectedThana?.value || 0,
            a_area_id: selectedArea?.value || 0,
            a_address_line: addressFormData.address_line,
            a_landmark: addressFormData.landmark || '',
            a_postal_code: addressFormData.postal_code || '',
            a_postoffice: addressFormData.post_office || '',
            a_is_default: 1
          };

          const addressResponse = await CartService.Commands.saveAddress(guestAddressData);

          if (addressResponse.status === 'success') {
            shippingAddressId = addressResponse.data?.address_id || addressResponse.data?.a_id || 0;
            console.log('Guest address saved, ID:', shippingAddressId);
          } else {
            // If address save fails, stop the checkout process
            const errorMessage = addressResponse.message || 'Failed to save delivery address.';
            toast.error(errorMessage);
            setIsPlacingOrder(false);
            return;
          }
        } catch (addressError) {
          console.error('Error saving guest address:', addressError);
          const errorMessage = addressError.response?.data?.message
            || addressError.message
            || 'Failed to save delivery address. Please try again.';
          toast.error(errorMessage);
          setIsPlacingOrder(false);
          return;
        }
      }

      // === COMMON ORDER CREATION FOR BOTH GUEST AND LOGGED-IN USER ===
      const orderData = {
        o_user_id: userId,
        // o_customer_name: !user ? guestFormData.name : (parsedUser?.name || ''),
        // o_customer_phone: !user ? guestFormData.phone : (parsedUser?.phone || ''),
        // o_customer_email: !user ? guestFormData.email : (parsedUser?.email || ''),
        o_total_amount: getCartAmount(),
        o_discount_amount: 0,
        o_vat_amount: 0,
        o_paid_amount: 0,
        o_due_amount: getCartAmount(),
        o_payment_method: paymentMethod === 'cod' ? 'cash_on_delivery' : paymentMethod,
        o_payment_status: 'unpaid',
        o_shipping_addr_id: shippingAddressId,
        o_billing_address: '',
      };

      // Add cart items to order data
      Object.keys(cartItems).forEach((itemId, key) => {
        const item = cartItems[itemId];
        orderData[`oi_product_id[${key}]`] = item.ci_product_id;
        orderData[`oi_type_id[${key}]`] = item.ci_type_id;
        orderData[`oi_quantity[${key}]`] = item.ci_qty;
        orderData[`oi_unit_price[${key}]`] = item.ci_price;
        orderData[`oi_discount_price[${key}]`] = 0;
        orderData[`oi_total_price[${key}]`] = item.ci_qty * item.ci_price;
      });


      // return

      console.log("orderData:::", orderData);

      // Create order
      // Pass token for guest users who just registered
      const response = await OrderService.Commands.createOrder(orderData, token);

      console.log("response order::::", response);

      if (response.status === 'success') {
        // Success - show message
        toast.success('Order placed successfully!');

        // Clear cart after successful order
        try {
          const res = await CartService.Commands.clearCart(cartItems[0].cart_id);
          console.log("clear cart response", res);
          setCartItems([]);
        } catch (clearError) {
          console.error('Error clearing cart:', clearError);
          // Don't block the flow if cart clear fails
        }

        // Update cart count in context
        getCartCount();

        // Navigate to order confirmation with order ID
        const orderId = response.data?.order_id || response.data?.o_id;
        if (orderId) {
          router.push(`/order-confirmation?order_id=${orderId}`);
        } else {
          router.push('/order-confirmation');
        }
      } else {
        // API returned error status
        const errorMessage = response.message || 'Failed to place order. Please try again.';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error placing order:', error);

      // Show user-friendly error message
      const errorMessage = error.response?.data?.message
        || error.message
        || 'Failed to place order. Please check your connection and try again.';

      toast.error(errorMessage);
    } finally {
      // Reset loading state
      setIsPlacingOrder(false);
    }
  };


  const getCountryData = async () => {
    try {
      const country_code = constData.COUNTRY_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(country_code);
      const countryMasterData = response.data?.master_data;
      const countryData = countryMasterData.map((country) => ({
        value: country.md_id,
        label: country.md_title,
      }));
      setCountryData(countryData);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  }

  // console.log("country data::", countryData);
  const getDistrictData = async () => {
    try {
      const params = {
        _parent_id: 0,
        _entity: 'district',
        _page: 1,
        _perPage: 1000
      };

      const response = await CartService.Queries.getDistrictList(params);
      if (response.status == 'success') {
        // console.log("Response::::", response);
        const districtMasterData = response.data?.data;
        // Format data for react-select
        const formattedDistricts = districtMasterData.map((district) => ({
          value: district.id,
          label: district.name,
        }));
        setDistrictData(formattedDistricts);
      }


    } catch (error) {
      console.log(error.message || "Something went wrong");
      // toast.error(error.message || "Something went wrong");
    }
  }


  // console.log("districtData:::", districtData);

  const getThanaData = async (districtId) => {
    try {
      const params = {
        _parent_id: districtId,
        _entity: 'upazila',
        _page: 1,
        _perPage: 1000
      };
      const response = await CartService.Queries.getDistrictList(params);
      if (response.status == 'success') {
        const thanaMasterData = response.data?.data;
        // Format data for react-select
        const formattedThanas = thanaMasterData.map((thana) => ({
          value: thana.id,
          label: thana.name,
        }));
        setThanaData(formattedThanas);
      }
    } catch (error) {
      // console.log("error", error.message);
      // toast.error(error.message || "Something went wrong");
    }
  }

  const getAreaData = async (thanaId) => {
    try {
      const params = {
        _parent_id: thanaId,
        _entity: 'area',
        _page: 1,
        _perPage: 1000
      };
      const response = await CartService.Queries.getDistrictList(params);
      if (response.status == 'success') {
        const areaMasterData = response.data?.data;
        // Format data for react-select
        const formattedAreas = areaMasterData.map((area) => ({
          value: area.id,
          label: area.name,
        }));
        setAreaData(formattedAreas);
      }
    } catch (error) {
      // console.log("error", error.message);
      // toast.error(error.message || "Something went wrong");
    }
  }

  // console.log("user....................", user);


  const fetchUserAddresses = async () => {
    try {
      const params = {
        _page: 1,
        _perPage: 1000,
        _user_id: parsedUser?.id
      };

      const response = await CartService.Queries.getUserAddresses(params);



      if (response.status === 'success') {
        setUserAddresses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user addresses:', error);
    }
  };



  //  console.log("response userAddresses-----------------------", userAddresses);

  // Get default address
  const defaultAddress = userAddresses.find(address => address.a_is_default == 1);

  // Set default address as selected address when addresses are loaded
  useEffect(() => {
    if (defaultAddress && !selectedAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress]);




  useEffect(() => {
    fetchUserAddresses();
    getCountryData();
    getDistrictData();

    // Redirect to cart if no items
    if (getCartCount() === 0) {
      router.push('/cart');
    }
  }, []);

  // Load thana data when district is selected
  useEffect(() => {
    if (selectedDistrict?.value) {
      setSelectedThana(null); // Clear previous thana selection
      getThanaData(selectedDistrict.value);
    } else {
      setThanaData([]);
      setSelectedThana(null);
    }
  }, [selectedDistrict]);

  // Load area data when thana is selected
  useEffect(() => {
    if (selectedThana?.value) {
      setSelectedArea(null); // Clear previous area selection
      getAreaData(selectedThana.value);
    } else {
      setAreaData([]);
      setSelectedArea(null);
    }
  }, [selectedThana]);

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 mb-20">

        <h1 className="text-2xl md:text-3xl font-medium text-gray-700 mb-8">
          {
            !user ? 'Checkout & Sign Up' : 'Checkout'
          }
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Section - Address & Payment */}
          <div className="flex-1">
            {
              !user && (
                <div className="bg-white border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-medium text-gray-700 mb-4">
                    Sign Up
                  </h2>

                  {/* Registration Form */}
                  <form className="space-y-4">
                    {/* Row 1: Name and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="guest_name"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="guest_name"
                          value={guestFormData.name}
                          onChange={handleGuestInputChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                          placeholder="Your name"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="guest_phone"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          id="guest_phone"
                          value={guestFormData.phone}
                          onChange={handleGuestInputChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                          placeholder="+8801XXXXXXXXX"
                          required
                        />
                      </div>
                    </div>

                    {/* Row 2: Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="guest_email"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="guest_email"
                          value={guestFormData.email}
                          onChange={handleGuestInputChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                          placeholder="name@company.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Row 3: Password (Optional) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="guest_password"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Password <span className="text-gray-500 text-xs">(Optional - for account creation)</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="guest_password"
                          value={guestFormData.password}
                          onChange={handleGuestInputChange}
                          placeholder="••••••••"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="guest_password_confirmation"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="password_confirmation"
                          id="guest_password_confirmation"
                          value={guestFormData.password_confirmation}
                          onChange={handleGuestInputChange}
                          placeholder="••••••••"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                        />
                      </div>
                    </div>

                  </form>
                </div>
              )
            }

            {
              !user && (
                <>
                  <div className="bg-white border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-medium text-gray-700 mb-4">
                      Delivery Address
                    </h2>

                    {/* Add Address Form */}
                    <form className="space-y-4">
                      {/* Row 1: Name and Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            placeholder="John Doe"
                            value={addressFormData.name}
                            onChange={handleAddressInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="phone"
                            placeholder="1234567890"
                            value={addressFormData.phone}
                            onChange={handleAddressInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                            required
                          />
                        </div>
                      </div>

                      {/* Row 2: Country and District */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="country"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            Country
                          </label>
                          <select
                            id="country"
                            value={addressFormData.country}
                            onChange={handleAddressInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-600 text-sm rounded w-full p-2.5"
                            required
                          >
                            <option value="">Select Country</option>
                            {countryData.map((country) => (
                              <option key={country.value} value={country.value}>
                                {country.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="district"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            District <span className="text-red-500">*</span>
                          </label>
                          <Select
                            id="district"
                            value={selectedDistrict}
                            onChange={setSelectedDistrict}
                            options={districtData}
                            placeholder="Select District"
                            isClearable
                            isSearchable
                            className="text-sm"
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '42px',
                                backgroundColor: '#f9fafb',
                                borderColor: '#d1d5db',
                                '&:hover': {
                                  borderColor: '#9ca3af'
                                }
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 9999
                              })
                            }}
                          />
                        </div>
                      </div>

                      {/* Row 3: Thana/Upazila and Area */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="upazila"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            Thana/Upazila <span className="text-red-500">*</span>
                          </label>
                          <Select
                            id="upazila"
                            value={selectedThana}
                            onChange={setSelectedThana}
                            options={thanaData}
                            placeholder="Select Upazila"
                            isClearable
                            isSearchable
                            isDisabled={!selectedDistrict}
                            className="text-sm"
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '42px',
                                backgroundColor: '#f9fafb',
                                borderColor: '#d1d5db',
                                '&:hover': {
                                  borderColor: '#9ca3af'
                                }
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 9999
                              })
                            }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="area"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            Area
                          </label>
                          <Select
                            id="area"
                            value={selectedArea}
                            onChange={setSelectedArea}
                            options={areaData}
                            placeholder="Select Area"
                            isClearable
                            isSearchable
                            isDisabled={!selectedThana}
                            className="text-sm"
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '42px',
                                backgroundColor: '#f9fafb',
                                borderColor: '#d1d5db',
                                '&:hover': {
                                  borderColor: '#9ca3af'
                                }
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 9999
                              })
                            }}
                          />
                        </div>
                      </div>

                      {/* Row 4: Address Line and Landmark */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="address_line"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            Address Line <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="address_line"
                            placeholder="Dhaka"
                            value={addressFormData.address_line}
                            onChange={handleAddressInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="landmark"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            Landmark
                          </label>
                          <input
                            type="text"
                            id="landmark"
                            placeholder="Dhaka 45"
                            value={addressFormData.landmark}
                            onChange={handleAddressInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                          />
                        </div>
                      </div>

                      {/* Row 5: Postal Code and Post Office */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="postal_code"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            Postal Code
                          </label>
                          <input
                            type="text"
                            id="postal_code"
                            placeholder="23"
                            value={addressFormData.postal_code}
                            onChange={handleAddressInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="post_office"
                            className="block mb-2 text-xs font-medium text-gray-500"
                          >
                            Post Office
                          </label>
                          <input
                            type="text"
                            id="post_office"
                            placeholder="Of2"
                            value={addressFormData.post_office}
                            onChange={handleAddressInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                          />
                        </div>
                      </div>

                    </form>
                  </div>
                </>
              )
            }


            {/* Billing and Shipping Address Section */}
            {
              user && (
                <div className="bg-white border border-gray-200 p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    {/* Delivery Address */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-medium text-gray-700">
                          Delivery Address
                        </h2>
                        <button
                          onClick={() => setIsAddressModalOpen(true)}
                          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                          Change
                        </button>
                      </div>

                      {/* Address Display */}
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                        {selectedAddress ? (
                          <>
                            <p className="font-medium text-gray-800">{selectedAddress.a_name}</p>
                            <p className="text-gray-600 text-sm mt-1">{selectedAddress.a_phone}</p>
                            <p className="text-gray-600 text-sm mt-1">{selectedAddress.a_address_line}</p>
                            <p className="text-gray-600 text-sm">{selectedAddress.a_district_name}</p>
                            <p className="text-gray-600 text-sm">{selectedAddress.a_thana_name}</p>
                          </>
                        ) : (
                          <p className="text-gray-600 text-sm">No address selected</p>
                        )}
                      </div>
                    </div>


                  </div>
                </div>
              )
            }


            {
              // console.log("cartItems::::", cartItems)
            }

            {/* Products Section */}
            <div className="bg-white border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                Products
              </h2>

              <div className="space-y-4">
                {Object.keys(cartItems).map((itemId) => {
                  const item = cartItems[itemId];
                  if (!item || item.quantity === 0) return null;

                  return (
                    <div
                      key={itemId}
                      className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item?.ci_url || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 text-sm line-clamp-2">
                          {item.ci_name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {currency}
                          {formatPrice(item.ci_price)} x {item.ci_qty}
                        </p>
                      </div>

                      {/* Product Total Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-gray-800">
                          {currency}
                          {formatPrice(item.ci_price * item.ci_qty)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>

          {/* Right Section - Order Summary */}
          <div className="w-full lg:w-96">

            {/* Payment Method Section */}
            <div className="bg-white border border-gray-200 p-6 mb-2">
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    // defaultChecked
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-700">Cash on Delivery</span>
                </label>

                <label className="flex items-center p-4 border border-gray-300 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-700">Online Payment</span>
                </label>

                <label className="flex items-center p-4 border border-gray-300 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-700">Credit/Debit Card</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-500/5 p-6 border border-gray-200 sticky top-20">
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                Order Summary
              </h2>

              <hr className="border-gray-500/30 mb-4" />

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-base">
                  <p className="text-gray-600">Items ({getCartCount()})</p>
                  <p className="text-gray-800 font-medium">
                    {currency}
                    {formatPrice(getCartAmount())}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Shipping Fee</p>
                  <p className="font-medium text-gray-800">Free</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Tax (0%)</p>
                  <p className="font-medium text-gray-800">
                    {currency}
                    {Math.floor(getCartAmount() * 0.0)}
                  </p>
                </div>
              </div>

              <hr className="border-gray-500/30 mb-4" />

              <div className="flex justify-between text-lg md:text-xl font-medium mb-6">
                <p className="text-gray-700">Total</p>
                <p className="text-gray-900">
                  {currency}
                  {formatPrice(getCartAmount() + Math.floor(getCartAmount() * 0.0))}
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className={`w-full bg-blue-600 text-white py-3 hover:bg-orange-700 transition ${isPlacingOrder ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isPlacingOrder ? 'Placing Order...' : 'Confirm Order'}
              </button>

              <button
                onClick={() => router.push('/cart')}
                className="w-full border border-gray-300 text-gray-700 py-3 mt-3 hover:bg-gray-50 transition"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Address Change Modal */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Select Address
                  </h2>
                  <button
                    onClick={() => setIsAddressModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Address List */}
                <div className="space-y-3 mb-6">
                  {/* Address 1 */}
                  {
                    userAddresses.length > 0 && userAddresses.map((address, key) => (
                      <label key={key} className="flex items-start p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="address"
                          className="w-5 h-5 mt-1 text-blue-600"
                          checked={selectedAddress?.id === address.id}
                          onChange={() => handleAddressSelect(address)}
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-800">{address.a_name}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.a_address_line}
                          </p>
                          <p className="text-sm text-gray-600">{address.a_phone}</p>
                        </div>
                      </label>
                    ))
                  }
                </div>

                {/* Add New Address Button */}
                <button
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setIsAddNewAddressOpen(true);
                  }}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Add New Address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Address Modal */}
        {isAddNewAddressOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Add Address
                  </h2>
                  <button
                    onClick={() => setIsAddNewAddressOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Add Address Form */}
                <form className="space-y-4">
                  {/* Row 1: Name and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        placeholder="John Doe"
                        value={addressFormData.name}
                        onChange={handleAddressInputChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        Phone
                      </label>
                      <input
                        type="text"
                        id="phone"
                        placeholder="1234567890"
                        value={addressFormData.phone}
                        onChange={handleAddressInputChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Country and District */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="country"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        Country
                      </label>
                      <select
                        id="country"
                        value={addressFormData.country}
                        onChange={handleAddressInputChange}
                        className="bg-gray-50 border border-gray-300 text-gray-600 text-sm rounded w-full p-2.5"
                        required
                      >
                        <option value="">Select Country</option>
                        {countryData.map((country) => (
                          <option key={country.value} value={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="district"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        District
                      </label>
                      <Select
                        id="district"
                        value={selectedDistrict}
                        onChange={setSelectedDistrict}
                        options={districtData}
                        placeholder="Select District"
                        isClearable
                        isSearchable
                        className="text-sm"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '42px',
                            backgroundColor: '#f9fafb',
                            borderColor: '#d1d5db',
                            '&:hover': {
                              borderColor: '#9ca3af'
                            }
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999
                          })
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 3: Thana/Upazila and Area */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="upazila"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        Thana/Upazila
                      </label>
                      <Select
                        id="upazila"
                        value={selectedThana}
                        onChange={setSelectedThana}
                        options={thanaData}
                        placeholder="Select Upazila"
                        isClearable
                        isSearchable
                        isDisabled={!selectedDistrict}
                        className="text-sm"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '42px',
                            backgroundColor: '#f9fafb',
                            borderColor: '#d1d5db',
                            '&:hover': {
                              borderColor: '#9ca3af'
                            }
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999
                          })
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="area"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        Area
                      </label>
                      <Select
                        id="area"
                        value={selectedArea}
                        onChange={setSelectedArea}
                        options={areaData}
                        placeholder="Select Area"
                        isClearable
                        isSearchable
                        isDisabled={!selectedThana}
                        className="text-sm"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '42px',
                            backgroundColor: '#f9fafb',
                            borderColor: '#d1d5db',
                            '&:hover': {
                              borderColor: '#9ca3af'
                            }
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999
                          })
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 4: Address Line and Landmark */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="address_line"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        Address Line
                      </label>
                      <input
                        type="text"
                        id="address_line"
                        placeholder="Dhaka"
                        value={addressFormData.address_line}
                        onChange={handleAddressInputChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="landmark"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        Landmark
                      </label>
                      <input
                        type="text"
                        id="landmark"
                        placeholder="Dhaka 45"
                        value={addressFormData.landmark}
                        onChange={handleAddressInputChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                      />
                    </div>
                  </div>

                  {/* Row 5: Postal Code and Post Office */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="postal_code"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postal_code"
                        placeholder="23"
                        value={addressFormData.postal_code}
                        onChange={handleAddressInputChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="post_office"
                        className="block mb-2 text-xs font-medium text-gray-500"
                      >
                        Post Office
                      </label>
                      <input
                        type="text"
                        id="post_office"
                        placeholder="Of2"
                        value={addressFormData.post_office}
                        onChange={handleAddressInputChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded w-full p-2.5"
                      />
                    </div>
                  </div>

                  {/* Row 6: Is Default Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded">
                    <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
                      Set as Default Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setAddressFormData(prev => ({ ...prev, is_default: !prev.is_default }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${addressFormData.is_default ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${addressFormData.is_default ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Save Button */}
                  <button
                    type="button"
                    onClick={handleAddressSubmit}
                    className="w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 transition font-medium mt-6"
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Checkout;
