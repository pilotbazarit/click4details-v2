import React, { useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { usePathname } from "next/navigation";
import UserService from "@/services/UserService";

const Footer = () => {

  const { shops, setShops, user, selectedShop, setSelectedShop, selectedCompanyShop } = useAppContext();
  const pathname = usePathname();

  // ---------- Custom Helper ----------
  let isMyShop = pathname.includes("my-shop");
  let isCompanyShop = pathname.includes("company-shop");

  // ---------- Logo ----------
  const getValidImage = (src) => {
    if (typeof src === "string" && src.trim() !== "") {
      return src;
    }
    return "/no_image.jpeg";
  };

  let logo;
  const logoClasses = "w-22 md:w-28 h-22 md:h-28 relative";

  if (isMyShop) {
    const src = getValidImage(selectedShop?.s_logo?.url);
    logo = (
      <div className={logoClasses}>
        <Image src={src} alt="logo" fill className="object-contain" />
      </div>
    );
  } else if (isCompanyShop) {
    const src = getValidImage(selectedCompanyShop?.shop?.s_logo);
    logo = (
      <div className={logoClasses}>
        <Image src={src} alt="company logo" fill className="object-contain" />
      </div>
    );
  } else {
    const src = getValidImage(assets.pilotBazarLogo);
    logo = (
      <div className="w-28 md:w-32 h-28 md:h-32 relative">
        <Image src={src} alt="pilotbazar logo" fill className="object-contain" />
      </div>
    );
  }

  // console.log("selectedCompanyShop", selectedCompanyShop);

  const getCurrentUser = async () => {
    // Double check before API call
    if (!selectedCompanyShop?.shop?.s_id || !user) {
      return;
    }

    try {
      const response = await UserService.Queries.getUserById(selectedCompanyShop.shop.s_id);

      // console.log("response footer", response);
      if(response?.status == 'success'){
         setShops(response?.data);
      }
    } catch (error) {
      console.log("Error fetching user:", error);
      // Silently fail - don't show error to user
    }
  };

  useEffect(() => {
    // Only fetch user data if logged in and selectedCompanyShop exists
    if (selectedCompanyShop?.shop?.s_id && user) {
      getCurrentUser()
    }
  }, [selectedCompanyShop, user]);


  // Description
  let description;
  if (isMyShop) {
    description = selectedShop?.s_description;
  } else if (isCompanyShop) {
    description = selectedCompanyShop?.shop?.s_description; // চাইলে আলাদা description দিতে পারেন
  } else {
    description =
      "গাড়ি ও বাড়ি ক্রয়-বিক্রয়ের বিশ্বস্ত অনলাইন মার্কেটপ্লেস। এখানে আপনি পাচ্ছেন নিরাপদ লেনদেন, সঠিক তথ্য, এবং সেরা মূল্যের নিশ্চয়তা। আপনার স্বপ্নের গাড়ি বা বাড়ি খুঁজে নিন একদম ঝামেলামুক্তভাবে।";
  }

  // ---------- Phone ----------
  let phone;
  if (isMyShop) {
    phone = selectedShop?.user?.phone;
  } else if (isCompanyShop) {
    phone = selectedCompanyShop?.shop?.user?.phone; // fallback number
  } else {
    phone = "+8801969944400";
  }

  // ---------- Email ----------
  let email;
  if (isMyShop) {
    email = selectedShop?.user?.email;
  } else if (isCompanyShop) {
    email = selectedCompanyShop?.shop?.user?.email;
  } else {
    email = "click4details.importer@gmail.com";
  }

  // ---------- Address ----------
  let address;
  if (isMyShop) {
    address = selectedShop?.address || "";
  } else if (isCompanyShop) {
    address = selectedCompanyShop?.shop?.user?.address;
  } else {
    address = "Plot 1A,Road 138, Gulshan 1, Dhaka";
  }



  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 text-gray-500">
        <div className="w-2/5">
          {logo}
          <p className="mt-6 text-sm">{description}</p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            {/* <h2 className="font-medium text-gray-900 mb-5">Company</h2> */}
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition" href="#">Home</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">About us</a>
              </li>
              <li>
                <a className="hover:underline transition" href="#">Contact us</a>
              </li>
              {/* <li>
                <a className="hover:underline transition" href="#">Privacy policy</a>
              </li> */}
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>
                {phone}
              </p>
              <p>
                {email}

              </p>
              <p>
                {address}

              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm">
        Copyright 2025 © pilotbazar.com All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;