import React from "react";
import { assets } from "../../assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import api from "@/lib/api";


// setCartItems 
const Navbar = () => {

  const { setCartItems } = useAppContext();

  const setLogout = async () => {
    // await api.post("/logout");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    // setCartItems([]);
    router.push("/");
  };

    const { router, setUser } = useAppContext();

  return (
    <div className="flex items-center px-4 md:px-8 py-3 justify-between border-b">
      <Image
        onClick={() => router.push("/")}
        className="w-28 lg:w-32 cursor-pointer"
        src={assets.logo}
        alt=""
      />
      <button
        className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm"
        onClick={() => setLogout()}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
