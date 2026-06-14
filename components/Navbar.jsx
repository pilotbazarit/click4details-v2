"use client";
import React, { Suspense, useRef } from "react";
import { assets } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import Login from "@/components/Login";
import MyHomePopover from "./MyHomePopover";
import { usePathname, useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";
import LoginPromptModal from "@/components/LoginPromptModal";
import toast from "react-hot-toast";
import { Bell, ChevronDown, GitCompare, House, Info, LayoutDashboard, ListFilterPlus, LogOut, Pencil, PhoneCall, Plus, ShoppingCart, SquareChartGantt, Store, Trash2, User, UserPen } from "lucide-react";
import LoginService from "@/services/LoginService";
import { useMyShopProductContext } from "@/context/MyShopProductContext";
import ShopDropdown from "./ShopDropdown";
import CompanyShopDropdown from "./CompanyShopDropdown";
import ForgotPasswordModal from "./modals/ForgotPasswordModal";
import ResetPasswordModal from "./modals/ResetPasswordModal";
import NotificationModal from "./modals/NotificationModal";
import ProductChatModal from "./modals/ProductChatModal";
import CategoryService from "@/services/CategoryService";
import NotificationService from "@/services/NotificationService";
import SearchBar from "@/components/SearchBar";
import ConversationModal from "./modals/ConversationModal";
import ConversationService from "@/services/ConversationService";
import * as Popover from "@radix-ui/react-popover";


// Recursive Category Menu Item Component (Desktop & Mobile)
const CategoryMenuItem = ({ category, onSelect, level = 0, onLoadSubcategories, isMobile = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const hasChildren = category.subcategories !== null && category.subcategories !== undefined;

  const ensureSubcategoriesLoaded = async () => {
    if (hasChildren && category.subcategories.length === 0 && !isLoadingSubcategories) {
      setIsLoadingSubcategories(true);
      await onLoadSubcategories(category.id, category.type);
      setIsLoadingSubcategories(false);
    }
  };

  const handleClick = async () => {
    if (hasChildren) {
      if (isMobile) {
        if (!isExpanded) {
          await ensureSubcategoriesLoaded();
        }
        setIsExpanded((prev) => !prev);
        return;
      }

      // Desktop/touch devices: click should also open submenu (hover fallback)
      if (!isHovered) {
        await ensureSubcategoriesLoaded();
      }
      setIsHovered((prev) => !prev);
      return;
    }

    console.log("category ----------- 64", category);

    onSelect(category);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(category);
  };

  const handleMouseEnter = async () => {
    if (!isMobile) {
      setIsHovered(true);
      await ensureSubcategoriesLoaded();
    }
  };

  if (isMobile) {
    const handlePlusClick = async (e) => {
      e.stopPropagation();
      await handleClick();
    };

    const handleItemClick = async (e) => {
      handleSelect(e);
    };

    return (
      <div className="border-b border-gray-100 last:border-0">
        <div
          className={`py-3 flex items-center justify-between transition-colors duration-150 touch-manipulation ${level === 0 ? 'pl-4 pr-4' : level === 1 ? 'pl-8 pr-4' : 'pl-12 pr-4'
            }`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <span
            className={`text-gray-800 select-none cursor-pointer flex-1 ${level === 0 ? 'text-sm font-medium' : 'text-sm'}`}
            onClick={handleItemClick}
          >
            {category.name}
          </span>
          {hasChildren && (
            <button
              onClick={handlePlusClick}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-150 flex-shrink-0"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Plus className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-45' : ''}`} />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="bg-white">
            {isLoadingSubcategories ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
            ) : category.subcategories.length > 0 ? (
              category.subcategories.map((subcat) => (
                <CategoryMenuItem
                  key={subcat.id}
                  category={subcat}
                  onSelect={onSelect}
                  onLoadSubcategories={onLoadSubcategories}
                  level={level + 1}
                  isMobile={true}
                />
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No subcategories</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="px-4 py-2 hover:bg-orange-50 cursor-pointer flex items-center justify-between transition-colors duration-150"
        onClick={handleSelect}
      >
        <span className="text-gray-700 text-sm">{category.name}</span>
        {hasChildren && (
          <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
        )}
      </div>

      {hasChildren && isHovered && (
        <div className="absolute left-full top-0 bg-white shadow-xl rounded-lg border border-gray-200 min-w-[220px] z-50">
          <div className="py-2">
            {isLoadingSubcategories ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
            ) : category.subcategories.length > 0 ? (
              category.subcategories.map((subcat) => (
                <CategoryMenuItem
                  key={subcat.id}
                  category={subcat}
                  onSelect={onSelect}
                  onLoadSubcategories={onLoadSubcategories}
                  level={level + 1}
                  isMobile={false}
                />
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No subcategories</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TopCategoryMenuItem = ({ category, onSelect, onLoadSubcategories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const hasChildren = category.subcategories !== null && category.subcategories !== undefined;

  const ensureSubcategoriesLoaded = async () => {
    if (hasChildren && category.subcategories.length === 0 && !isLoadingSubcategories) {
      setIsLoadingSubcategories(true);
      await onLoadSubcategories(category.id, category.type);
      setIsLoadingSubcategories(false);
    }
  };

  const handleMouseEnter = async () => {
    setIsOpen(true);
    await ensureSubcategoriesLoaded();
  };

  const handleClick = async () => {
    onSelect(category);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        className="flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-blue-50 hover:text-gray-950"
      >
        <span className="whitespace-nowrap">{category.name}</span>
        {hasChildren && (
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {hasChildren && isOpen && (
        <div className="absolute left-0 top-full z-[60] min-w-[250px] rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="py-2">
            {isLoadingSubcategories ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
            ) : category.subcategories.length > 0 ? (
              category.subcategories.map((subcat) => (
                <CategoryMenuItem
                  key={subcat.id}
                  category={subcat}
                  onSelect={onSelect}
                  onLoadSubcategories={onLoadSubcategories}
                />
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No subcategories</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NavbarContent = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  // const { cartItems, setCartItems, addToCart } = useAppContext();

  const { cartItems, setCartItems, addToCart, isSeller, router, user, setUser, shops, selectedShop, setSelectedShop, compareItems } = useAppContext();

  // console.log("cartItems Navbar:::", cartItems.length);

  // Get cart items count from localStorage
  // useEffect(() => {
  //   const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  //   setCartItemCount(cartItems.length);
  // }, []);



  const [loginOpen, setLoginOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProduct, setChatProduct] = useState(null);
  const [chatConversationId, setChatConversationId] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // const { products, loading, hasMore, getAllProduct } = useMyShopProductContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [shopOptions, setShopOptions] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [notificationRefreshTrigger, setNotificationRefreshTrigger] = useState(0);
  const categoryRef = useRef(null);

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  // const notifications = [
  //   { id: 1, title: "New message", description: "You have a new message in chat.", time: "2m ago" },
  //   { id: 2, title: "Order update", description: "Your order has been shipped.", time: "1h ago" },
  //   { id: 3, title: "Promo", description: "Check out the latest deals today.", time: "3h ago" },
  // ];

  // Demo category data with unlimited nested structure
  const categoriesOld = [
    {
      id: 1,
      name: "Electronics",
      subcategories: [
        {
          id: 11,
          name: "Mobile Phones",
          subcategories: [
            {
              id: 111,
              name: "Smartphones",
              subcategories: [
                {
                  id: 1111,
                  name: "Android",
                  subcategories: [
                    { id: 11111, name: "Samsung" },
                    { id: 11112, name: "Xiaomi" },
                    { id: 11113, name: "OnePlus" }
                  ]
                },
                {
                  id: 1112,
                  name: "iOS",
                  subcategories: [
                    { id: 11121, name: "iPhone 15 Series" },
                    { id: 11122, name: "iPhone 14 Series" },
                    { id: 11123, name: "iPhone 13 Series" }
                  ]
                }
              ]
            },
            { id: 112, name: "Feature Phones" },
            {
              id: 113,
              name: "Accessories",
              subcategories: [
                { id: 1131, name: "Cases & Covers" },
                { id: 1132, name: "Screen Protectors" },
                { id: 1133, name: "Chargers" }
              ]
            }
          ]
        },
        {
          id: 12,
          name: "Computers",
          subcategories: [
            {
              id: 121,
              name: "Laptops",
              subcategories: [
                { id: 1211, name: "Gaming Laptops" },
                { id: 1212, name: "Business Laptops" },
                { id: 1213, name: "Ultrabooks" }
              ]
            },
            { id: 122, name: "Desktops" },
            { id: 123, name: "Tablets" }
          ]
        },
        {
          id: 13,
          name: "TV & Audio",
          subcategories: [
            { id: 131, name: "Smart TV" },
            { id: 132, name: "Speakers" }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Vehicles",
      subcategories: [
        {
          id: 21,
          name: "Cars",
          subcategories: [
            {
              id: 211,
              name: "Sedan",
              subcategories: [
                { id: 2111, name: "Toyota Sedan" },
                { id: 2112, name: "Honda Sedan" },
                { id: 2113, name: "BMW Sedan" }
              ]
            },
            { id: 212, name: "SUV" },
            { id: 213, name: "Hatchback" }
          ]
        },
        {
          id: 22,
          name: "Motorcycles",
          subcategories: [
            { id: 221, name: "Sports Bike" },
            { id: 222, name: "Cruiser" },
            { id: 223, name: "Scooter" }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Fashion",
      subcategories: [
        {
          id: 31,
          name: "Men's Fashion",
          subcategories: [
            { id: 311, name: "Shirts" },
            { id: 312, name: "Pants" },
            { id: 313, name: "Shoes" }
          ]
        },
        {
          id: 32,
          name: "Women's Fashion",
          subcategories: [
            { id: 321, name: "Dresses" },
            { id: 322, name: "Sarees" },
            { id: 323, name: "Accessories" }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Home & Living",
      subcategories: [
        {
          id: 41,
          name: "Furniture",
          subcategories: [
            { id: 411, name: "Sofa" },
            { id: 412, name: "Bed" },
            { id: 413, name: "Dining Table" }
          ]
        },
        {
          id: 42,
          name: "Kitchen",
          subcategories: [
            { id: 421, name: "Cookware" },
            { id: 422, name: "Appliances" }
          ]
        }
      ]
    }
  ];



  const categories_data = [
    {
      id: 1,
      name: "Electronics",

    },
    {
      id: 2,
      name: "Vehicles",

    },
    {
      id: 3,
      name: "Fashion",

    },
    {
      id: 4,
      name: "Home & Living",

    }
  ];


  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);


  const getCategories = async (parentId = 0, fallbackType = "") => {
    try {
      setLoading(true);
      const response = await CategoryService.Queries.getCategories({
        _page: 1,
        _perPage: 10000,
        _parent_id: parentId,
      });

      if (response?.status === "success") {
        const rawData = response?.data?.data || [];

        // Convert response data into desired format
        const formattedData = rawData.map((item) => ({
          id: item.c_id,
          name: item.c_name,
          type: item.c_type || fallbackType,
          subcategories: item.c_is_child ? [] : null, // Initialize subcategories as empty array if it has children
        }));

        if (parentId === 0) {
          setCategories(formattedData);
        } else {
          setCategories((prev) => {
            const updated = updateCategoryTree(prev, parentId, formattedData);
            return updated;
          });
        }
      } else {
        toast.error(response?.data?.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch data types categories"
      );
    } finally {
      setLoading(false);
    }
  };

  // Recursive function to update category tree
  const updateCategoryTree = (categories, parentId, newSubcategories) => {
    return categories.map((category) => {
      if (category.id === parentId) {
        // Found the parent - update its subcategories
        return {
          ...category,
          subcategories: newSubcategories,
        };
      } else if (category.subcategories && Array.isArray(category.subcategories)) {
        const updatedSubcategories = updateCategoryTree(category.subcategories, parentId, newSubcategories);
        if (updatedSubcategories !== category.subcategories) {
          return {
            ...category,
            subcategories: updatedSubcategories,
          };
        }
      }
      return category;
    });
  };


  const handleAllCategory = () => {
    if (categories.length === 0) {
      getCategories();
    }
    setIsCategoryOpen((prev) => !prev);
  };

  const handleAllCategoryOld = () => {
    getCategories();
    setIsCategoryOpen(!isCategoryOpen);
  };

  // Load subcategories when hovering over a category
  const loadSubcategories = async (categoryId, parentType = "") => {
    await getCategories(categoryId, parentType);
  };




  const getUnreadNotifications = async () => {
    try {
      // const response = await LoginService.Queries.getUnreadNotifications();

      const response = await ConversationService.Queries.getUnreadNotifications();
      if (response && response.status === "success") {
        const nextCount = Number(response?.data?.unread_count);
        setUnreadNotificationCount(nextCount);
      }
    } catch (error) {
      console.log("Error fetching unread notifications:", error);
    }
  };


  // console.log("unreadNotificationCount", unreadNotificationCount);



  useEffect(() => {
    getCategories();
  }, []);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setIsCategoryOpen(false);
    const categoryType = String(category?.type || "").toLowerCase();

    if (isActiveMyShop) {
      const productType = categoryType === "vehicle" ? "vehicle" : "general";
      router.push(`/my-shop?product_type=${productType}&category_id=${category.id}`);
      return;
    }

    if (categoryType === "vehicle") {
      router.push("/");
      return;
    }

    // Navigate to general-products page with category ID
    router.push(`/general-products?category_id=${category.id}`);
  };

  const handleChange = (e) => {
    setSelectedShop(
      shops.find((shop) => shop.s_id === parseInt(e.target.value))
    )
  };


  let parsedUser = null;
  try {
    parsedUser = user ? (typeof user === 'string' ? JSON.parse(user) : user) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
  }

  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      setSearchQuery(query);
    } else {
      const lastSearch = localStorage.getItem('lastSearchQuery');
      if (lastSearch) {
        setSearchQuery(lastSearch);
      }
    }
  }, [searchParams]);


  useEffect(() => {
    if (shops.length > 0 && parsedUser) {

      const shopData = shops.map((shop) => ({
        value: shop.s_id,
        label: shop.s_title,
      }));

      setShopOptions(shopData);
    }
  }, [shops]);

  const isActivePbHome = pathname === '/pb-home/' || pathname === '/pb-home' || pathname === '/';
  const isActiveFilterProduct = pathname === '/filter-products/' || pathname === '/filter-products';
  const isActiveContactUs = pathname === '/contact-us/' || pathname === '/contact-us';
  const isActiveHowToUse = pathname === '/how-to-use/' || pathname === '/how-to-use';
  const isActiveAboutUs = pathname === '/about-us/' || pathname === '/about-us';
  const isActiveGeneralProduct = pathname === '/general-products/' || pathname === '/general-products';

  const isActiveMyShop = pathname === '/my-shop/' || pathname === '/my-shop';
  const isActiveCompanyShop = pathname === '/company-shop/' || pathname === '/company-shop';
  const isActiveProfile = pathname === '/profile/' || pathname === '/profile';
  const isActiveMemberShop = pathname === '/member-shop/' || pathname === '/member-shop';
  const isActiveUserShop = pathname === '/user-shop/' || pathname === '/user-shop';

  // Helper function to get source from current page
  const getCurrentPageSource = () => {
    // If already on search-results, preserve existing source
    if (pathname.includes('/search-results')) {
      return searchParams.get('source') || 'search-results';
    }

    // Determine source based on current page
    if (pathname === '/' || pathname === '') return 'home';
    if (pathname.includes('/my-shop')) return 'my-shop';
    if (pathname.includes('/company-shop')) return 'company-shop';
    if (pathname.includes('/member-shop')) return 'member-shop';
    if (pathname.includes('/user-shop')) return 'user-shop';
    if (pathname.includes('/pb-home')) return 'pb-home';
    if (pathname.includes('/all-products')) return 'all-products';
    if (pathname.includes('/general-products')) return 'general-products';
    if (pathname.includes('/product/')) return 'product-detail';
    if (pathname.includes('/cart')) return 'cart';
    if (pathname.includes('/dashboard')) return 'dashboard';

    // Default to pathname without slashes
    return pathname.replace(/\//g, '') || 'navbar';
  };

  // Helper function to build search URL with user ID if on my-shop page
  const buildSearchUrl = (query) => {
    let searchUrl = `/search-results?query=${encodeURIComponent(query)}`;

    // Add source parameter from current page
    const source = getCurrentPageSource();
    if (source) {
      searchUrl += `&source=${encodeURIComponent(source)}`;
    }

    // Add _shop_id if selectedShop exists
    if (selectedShop?.s_id) {
      searchUrl += `&_shop_id=${selectedShop.s_id}`;
    }

    // Check if we're on search-results page and preserve existing user_id and _shop_id
    const currentUserId = searchParams.get('user_id');
    const currentShopId = searchParams.get('_shop_id');

    // If user is on my-shop page and is logged in, add user ID parameter
    if (isActiveMyShop && user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser && parsedUser.id) {
          searchUrl += `&user_id=${parsedUser.id}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    // If we're on search-results page and there's already a user_id, preserve it
    else if (pathname.includes('/search-results') && currentUserId) {
      searchUrl += `&user_id=${currentUserId}`;
    }

    // Preserve existing _shop_id from URL if no new selectedShop
    if (pathname.includes('/search-results') && currentShopId && !selectedShop?.s_id) {
      searchUrl += `&_shop_id=${currentShopId}`;
    }

    return searchUrl;
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim()) {
      localStorage.setItem('lastSearchQuery', searchQuery);
      const searchUrl = buildSearchUrl(searchQuery);

      // If already on search-results page, update URL without navigation to avoid RSC request
      if (pathname.includes('/search-results')) {
        // Use window.history to update URL without triggering Next.js navigation
        window.history.replaceState({}, '', searchUrl);
        // Trigger a custom event to notify the search-results page to refresh
        window.dispatchEvent(new CustomEvent('searchQueryChanged', { detail: { url: searchUrl } }));
      } else {
        router.push(searchUrl);
      }
      setIsSearchOpen(false);
    }
  };

  // Handle search modal open
  const handleSearchOpen = () => {
    setIsSearchOpen(true);
    // Focus on input after modal opens
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="Press Enter"]');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  // click outside close
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }

      // Only close category dropdown if:
      // 1. Desktop category dropdown is open (categoryRef exists)
      // 2. Click is outside the desktop category dropdown
      // 3. Mobile menu is NOT open (to prevent interference with mobile categories)
      if (categoryRef.current && !categoryRef.current.contains(e.target) && !isMobileMenuOpen) {
        setIsCategoryOpen(false);
      }
    }

    // Both mouse and touch events for better mobile support
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Listen for notifications updated (e.g. mark as read on notifications page) so bell count updates immediately
  useEffect(() => {
    const onUpdated = () => setNotificationRefreshTrigger((t) => t + 1);
    window.addEventListener("notificationsUpdated", onUpdated);
    return () => window.removeEventListener("notificationsUpdated", onUpdated);
  }, []);

  // Fetch notification count and recent unread when user is logged in or auth_token exists; refresh every 2 minutes and when notificationsUpdated fires
  const NOTIFICATION_POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
  useEffect(() => {
    const hasAuth = !!user || (typeof window !== "undefined" && !!localStorage.getItem("auth_token"));
    if (!hasAuth) {
      setNotificationCount(0);
      setRecentNotifications([]);
      return;
    }
    let cancelled = false;
    const fetchNotifications = async () => {
      try {
        const response = await NotificationService.Queries.getNotifications({
          filter: "unread",
          page: 1,
          per_page: 5,
        });
        if (cancelled) return;
        const ok = response?.status === "success" || response?.success;
        const payload = response?.data ?? response;
        if (ok && payload) {
          setNotificationCount(payload.counts?.unread ?? 0);
          setRecentNotifications(Array.isArray(payload.data) ? payload.data : []);
        }
      } catch {
        if (!cancelled) {
          setNotificationCount(0);
          setRecentNotifications([]);
        }
      }
    };
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, NOTIFICATION_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user, pathname, notificationRefreshTrigger]);

  const setLogout = async () => {
    try {
      await LoginService.Commands.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        request: error?.request
      });
      // Continue with logout even if API call fails
    } finally {
      // Always clean up local storage and redirect
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      setUser(null);
      router.push("/");
    }
  };

  const openLoginModal = () => {
    setLoginOpen(true);
  };

  const closeLoginModal = () => {
    setLoginOpen(false);
  };

  const openForgotPasswordModal = () => {
    setLoginOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(false);
  };

  const openResetPasswordModal = () => {
    setIsForgotPasswordModalOpen(false);
    setIsResetPasswordModalOpen(true);
  };

  const closeResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
  };


   useEffect(() => {
    if (!parsedUser) return; // Only run if user is logged in

     getUnreadNotifications();
     
  }, [parsedUser]);



  // useEffect(() => {
  //   if (!parsedUser) return; // Only run if user is logged in

  //   const intervalId = setInterval(() => {
  //     getUnreadNotifications();
  //   }, 5000);

  //   return () => clearInterval(intervalId);
  // }, [parsedUser]);

  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-16 lg:px-32 py-1 border-b border-gray-300 text-gray-700">
        <div className="flex space-x-6 items-center">
          <Link href="/">
            <Image
              className="cursor-pointer w-20 md:w-20 h-12"
              src={assets.pilotBazarLogo}
              alt="logo"
            />
          </Link>

          {/* ALL CATEGORIES FORM MOBILE DEVICE */}
          {/* <div className="block md:hidden">
            {
              (parsedUser?.user_mode === 'supreme' || parsedUser?.user_mode === 'pbl') && (
                <div className="relative" ref={categoryRef}>
                  <button
                    onClick={handleAllCategory}
                    className="flex items-center gap-1 text-xs sm:text-sm transition duration-300 hover:text-gray-900 bg-orange-50 px-2 py-1 rounded-md border border-orange-200"
                  >
                    <SquareChartGantt className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Categories</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCategoryOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-lg border border-gray-200 z-50 w-[280px] max-h-[70vh] overflow-y-auto">            
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Browse Categories</h3>
                      </div>

                      <div>
                        {categories.map((category) => (
                          <CategoryMenuItem
                            key={category.id}
                            category={category}
                            onSelect={handleCategorySelect}
                            onLoadSubcategories={loadSubcategories}
                            isMobile={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }
          </div> */}


          <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
            <Link
              href="/pb-home"
              className={`transition duration-300 ${isActivePbHome
                ? 'text-black  bg-blue-600/10 border-b-2 border-blue-500 rounded-full px-4 py-1'
                : 'hover:text-gray-900'
                }`}
            >
              Stock
            </Link>
            {/* font-semibold bg-gray-300 border-b-2 border-black-500 rounded-full px-4 py-1 */}


            <Link
              href="/about-us"
              className={`transition duration-300 ${isActiveAboutUs
                ? 'text-black  bg-blue-600/10 border-b-2 border-blue-500 rounded-full px-4 py-1'
                : 'hover:text-gray-900'
                }`}
            >
              About
            </Link>

            <Link
              href="/contact-us"
              className={`transition duration-300 ${isActiveContactUs
                ? 'text-black  bg-blue-600/10 border-b-2 border-blue-500 rounded-full px-4 py-1'
                : 'hover:text-gray-900'
                }`}
            >
              Contact
            </Link>


            {/* {
              parsedUser?.user_mode === 'supreme' || parsedUser?.user_mode === 'pbl' ? (
                <Link
                  href="/general-products"
                  className={`transition duration-300 ${isActiveGeneralProduct
                    ? 'text-blue-600 font-semibold bg-orange-600/10 border-b-2 border-orange-500 rounded-full px-4 py-1'
                    : 'hover:text-gray-900'
                    }`}
                >
                  General Product
                </Link>
              ) : null
            } */}


            {
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={handleAllCategory}
                  className="flex items-center gap-1 transition duration-300 hover:text-gray-900"
                >
                  All Categories
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>


                {/* {
                  console.log("categories render:", categories)
                } */}

                {isCategoryOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-lg border border-gray-200 z-50 min-w-[250px]">
                    <div className="py-2">
                      {categories.map((category) => (
                        <CategoryMenuItem
                          key={category.id}
                          category={category}
                          onSelect={handleCategorySelect}
                          onLoadSubcategories={loadSubcategories}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            }

            {
              user ? (<Link
                href="/filter-products"
                // className={`transition duration-300 ${isActiveFilterProduct
                //   ? 'text-blue-600 font-semibold bg-orange-600/10 border-b-2 border-orange-500 rounded-full px-4 py-1'
                //   : 'hover:text-gray-900'
                //   }`}

                className={`transition duration-300 ${isActiveFilterProduct
                  ? 'text-black  bg-blue-600/10 border-b-2 border-blue-500 rounded-full px-4 py-1'
                  : 'hover:text-gray-900'
                  }`}


              >
                Filter Products
              </Link>)
                :
                (
                  <button
                    onClick={() => setShowLoginPrompt(true)}
                    className={`transition duration-300 ${isActiveFilterProduct
                      ? 'text-blue-600 font-semibold bg-orange-600/10 border-b-2 border-orange-500 rounded-full px-4 py-1'
                      : 'hover:text-gray-900'
                      }`}
                  >
                    Filter Products
                  </button>
                )
            }


            <Link
              href="/how-to-use"
              className={`transition duration-300 ${isActiveHowToUse
                ? 'text-black  bg-blue-600/10 border-b-2 border-blue-500 rounded-full px-4 py-1'
                : 'hover:text-gray-900'
                }`}
            >
              How to Use
            </Link>




          </div>
        </div>

        <ul className="hidden md:flex items-center gap-4 ">



          <div className="relative">
            <button onClick={handleSearchOpen} className="focus:outline-none">
              <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
            </button>
          </div>

          {/* shop dropdown */}
          {
            parsedUser && isActiveMyShop && (
              <div className="w-30">
                <ShopDropdown />
              </div>
            )
          }

          {/* company shop dropdown */}
          {
            parsedUser && isActiveCompanyShop && (
              <div className="w-30">
                <CompanyShopDropdown />
              </div>
            )
          }

          {user ? (
            <>
              <div className="flex items-center gap-4">
                {user &&
                  <MyHomePopover
                    setLogout={setLogout}
                    setIsNotificationOpen={setIsNotificationOpen}
                    unreadNotificationCount={unreadNotificationCount}
                  />
                }
              </div>
            </>
          ) : (
            <button
              className="flex items-center gap-2 hover:text-gray-900 transition"
              onClick={openLoginModal}
            >
              <Image src={assets.user_icon} alt="user icon" /> Login
            </button>
          )}


          <Link
            href="/compare"
            className="flex items-center gap-2 text-lg font-medium hover:text-cyan-600 transition relative"
            title="Compare products"
          >
            <div className="relative">
              <GitCompare className="h-6 w-6 text-gray-700" />
              {compareItems.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {compareItems.length}
                </span>
              )}
            </div>
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 text-lg font-medium hover:text-orange-500 transition relative"
          >
            <div className="relative">
              <Image src={assets.cart_icon} alt="cart icon" />
              {cartItems.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </div>
          </Link>





          <button
            type="button"
            onClick={() => setIsConversationOpen(true)}
            className="flex items-center gap-2 text-lg font-medium hover:text-orange-500 transition"
          >
            <svg
              className="h-7 w-7 text-blue-500"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.11 2 11.2c0 2.9 1.42 5.52 3.74 7.24V22l3.38-1.87c1.02.28 2.11.43 3.24.43 5.52 0 10-4.11 10-9.16S17.52 2 12 2zm.07 12.35l-2.55-2.72-4.87 2.72 5.34-5.68 2.55 2.72 4.87-2.72-5.34 5.68z" />
            </svg>
          </button>



          {/* <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            className="flex items-center gap-2 text-lg font-medium hover:text-orange-500 transition"
          >
            <svg
              className="h-7 w-7 text-blue-500"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.11 2 11.2c0 2.9 1.42 5.52 3.74 7.24V22l3.38-1.87c1.02.28 2.11.43 3.24.43 5.52 0 10-4.11 10-9.16S17.52 2 12 2zm.07 12.35l-2.55-2.72-4.87 2.72 5.34-5.68 2.55 2.72 4.87-2.72-5.34 5.68z" />
            </svg>
          </button> */}


          {(parsedUser?.user_mode === 'supreme' || parsedUser?.user_mode === 'admin') ? (
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 text-lg font-medium hover:text-orange-500 transition relative focus:outline-none"
                  aria-label="Notifications"
                >
                  <div className="relative">
                    <Bell className="w-6 h-6" />
                    <span className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                      {notificationCount}
                    </span>
                  </div>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  sideOffset={8}
                  align="end"
                  className="rounded-lg bg-white p-0 shadow-lg border border-gray-200 w-80 max-h-96 overflow-hidden z-[9999]"
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <ul className="overflow-y-auto max-h-72">
                    {recentNotifications.map((n) => (
                      <li key={n.id} className="border-b border-gray-100 last:border-b-0">
                        <Popover.Close asChild>
                          <Link
                            href={`/dashboard/notifications?highlight=${n.id}`}
                            className="block px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                          >
                            <p className="font-medium text-gray-900 text-sm truncate">{n.customer_name ?? "—"}</p>
                            <p className="text-gray-600 text-xs mt-0.5 truncate" title={n.search_history}>{n.search_history ?? "—"}</p>
                            <p className="text-gray-400 text-xs mt-1">{n.search_date_time ? new Date(n.search_date_time).toLocaleString() : "—"}</p>
                          </Link>
                        </Popover.Close>
                      </li>
                    ))}
                  </ul>
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-2">
                    <Popover.Close asChild>
                      <Link
                        href="/dashboard/notifications"
                        className="block text-center text-sm font-medium hover:opacity-90 transition"
                        style={{ color: 'rgb(1 103 162)' }}
                      >
                        View all notifications
                      </Link>
                    </Popover.Close>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ) : ''}

        </ul>

        {/* mobile device */}
        <div className="flex items-center md:hidden gap-3">

          <button onClick={handleSearchOpen} className="focus:outline-none">
            <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
          </button>

          {/* shop dropdown */}
          {
            parsedUser && isActiveMyShop && (
              <div className="w-15">
                <ShopDropdown />
              </div>
            )
          }

          {/* company shop dropdown */}
          {
            parsedUser && isActiveCompanyShop && (
              <div className="w-30">
                <CompanyShopDropdown />
              </div>
            )
          }


          <Link href="/compare" className="relative focus:outline-none" title="Compare products">
            <GitCompare className="h-5 w-5 text-gray-700" />
            {compareItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {compareItems.length}
              </span>
            )}
          </Link>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="focus:outline-none">
            <Image className="w-6 h-6" src={assets.menu_icon} alt="menu icon" />
          </button>
        </div>
        <Login isOpen={loginOpen} onClose={closeLoginModal} openForgotPasswordModal={openForgotPasswordModal} />
        <ForgotPasswordModal isOpen={isForgotPasswordModalOpen} onClose={closeForgotPasswordModal} openResetPasswordModal={openResetPasswordModal} />
        <ResetPasswordModal isOpen={isResetPasswordModalOpen} onClose={closeResetPasswordModal} />
        <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} onLoginClick={() => { setShowLoginPrompt(false); setLoginOpen(true); }} />
      </nav>
      {categories.length > 0 && (
        <section className="relative z-40 hidden border-b border-gray-200 bg-white md:block">
          <div className="px-4 md:px-16 lg:px-32">
            <div className="flex min-h-11 flex-wrap items-center gap-1 py-1">
              {categories.map((category) => (
                <TopCategoryMenuItem
                  key={category.id}
                  category={category}
                  onSelect={handleCategorySelect}
                  onLoadSubcategories={loadSubcategories}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-[#71abca] bg-opacity-90 z-[9999] flex items-center justify-center">
          <div className="relative bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-700">

            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-2 right-2 text-gray-300 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>


            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
        </div>
      )}


      {/* setIsConversationOpen */}

      <ConversationModal
        isOpen={isConversationOpen}
        onClose={() => setIsConversationOpen(false)}
        onOpenChat={(item) => {
          setChatProduct(item?.product || null);
          setChatConversationId(item?.conversationId || 0);
          setIsConversationOpen(false);
          setChatOpen(true);
        }}
      />


      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onOpenChat={(item) => {
          setChatProduct(item?.product || null);
          setChatConversationId(item?.conversationId || 0);
          setIsNotificationOpen(false);
          setChatOpen(true);
        }}
      />



      <ProductChatModal
        open={chatOpen}
        setOpen={setChatOpen}
        // product={chatProduct}
        conversationId={chatConversationId}
      />

      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              {
                parsedUser ? (
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      Hello, {parsedUser.name || parsedUser.username}
                    </p>
                    <p className="text-xs text-gray-500">Welcome back 👋</p>
                  </div>
                ) : (
                  <Image
                    className="cursor-pointer w-20"
                    onClick={() => { router.push("/"); setIsMobileMenuOpen(false); }}
                    src={assets.pilotBazarLogo}
                    alt="logo"
                  />
                )

              }


              <button onClick={() => setIsMobileMenuOpen(false)} className="focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-grow p-4 overflow-y-auto">
              <div className="flex flex-col items-start ">

                {/* All Categories Menu for Mobile */}
                <div className="w-full mb-2" onClick={(e) => e.stopPropagation()}>
                  <li className="flex items-center px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150">
                    <button
                      className="flex items-center gap-2 hover:text-gray-900 transition w-full justify-between"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAllCategory();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <SquareChartGantt className="h-4 w-4" />
                        All Categories
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </li>

                  {/* Categories Accordion */}
                  {isCategoryOpen && (
                    <div className="mt-1 bg-gray-50 rounded" onClick={(e) => e.stopPropagation()}>
                      {categories.map((category) => (
                        <CategoryMenuItem
                          key={category.id}
                          category={category}
                          onSelect={(cat) => {
                            handleCategorySelect(cat);
                            setIsMobileMenuOpen(false);
                          }}
                          onLoadSubcategories={loadSubcategories}
                          level={0}
                          isMobile={true}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <li className={`${isActivePbHome ? "border-l-4 md:border-l-[6px] w-full bg-gray-600/10 border-gray-500/90" : ""} flex items-center  px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                  <button
                    className="flex items-center gap-2 hover:text-gray-900 transition"
                    onClick={() => router.push("/pb-home")}
                  >
                    <House className="h-4 w-4" />
                    PB Home
                  </button>
                </li>

         
                {/* -------------------- */}

                {
                  parsedUser && (

                    <>

                      <li className={`${isActiveMyShop ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                        <button
                          className="flex items-center gap-2 hover:text-gray-900 transition"
                          onClick={() => router.push("/my-shop")}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          My Shop
                        </button>
                      </li>

                      <li className={`${isActiveCompanyShop ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                        <button
                          className="flex items-center gap-2 hover:text-gray-900 transition"
                          onClick={() => router.push("/company-shop")}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Company Shop
                        </button>
                      </li>

                      {
                        (parsedUser?.user_mode === 'supreme' || parsedUser?.user_mode === 'pbl' || parsedUser?.user_mode === 'admin') && (
                          <>
                            <li className={`${isActiveMemberShop ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                              <button
                                className="flex items-center gap-2 hover:text-gray-900 transition"
                                onClick={() => router.push("/member-shop")}
                              >
                                <ShoppingCart className="h-4 w-4" />
                                Member Shop
                              </button>
                            </li>

                            <li className={`${isActiveUserShop ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                              <button
                                className="flex items-center gap-2 hover:text-gray-900 transition"
                                onClick={() => router.push("/user-shop")}
                              >
                                <ShoppingCart className="h-4 w-4" />
                                User Shop
                              </button>
                            </li>
                          </>
                        )
                      }


                      <li className={`${isActiveProfile ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                        <button
                          className="flex items-center gap-2 hover:text-gray-900 transition"
                          onClick={() => router.push("/profile")}
                        >
                          <UserPen className="h-4 w-4" />
                          Profile
                        </button>
                      </li>
                    </>
                  )
                }

                {/* ------------------------- */}


                <li className={`${isActiveAboutUs ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                  <button
                    className="flex items-center gap-2 hover:text-gray-900 transition"
                    onClick={() => router.push("/about-us")}
                  >
                    <Info className="h-4 w-4" />
                    About
                  </button>
                </li>

                <li className={`${isActiveContactUs ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                  <button
                    className="flex items-center gap-2 hover:text-gray-900 transition"
                    onClick={() => router.push("/contact-us")}
                  >
                    <PhoneCall className="h-4 w-4" />
                    Contact
                  </button>
                </li>

                <li className={`${isActiveFilterProduct ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                  <button
                    className="flex items-center gap-2 hover:text-gray-900 transition"
                    onClick={() => {
                      if (!user) {
                        setShowLoginPrompt(true);
                      } else {
                        router.push("/filter-products");
                      }
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <ListFilterPlus className="h-4 w-4" />
                    Filter Products
                  </button>
                </li>

                
                <li className={`${isActiveHowToUse ? "border-l-4 md:border-l-[6px] w-full bg-orange-600/10 border-orange-500/90" : ""} flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:w-full rounded cursor-pointer transition-colors duration-150`}>
                  <button
                    className="flex items-center gap-2 hover:text-gray-900 transition"
                    onClick={() => router.push("/how-to-use")}
                  >
                    <PhoneCall className="h-4 w-4" />
                    How to Use
                  </button>
                </li>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">

              {
                parsedUser ? (
                  <li className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors duration-150">

                    <button
                      className="flex items-center gap-2 hover:text-gray-900 transition"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </li>
                ) : (
                  <li className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-green-600 rounded cursor-pointer transition-colors duration-150">
                    <button
                      className="flex items-center gap-2 hover:text-gray-900 transition"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setLoginOpen(true);
                      }}
                    >
                      <User className="h-5 w-5 text-green-600" />
                      Login
                    </button>
                  </li>
                )
              }
            </div>
          </div>
        </div>
      </div>



    </>
  );
};

const Navbar = () => {
  return (
    <Suspense fallback={<Loading />}>
      <NavbarContent />
    </Suspense>
  );
};

export default Navbar;
