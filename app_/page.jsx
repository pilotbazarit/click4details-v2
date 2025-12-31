'use client'
import React, { useState } from "react";
import { ProductContextProvider } from "@/context/ProductContext";
import Login from "@/components/Login";
import { useAppContext } from "@/context/AppContext";
import LoginService from "@/services/LoginService";
import { useRouter } from "next/navigation";

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState(null);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-blue-400 to-purple-300 relative overflow-hidden">
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
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                We Are The Best<br />In Business
              </h2>
              <p className="text-white/90 text-lg leading-relaxed max-w-md">
                Increase your workspace efficiency with Galileo's sleek and intuitive best project
                management platform. It makes it easier for your team to collaborate on the most
                challenging projects. Perfectly aligned for distributed teams to empower a seamless
                work process in every aspect.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 max-w-md w-full">
            <div className="backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border border-white/30">
              <div className="text-center mb-8">
                <p className="text-white text-sm font-medium tracking-wider mb-2">
                  WELCOME BACK Click4Details
                </p>
                <p className="text-white/80 text-xs">
                  LOG IN TO CONTINUE
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <input
                    type="text"
                    name="login"
                    placeholder="Your email/phone"
                    className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm border border-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                    onChange={handleChange}
                    required
                  />
                  {fieldError?.login && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldError.login[0]}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm border border-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                    onChange={handleChange}
                    required
                  />
                  {fieldError?.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldError.password[0]}
                    </p>
                  )}
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

                {/* <div className="text-center">
                  <a href="#" className="text-white/90 text-sm hover:text-white transition">
                    Forgot your Password
                  </a>
                </div> */}
              </form>
            </div>
          </div>
        </div>

        {/* <Login
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          openForgotPasswordModal={() => {}}
        /> */}
      </div>
    {/* </div> */}
    </ProductContextProvider>
  );
};

export default Home;
