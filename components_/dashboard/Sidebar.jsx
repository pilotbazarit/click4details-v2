import { useAppContext } from "@/context/AppContext";
import { filterDashboardMenuTree, matchesDashboardPath } from "@/lib/dashboardMenuAccess";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dashboardMenuItems } from "./sidebarMenuConfig";

const SideBar = () => {
  const pathname = usePathname();
  const { user, loading, permissionList, selectedCompanyShop } = useAppContext();
  const [expandedMenus, setExpandedMenus] = useState({});

  const parsedUser = useMemo(() => {
    if (!user) return null;

    try {
      return typeof user === "string" ? JSON.parse(user) : user;
    } catch (error) {
      console.error("Failed to parse user data:", error);
      return null;
    }
  }, [user]);


  const visibleMenuItems = useMemo(() => {
    if (!parsedUser?.user_mode) return [];

    return filterDashboardMenuTree(dashboardMenuItems, {
      userMode: parsedUser.user_mode,
      permissionList,
      companyShopId: selectedCompanyShop?.shop?.s_id,
    });
  }, [parsedUser?.user_mode, permissionList, selectedCompanyShop?.shop?.s_id]);

  const isMenuActive = useMemo(() => {
    const checkActiveState = (menuItem) => {
      if (!menuItem) return false;

      if (menuItem.path && matchesDashboardPath(pathname, menuItem.path)) {
        return true;
      }

      if (menuItem.children) {
        return menuItem.children.some((child) => checkActiveState(child));
      }

      return false;
    };

    return checkActiveState;
  }, [pathname]);

  useEffect(() => {
    if (!parsedUser || visibleMenuItems.length === 0) return;

    const initialExpanded = {};

    visibleMenuItems.forEach((item) => {
      if (item.children && isMenuActive(item)) {
        initialExpanded[item.name] = true;
      }
    });

    setExpandedMenus(initialExpanded);
  }, [parsedUser, visibleMenuItems, isMenuActive]);

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  if (loading) {
    return <div className="w-64 border-r h-full text-base border-gray-300 py-2 flex flex-col overflow-y-auto"></div>;
  }

  return (
    <div className="w-64 border-r h-full text-base border-gray-300 py-2 flex flex-col overflow-y-auto sidebar-scroll">
      {visibleMenuItems.map((item) => {
        const isActive = isMenuActive(item);

        if (item.children) {
          const isExpanded = expandedMenus[item.name];

          return (
            <div key={item.name}>
              <div
                className="flex items-center justify-between py-3 px-4 gap-3 cursor-pointer hover:bg-gray-100/90 border-white"
                onClick={() => toggleMenu(item.name)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-7 h-7 text-gray-600" />
                  <p className="text-center capitalize">{item.name}</p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </div>

              {isExpanded && item.children && (
                <div className="ml-4">
                  {item.children.map((child) => {
                    const isChildActiveState = isMenuActive(child);

                    if (child.children) {
                      const isChildExpanded = expandedMenus[child.name];

                      return (
                        <div key={child.name}>
                          <div
                            className="flex items-center justify-between py-3 px-4 gap-3 cursor-pointer hover:bg-gray-100/90 border-white"
                            onClick={() => toggleMenu(child.name)}
                          >
                            <div className="flex items-center gap-3">
                              <child.icon className="w-7 h-7 text-gray-600" />
                              <p className="text-center">{child.name}</p>
                            </div>
                            {isChildExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </div>

                          {isChildExpanded && child.children && (
                            <div className="ml-4">
                              {child.children.map((grandchild) => {
                                const isGrandChildActiveState = isMenuActive(grandchild);

                                return (
                                  <Link href={grandchild.path} key={grandchild.name} passHref>
                                    <div
                                      className={`flex items-center py-2 px-4 gap-3 ${
                                        isGrandChildActiveState
                                          ? "border-r-[6px] bg-orange-600/10 border-orange-500/90"
                                          : "hover:bg-gray-100/90 border-white"
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
                          className={`flex items-center py-2 px-4 gap-3 ${
                            isChildActiveState
                              ? "border-r-[6px] bg-orange-600/10 border-orange-500/90"
                              : "hover:bg-gray-100/90 border-white"
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
              className={`flex items-center py-3 px-4 gap-3 ${
                isActive
                  ? "border-r-[6px] bg-orange-600/10 border-orange-500/90"
                  : "hover:bg-gray-100/90 border-white"
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
