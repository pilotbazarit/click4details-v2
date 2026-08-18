'use client'
import React, { Suspense, useState } from "react";
import { Noto_Sans_Bengali } from "next/font/google";
import { ProductContextProvider } from "@/context/ProductContext";
import Login from "@/components/Login";
import Register from "@/components/Register";
import ForgotPasswordModal from "@/components/modals/ForgotPasswordModal";
import { useAppContext } from "@/context/AppContext";
import LoginService from "@/services/LoginService";
import { useRouter } from "next/navigation";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Loading from "@/components/Loading";

const banglaFont = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const HomeContent = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [fullPhone, setFullPhone] = useState(""); // Full phone with country code
  const [countryData, setCountryData] = useState(null); // Store country info
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState(null);
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useAppContext();
  const router = useRouter();

  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePhoneChange = (value, country) => {
    setFullPhone(value);
    setCountryData(country);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Extract phone number without country code
      const countryCode = `+${countryData.dialCode}`;
      const phoneWithoutCountryCode = fullPhone.slice(countryData.dialCode.length);

      const res = await LoginService.Commands.login({
        login: phoneWithoutCountryCode,
        password,
        country_code: countryCode
      });

      if (res.status === "success") {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(JSON.stringify(res.data));

        router.push("/my-shop"); // redirect to shop page
      } else {
        setFieldError(res.errors);
      }
    } catch (error) {
      setFieldError(error.errors);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContextProvider>
      {/* <div> */}
      {/* <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"> */}
      <div className={`${banglaFont.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-blue-400 to-purple-300 relative overflow-hidden`}>
        {/* Decorative Blurred Circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-40 translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-400 rounded-full filter blur-3xl opacity-30"></div>

        <div className="flex w-full max-w-6xl mx-4 gap-8 items-center z-10">
          {/* Left Side - Branding */}
          <div className="flex-1 text-white hidden lg:block">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
                </div>
                <h1 className="text-4xl font-bold">Click4Details</h1>
              </div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                আপনার ব্যবসা এখন আরও সহজ।<br />
              </h2>
              <h2 className="text-2xl font-bold mb-6 leading-tight">
               
                বিক্রি ও বিজনেস ম্যানেজমেন্ট—একটি বিশ্বাসযোগ্য ডিজিটাল প্ল্যাটফর্মে।
              </h2>
              <p className="text-white/90 text-lg leading-relaxed max-w-md">
                এই প্ল্যাটফর্মটি কাদের জন্য?<br />
                ✔ Exporter & Importer<br />
                ✔ Wholesaler<br />
                ✔ Showroom Owner<br />
                ✔ Business Owner<br />
                ✔ Media / Broker
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 max-w-md w-full">
            <div className="backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border border-white/30">
              <style jsx>{`
                .phone-input-custom :global(.react-tel-input) {
                  width: 100%;
                }
                .phone-input-custom :global(.react-tel-input .form-control) {
                  width: 100% !important;
                  padding: 0.75rem 1rem 0.75rem 3.5rem !important;
                  border-radius: 0.5rem !important;
                  background: rgba(255, 255, 255, 0.9) !important;
                  backdrop-filter: blur(4px) !important;
                  border: 1px solid rgba(255, 255, 255, 0.5) !important;
                  color: #1f2937 !important;
                  font-size: 1rem !important;
                  height: auto !important;
                }
                .phone-input-custom :global(.react-tel-input .form-control:focus) {
                  outline: none !important;
                  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5) !important;
                  border-color: rgba(255, 255, 255, 0.5) !important;
                }
                .phone-input-custom :global(.react-tel-input .flag-dropdown) {
                  background: rgba(255, 255, 255, 0.9) !important;
                  border: 1px solid rgba(255, 255, 255, 0.5) !important;
                  border-radius: 0.5rem 0 0 0.5rem !important;
                }
                .phone-input-custom :global(.react-tel-input .selected-flag) {
                  padding: 0 0 0 0.75rem !important;
                  border-radius: 0.5rem 0 0 0.5rem !important;
                }
                .phone-input-custom :global(.react-tel-input .selected-flag:hover),
                .phone-input-custom :global(.react-tel-input .selected-flag.open) {
                  background: rgba(255, 255, 255, 0.95) !important;
                }
                .phone-input-custom :global(.react-tel-input .country-list) {
                  background: white !important;
                  border-radius: 0.5rem !important;
                  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
                }
              `}</style>

              <div className="text-center mb-8">
                <p className="text-white text-sm font-medium tracking-wider mb-2">
                  WELCOME To Click4Details
                </p>
                <p className="text-white/80 text-xs">
                  LOG IN TO CONTINUE
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="phone-input-custom">
                  <PhoneInput
                    country={'bd'}
                    value={fullPhone}
                    onChange={handlePhoneChange}
                    autoFormat={false}
                    inputProps={{
                      name: 'login',
                      required: true,
                    }}
                  />
                  {fieldError?.login && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldError.login[0]}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-white/90 backdrop-blur-sm border border-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8a11 11 0 0 1 5.06-6.06" />
                        <path d="M1 1l22 22" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.24 4.24" />
                        <path d="M14.12 14.12 9.88 9.88" />
                        <path d="M7.5 7.5A11.08 11.08 0 0 1 12 4c5 0 9.27 3 11 8a10.94 10.94 0 0 1-2.34 3.74" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  {fieldError?.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldError.password[0]}
                    </p>
                  )}
                </div>

                {/* Remember me and Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-white/50 rounded bg-white/90 focus:ring-2 focus:ring-white/50"
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 text-sm text-white/90"
                    >
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-sm text-white/90 hover:text-white hover:underline transition"
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">
                    Email or password is incorrect.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-between px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? "Logging in..." : "Login to my Account"}</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <div className="text-center mt-4">
                  <p className="text-white/90 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegisterOpen(true)}
                      className="text-white font-semibold hover:underline transition"
                    >
                      Create Account
                    </button>
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-white/30 bg-white/10 p-4 text-center shadow-lg backdrop-blur-sm">
                  <p className="mb-2 text-md font-medium text-red-500">
                    লগইন করতে কোনো সমস্যা হলে,
                  </p>
                  <p className="mb-3 text-md text-red-500">
                    অনুগ্রহ করে আমাদের এই নম্বরে কল করুন
                  </p>
                  <a
                    href="tel:+8809638660077"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-md font-bold text-white transition hover:bg-blue-500"
                  >
                    +8809638660077
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* <Login
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          openForgotPasswordModal={() => {}}
        /> */}

        <Register
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />

        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          openResetPasswordModal={() => setIsForgotPasswordOpen(false)}
        />
      </div>
      {/* </div> */}
    </ProductContextProvider>
  );
};

const Home = () => {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
};

export default Home;
