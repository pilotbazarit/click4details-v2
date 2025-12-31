import { useAppContext } from "@/context/AppContext";
import {
  Box,
  Boxes,
  ChevronDown,
  ChevronRight,
  Database,
  DatabaseZap,
  FileText,
  Headset,
  History,
  LayoutDashboard,
  LayoutList,
  ListChecks,
  MessageSquare,
  MessageSquareText,
  MessageSquareWarning,
  Package,
  PackageCheck,
  PackageSearch,
  Settings,
  Store,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

const SideBar = () => {
  const pathname = usePathname();
  const { user, loading } = useAppContext();

  // parsedUser shobar age set hobe - memoized to avoid re-parsing
  const parsedUser = useMemo(() => {
    if (!user) return null;
    try {
      return typeof user === "string" ? JSON.parse(user) : user;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  }, [user]);

  const customerCareMenuItems = [
    {
      name: "Customer care",
      icon: Headset, // Changed from Users to Headset
      children: [
        {
          name: "CC Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Customers",
          path: "/dashboard/customers",
          icon: Users,
        },
        {
          name: "Conversation Archives",
          path: "/dashboard/conversation-archives",
          icon: MessageSquareText,
        },
        {
          name: "Followups",
          path: "/dashboard/followups",
          icon: History,
        },
        // {
        //   name: "Followup Messages",
        //   path: "/dashboard/followup-messages",
        //   icon: MailQuestion,
        // },
        {
          name: "Feedbacks",
          path: "/dashboard/feedbacks",
          icon: MessageSquareWarning,
        },
        {
          name: "Setup",
          icon: Settings,
          children: [
            {
              name: "Messages",
              path: "/dashboard/settings/messages",
              icon: MessageSquare,
            },
            {
              name: "Feedback Templates",
              path: "/dashboard/settings/feedback-templates",
              icon: FileText,
            },
            {
              name: "Followup Packages",
              path: "/dashboard/settings/followup-package",
              icon: Package,
            },
            {
              name: "Feedback Categories",
              path: "/dashboard/settings/feedback-categories",
              icon: LayoutList,
            },
          ],
        },
      ],
    },
  ];

  const defaultMenuItems = [
    {
      name: "Products",
      path: "/dashboard/product-list/",
      icon: PackageSearch,
    },
    {
      name: "Archive Products",
      path: "/dashboard/archive-product-list/",
      icon: PackageSearch,
    },
    {
      name: "General Products",
      path: "/dashboard/products/general-product/list/",
      icon: PackageSearch,
    },
    {
      name: "Shop List",
      path: "/dashboard/shop/",
      icon: Store,
    },
    {
      name: "Users",
      icon: Users,
      children: [
        {
          name: "User List",
          path: "/dashboard/users/",
          icon: Users,
        },
        {
          name: "Role List",
          path: "/dashboard/roles/",
          icon: UserCog,
        },
        {
          name: "Permission List",
          path: "/dashboard/permissions/",
          icon: Users,
        },
      ],
    },
    {
      name: "Settings",
      icon: Settings,
      children: [
        {
          name: "Master Data Type",
          path: "/dashboard/settings/master-data-type/",
          icon: DatabaseZap,
        },
        {
          name: "Master Data",
          path: "/dashboard/settings/master-data/",
          icon: Database,
        },
        {
          name: "Models",
          path: "/dashboard/model/",
          icon: Box,
        },
        {
          name: "Categories",
          path: "/dashboard/category/",
          icon: Box,
        },
        {
          name: "Packages",
          path: "/dashboard/package/",
          icon: Boxes,
        },
        {
          name: "Feature SFC List",
          path: "/dashboard/feature-specification/",
          icon: ListChecks,
        },
        {
          name: "Package Edition",
          path: "/dashboard/package-edition/",
          icon: PackageCheck,
        },
        {
          name: "Location List",
          path: "/dashboard/location/",
          icon: ListChecks,
        },
        {
          name: "Outlet List",
          path: "/dashboard/outlets/",
          icon: ListChecks,
        },
        {
          name: "Change Password",
          path: "/dashboard/change-password/",
          icon: Users,
        },
      ],
    },
  ];

  // menuItems parsedUser set howar por set hobe
  const menuItems = useMemo(() => {
    if (parsedUser?.user_mode === "admin") {
      // admin hole Customer care + default menu items (Products, Settings etc) dekhbe
      return [...customerCareMenuItems, ...defaultMenuItems];
    }
    if (parsedUser?.user_mode === "pbl" || parsedUser?.user_mode === "supreme") {
      return [...customerCareMenuItems, ...defaultMenuItems];
    }
    return defaultMenuItems;
  }, [parsedUser?.user_mode]);

  // console.log("parsedUser", parsedUser?.user_mode);
  // console.log("menuItems", menuItems);

  // isMenuActive function - pathname er sathe menu check kore
  const isMenuActive = useMemo(() => {
    return (menuItem) => {
      if (!menuItem) return false;

      if (menuItem.path) {
        if (menuItem.path === "/dashboard") {
          return pathname === "/dashboard" || pathname === "/dashboard/";
        }
        if (pathname === menuItem.path || pathname.startsWith(menuItem.path + "/")) {
          return true;
        }
      }

      if (menuItem.children) {
        return menuItem.children.some((child) => isMenuActive(child));
      }

      return false;
    };
  }, [pathname]);

  // expandedMenus state - parsedUser ebong menuItems ready howar por initialize hobe
  const [expandedMenus, setExpandedMenus] = useState({});

  // parsedUser ebong menuItems set howar por expandedMenus initialize korbo
  useEffect(() => {
    if (!parsedUser || menuItems.length === 0) return;

    const initialExpanded = {};
    menuItems.forEach((item) => {
      if (item.children && isMenuActive(item)) {
        initialExpanded[item.name] = true;
      }
    });
    setExpandedMenus(initialExpanded);
  }, [parsedUser, menuItems, isMenuActive]);

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  if (loading) {
    return <div className="w-64 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col"></div>;
  }

  // visibleMenuItems parsedUser ebong menuItems er upor depend kore set hobe
  const visibleMenuItems = useMemo(() => {
    if (!parsedUser) return [];

    return menuItems.map((item) => {
      // If item has children, filter them based on user_mode
      // console.log("item", item);
      if (item.children) {
        const filteredChildren = item.children.filter((child) => {
          // Admin user er jonno Customer Care menu filtering
          if (parsedUser?.user_mode === "admin" && item.name === "Customer care") {
            // Admin sudhu Setup dekhbe, baki CC Dashboard, Customers etc dekhbe na
            return child.name === "Setup";
          }

          // Setup submenu sudhu admin ebong supreme dekhte parbe
          if (child.name === "Setup" && parsedUser?.user_mode !== "admin" && parsedUser?.user_mode !== "supreme") {
            return false;
          }

          // Settings menu filtering for 'user', 'member', and 'partner' mode - sudhu Outlet List ebong Change Password dekhbe
          if (item.name === "Settings" && (parsedUser?.user_mode === "user" || parsedUser?.user_mode === "member" || parsedUser?.user_mode === "partner")) {
            return child.name === "Outlet List" || child.name === "Change Password";
          }

          return true;
        });

        return {
          ...item,
          children: filteredChildren
        };
      }
      return item;
    }).filter((item) => {
      // Users menu sudhu supreme dekhte parbe
      if (item.name === "Users") {
        return parsedUser?.user_mode === "supreme";
      }

      // pbl user specific menus hide korbe
      if (parsedUser?.user_mode === "pbl") {
        const hiddenMenusForPbl = ["Products", "Archive Products", "General Products", "Shop List", "Settings"];
        if (hiddenMenusForPbl.includes(item.name)) {
          return false;
        }
      }

      // admin, supreme, pbl - shobi dekhbe (filter e pass korbe)
      if (parsedUser?.user_mode === "admin" || parsedUser?.user_mode === "supreme" || parsedUser?.user_mode === "pbl") {
        return true;
      } else if (parsedUser?.user_mode === "user" || parsedUser?.user_mode === "member" || parsedUser?.user_mode === "partner") {
        // user, member, partner mode hole Products, Shop List ebong Settings (Outlet List soho) dekhbe
        return item.name === "Products" || item.name === "Shop List" || item.name === "Settings";
      } else {
        // onno user mode hole sudhu Products dekhbe
        return item.name === "Products";
      }
    });
  }, [parsedUser, menuItems]);

  // return item.name === "Products" || item.name === "General Products" || item.name === "Settings";

  // console.log("Parsed User:", menuItems);

  return (
    <div className="w-64 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col">
      {/* Menu Items */}
      {visibleMenuItems.map((item) => {
        const isActive = isMenuActive(item);

        if (item.children) {
          const isExpanded = expandedMenus[item.name];
          return (
            <div key={item.name}>
              {/* Parent Menu Item */}
              <div
                className={`flex items-center justify-between py-3 px-4 gap-3 cursor-pointer hover:bg-gray-100/90 border-white`}
                onClick={() => toggleMenu(item.name)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-7 h-7 text-gray-600" />
                  <p className="text-center capitalize">{item.name}</p>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
              </div>

              {/* Child Menu Items */}
              {isExpanded && item.children && (
                <div className="ml-4">
                  {item.children.map((child) => {
                    const isChildActiveState = isMenuActive(child);

                    if (child.children) {
                      const isChildExpanded = expandedMenus[child.name];
                      return (
                        <div key={child.name}>
                          {/* Parent Menu Item (for the child) */}
                          <div
                            className={`flex items-center justify-between py-3 px-4 gap-3 cursor-pointer hover:bg-gray-100/90 border-white`}
                            onClick={() => toggleMenu(child.name)}
                          >
                            <div className="flex items-center gap-3">
                              <child.icon className="w-7 h-7 text-gray-600" />
                              <p className="text-center">{child.name}</p>
                            </div>
                            {isChildExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                          </div>

                          {/* Grand-child Menu Items */}
                          {isChildExpanded && child.children && (
                            <div className="ml-4">
                              {child.children.map((grandchild) => {
                                const isGrandChildActiveState = isMenuActive(grandchild);
                                return (
                                  <Link href={grandchild.path} key={grandchild.name} passHref>
                                    <div
                                      className={`flex items-center py-2 px-4 gap-3 ${isGrandChildActiveState ? "border-r-[6px] bg-orange-600/10 border-orange-500/90" : "hover:bg-gray-100/90 border-white"
                                        }`}
                                    >
                                      <grandchild.icon className="w-5 h-5 text-gray-600" />
                                      <p className="text-sm">{grandchild.name}</p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link href={child.path} key={child.name} passHref>
                        <div
                          className={`flex items-center py-2 px-4 gap-3 ${isChildActiveState ? "border-r-[6px] bg-orange-600/10 border-orange-500/90" : "hover:bg-gray-100/90 border-white"
                            }`}
                        >
                          <child.icon className="w-5 h-5 text-gray-600" />
                          <p className="text-sm">{child.name}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link href={item.path} key={item.name} passHref>
            <div
              className={`flex items-center py-3 px-4 gap-3 ${isActive ? "border-r-[6px] bg-orange-600/10 border-orange-500/90" : "hover:bg-gray-100/90 border-white"
                }`}
            >
              <item.icon className="w-7 h-7 text-gray-600" />
              <p className="text-center">{item.name}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SideBar;
