import { useState } from "react";
import axios from "axios";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import LoginService from "@/services/LoginService";
import PhoneInput from "react-phone-input-2";
import Swal from "sweetalert2";
import "react-phone-input-2/lib/style.css";

// Yup Validation Schema
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  phone: yup.string().required("Phone is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required(),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm password"),
});

export default function Register({ isOpen, onClose, onOpenLogin, onHideLogin }) {
  const [countryCode, setCountryCode] = useState("+880");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState("register");
  const [otp, setOtp] = useState("");
  const [pendingForm, setPendingForm] = useState(null);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmitOld = async (data) => {
    try {
      const response = await api.post("/register", {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      toast.success(response.message || "Registration successful");
      onClose();
      reset();
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Registration failed");
      }
    }
  };

  const completeRegistration = async (payload) => {
    const response = await LoginService.Commands.registration(payload);
    // toast.success(response.message || "Registration successful");
    // setOtp("");
    // setPendingForm(null);
    // setStep("register");
    // onClose();
    // reset();
  };

  const onSubmit = async (data) => {
    const phoneWithoutCode = data.phone.replace(countryCode.replace("+", ""), "");

    try {
      // const checkResponseOld = await axios.get(
      //   `https://www.api.pilotbazar.xyz/api/is-verify-phone/${phoneWithoutCode}`,
      //   {
      //     headers: {
      //       Accept: "application/json",
      //       "X-Requested-With": "XMLHttpRequest",
      //     },
      //   }
      // );

      // const checkResponse = await LoginService.Queries.isVerifyPhone(phoneWithoutCode);

      // console.log("checkResponse---------", checkResponse);



      // const exists = checkResponse?.data?.user_exist

      // if (exists !== false) {
      //   toast.error(checkResponse?.data?.message || "Phone already exists");
      //   return;
      // }


      // const registrationResponse = await completeRegistration({
      //   name: data.name,
      //   u_country_code: countryCode,
      //   phone: phoneWithoutCode,
      //   email: data.email,
      //   password: data.password,
      //   password_confirmation: data.password_confirmation,
      // });
      const payload = {
        name: data.name,
        u_country_code: countryCode,
        phone: phoneWithoutCode,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }


      const registrationResponse = await LoginService.Commands.registration(payload);

      console.log("registrationResponse", registrationResponse);

      if (registrationResponse?.data?.phone_verified) {
        await Swal.fire({
          icon: "warning",
          title: "Phone Already Exists!",
          text: "This phone number is already verified. Please Login",
          confirmButtonText: "OK",
        });
        onClose();
        if (onOpenLogin) onOpenLogin();
        return;
      }

      // console.log("========registrationResponse--------===========", registrationResponse);

      // setIsOtpSending(true);
      // const response = await LoginService.Commands.sendOtp({
      //   phone: phoneWithoutCode
      // });

      // console.log("response send otp", response);

      setPendingForm({
        name: data.name,
        u_country_code: countryCode,
        phone: phoneWithoutCode,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      // if (onHideLogin) onHideLogin();
      setStep("verify");
      // toast.success("OTP sent to your phone");
    } catch (error) {
      toast.error(error.response?.data?.message || "Phone check failed");
    } finally {
      // setIsOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!pendingForm) return;

    try {
      setIsVerifying(true);
      const formData = new FormData();
      formData.append("phone", pendingForm.phone);
      formData.append("otp", otp);

      const responseOtp = await LoginService.Commands.verifyOtp({
        phone: pendingForm.phone,
        otp: otp
      });

      console.log("responseOtp", responseOtp);
      if (responseOtp?.status == "success") {
          toast.success("Registration successfully");
          setOtp("");
          setPendingForm(null);
          setStep("register");
          onClose();
          reset();
      } else {
        toast.error(responseOtp.message);
      }



      // await axios.post("https://www.api.pilotbazar.xyz/api/verify-otp", formData, {
      //   headers: {
      //     Accept: "application/json",
      //     "X-Requested-With": "XMLHttpRequest",
      //   },
      // });

      // await completeRegistration({
      //   name: pendingForm.name,
      //   u_country_code: pendingForm.u_country_code,
      //   phone: pendingForm.phone,
      //   email: pendingForm.email,
      //   password: pendingForm.password,
      //   password_confirmation: pendingForm.password_confirmation,
      // });
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingForm) return;
    try {
      setIsOtpSending(true);
      await axios.get("https://www.api.pilotbazar.xyz/api/send-otp", {
        params: { phone: pendingForm.phone },
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      toast.success("OTP resent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsOtpSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-40">
      <div className="relative p-4 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Register in to Click4Details
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                className="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="p-4 md:p-5">
            {step === "register" ? (
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Name
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Phone
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <PhoneInput
                        country={"bd"}
                        value={value}
                        onChange={(phone, country) => {
                          onChange(phone);
                          setCountryCode(`+${country.dialCode}`);
                        }}
                        inputProps={{
                          name: "phone",
                          required: true,
                        }}
                        autoFormat={false}
                        containerClass="w-full"
                        inputClass="!w-full"
                        buttonClass="!bg-gray-50 dark:!bg-gray-600"
                        dropdownClass="!bg-white dark:!bg-gray-700"
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="text"
                    name="email"
                    id="email"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="name@company.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      required
                      placeholder="............."
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 pr-12 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8a11 11 0 0 1 5.06-6.06" />
                          <path d="M1 1l22 22" />
                          <path d="M9.9 9.9a3 3 0 0 0 4.24 4.24" />
                          <path d="M14.12 14.12 9.88 9.88" />
                          <path d="M7.5 7.5A11.08 11.08 0 0 1 12 4c5 0 9.27 3 11 8a10.94 10.94 0 0 1-2.34 3.74" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password_confirmation"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Confirmation password
                  </label>
                  <div className="relative">
                    <input
                      {...register("password_confirmation")}
                      type={showConfirmPassword ? "text" : "password"}
                      name="password_confirmation"
                      id="password_confirmation"
                      required
                      placeholder="............."
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 pr-12 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8a11 11 0 0 1 5.06-6.06" />
                          <path d="M1 1l22 22" />
                          <path d="M9.9 9.9a3 3 0 0 0 4.24 4.24" />
                          <path d="M14.12 14.12 9.88 9.88" />
                          <path d="M7.5 7.5A11.08 11.08 0 0 1 12 4c5 0 9.27 3 11 8a10.94 10.94 0 0 1-2.34 3.74" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-red-500 text-sm">
                      {errors.password_confirmation.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="remember"
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 dark:bg-gray-600 dark:border-gray-500"
                      />
                    </div>
                    <label
                      htmlFor="remember"
                      className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isOtpSending}
                  className="w-full bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {isOtpSending ? "Sending OTP..." : "Create your account"}
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-100">
                  OTP sent to {pendingForm?.u_country_code}{pendingForm?.phone}
                </div>
                <div>
                  <label
                    htmlFor="otp"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="6-digit code"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-green-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>
                <div className="flex items-center justify-between text-sm">
                  {/* <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isOtpSending}
                    className="text-blue-700 hover:text-blue-800 disabled:opacity-60"
                  >
                    {isOtpSending ? "Resending..." : "Resend OTP"}
                  </button> */}
                  <button
                    type="button"
                    onClick={() => setStep("register")}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-200"
                  >
                    Edit details
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
