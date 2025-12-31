import { useState } from "react";
import Register from "./Register";
import { useAppContext } from "@/context/AppContext";
import LoginService from "@/services/LoginService";
import { useRouter } from "next/navigation";

export default function Login({ isOpen, onClose, openForgotPasswordModal }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [error, setError] = useState(false);

  const { setUser } = useAppContext();

  const router = useRouter();

  const handleChange = (e) => {
    e.target.name === "login"
      ? setLogin(e.target.value)
      : setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await LoginService.Commands.login({ login, password });

      if (res.status === "success") {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(JSON.stringify(res.data));

        onClose(); // close modal
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
              Sign in to Click4Details
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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email/phone
                </label>
                <input
                  type="text"
                  name="login"
                  id="login"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="name@company.com/+8801XXXXXXXXX"
                  onChange={handleChange}
                />
                <p className="text-sm text-red-500 mt-2">
                  {fieldError?.login[0]}
                </p>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  onChange={handleChange}
                />
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
