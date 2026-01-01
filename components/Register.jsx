import { useState } from "react";
import api from "@/lib/api"; // Adjust the import based on your project structure
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import LoginService from "@/services/LoginService";
import PhoneInput from "react-phone-input-2";
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

export default function Register({ isOpen, onClose }) {
  const [countryCode, setCountryCode] = useState("+880");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
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
      onClose(); // close modal
      reset(); // clear form
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Registration failed");
      }
    }
  };


   const onSubmit = async (data) => {
    // Remove country code from phone number
    const phoneWithoutCode = data.phone.replace(countryCode.replace('+', ''), '');

    console.log("Form data:", {
      ...data,
      u_country_code: countryCode,
      phone: phoneWithoutCode
    }); // Check phone format

    try {
      const response = await LoginService.Commands.registration({
        name: data.name,
        u_country_code: countryCode,
        phone: phoneWithoutCode,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      toast.success(response.message || "Registration successful");
      onClose(); // close modal
      reset(); // clear form
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Registration failed");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-40">
      <div className="relative p-4 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Register in to Click4details
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
                      country={'bd'}
                      value={value}
                      onChange={(phone, country) => {
                        onChange(phone);
                        setCountryCode(`+${country.dialCode}`);
                      }}
                      inputProps={{
                        name: 'phone',
                        required: true,
                      }}
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
                  password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  name="password"
                  id="password"
                  required
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                />
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
                <input
                  {...register("password_confirmation")}
                  type="password"
                  name="password_confirmation"
                  id="password_confirmation"
                  required
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                />
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
                className="w-full bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Create your account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
