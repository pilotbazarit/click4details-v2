import { useState } from "react";
import Register from "./Register";
import { useAppContext } from "@/context/AppContext";
import LoginService from "@/services/LoginService";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import UserService from "@/services/UserService";

// Yup Validation Schema
const schema = yup.object().shape({
  login: yup.string().required("Email or phone is required"),
  password: yup.string().required("Password is required"),
});

export default function Login({ isOpen, onClose, openForgotPasswordModal }) {
  const [countryCode, setCountryCode] = useState("+880");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useAppContext();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(false);
    setFieldError(null);

    // Remove country code from phone number if it's a phone number
    let loginValue = data.login;
    const dialCodeWithoutPlus = countryCode.replace('+', '');

    // If the login value starts with the country code, remove it
    if (loginValue.startsWith(dialCodeWithoutPlus)) {
      loginValue = loginValue.substring(dialCodeWithoutPlus.length);
    } else if (loginValue.startsWith('+' + dialCodeWithoutPlus)) {
      loginValue = loginValue.substring(dialCodeWithoutPlus.length + 1);
    }

    try {
      const res = await LoginService.Commands.login({
        login: loginValue,
        password: data.password,
        country_code: countryCode,
      });

     

      if (res.status === "success") {
        localStorage.setItem("auth_token", res.token);

        // console.log("hello world", res?.data?.id);

         const response = await UserService.Queries.getUserById(res?.data?.id);

          // console.log("res----------------", res?.data);

        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(JSON.stringify(response.data));

        onClose(); // close modal
        reset(); // clear form
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

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-40">
      <div className="relative p-4 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sign in to our pilot bazar
            </h3>
            <button
              type="button"
              onClick={() => {
                onClose();
                setError(false);
              }}
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
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="login"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your phone
                </label>
                <Controller
                  name="login"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <PhoneInput
                      country={'bd'}
                      value={value}
                      onChange={(phone, country) => {
                        const dialCode = country.dialCode;
                        // Ensure country code is always present
                        if (!phone.startsWith(dialCode)) {
                          onChange(dialCode);
                        } else {
                          onChange(phone);
                          setCountryCode(`+${dialCode}`);
                        }
                      }}
                      inputProps={{
                        name: 'login',
                        required: true,
                      }}
                      autoFormat={false}
                      containerClass="w-full"
                      inputClass="!w-full"
                      buttonClass="!bg-gray-50 dark:!bg-gray-600"
                      dropdownClass="!bg-white dark:!bg-gray-700"
                      countryCodeEditable={false}
                    />
                  )}
                />
                {errors.login && (
                  <p className="text-red-500 text-sm mt-2">{errors.login.message}</p>
                )}
                {fieldError?.login && (
                  <p className="text-sm text-red-500 mt-2">
                    {fieldError?.login[0]}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your password
                </label>
                <div className="relative">
                  <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  placeholder="••••••••"
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
                  <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
                )}
              </div>

              {error &&
                <span className="text-red-500">Email or password is incorrect.</span>
              }

              <div className="flex justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <p className="text-sm text-red-500 mt-2">
                      {fieldError?.password[0]}
                    </p>
                  </div>
                  <label
                    htmlFor="remember"
                    className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-blue-700 hover:underline dark:text-blue-500"
                  onClick={openForgotPasswordModal}
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Login to your account
              </button>

              <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Not registered?{" "}
                <a
                  href="#"
                  className="text-blue-700 hover:underline dark:text-blue-500"
                  onClick={() => {
                    setRegisterOpen(true)
                  }}
                >
                  Create account
                </a>
              </div>
            </form>
            <Register
              isOpen={registerOpen}
              onClose={() => {
                setRegisterOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
