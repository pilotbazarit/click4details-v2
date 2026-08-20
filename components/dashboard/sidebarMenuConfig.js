import {
  Box,
  Boxes,
  Building2,
  ClipboardList,
  Database,
  DatabaseZap,
  FileText,
  Gift,
  Headset,
  History,
  LayoutDashboard,
  LayoutList,
  List,
  ListChecks,
  Lock,
  MessageSquare,
  MessageSquareText,
  MessageSquareWarning,
  Package,
  PackageCheck,
  PackageSearch,
  Receipt,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";

const ADMIN = "admin";
const SUPREME = "supreme";
const PBL = "pbl";
const USER = "user";
const MEMBER = "member";
const PARTNER = "partner";

const ADMIN_AND_SUPREME = [ADMIN, SUPREME];
const CUSTOMER_CARE_MODES = [ADMIN, SUPREME, PBL];
const SELLER_MODES = [ADMIN, SUPREME, USER, MEMBER, PARTNER, PBL];

// Dashboard menu rules stay in one place so Sidebar and future middleware
// can rely on the same access model.
export const dashboardMenuItems = [

  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    // allowedModes: [ADMIN, SUPREME, PBL],
    // requiredPermission: {
    //   section: "Cart",
    //   action: "CartListMenuShow",
    //   appliesToModes: [ADMIN, PBL],
    //   pblShopId: 0,
    // },
  },

  {
    name: "Customer care",
    icon: Headset,
    allowedModes: [ADMIN, SUPREME, PBL],
    requiredPermission: {
      section: "CustomerCare",
      action: "CustomerCareMenuShow",
      appliesToModes: [PBL, ADMIN],
      pblShopId: 0,
    },
    children: [
      {
        name: "CC Dashboard",
        path: "/dashboard/cc-dashboard",
        icon: LayoutDashboard,
        allowedModes: [SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "CustomerCare",
          action: "CustomerCareDashboardMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Customers",
        path: "/dashboard/customers",
        icon: Users,
        allowedModes: [SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "CustomerCare",
          action: "CustomersMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Conversation Archives",
        path: "/dashboard/conversation-archives",
        icon: MessageSquareText,
        allowedModes: [SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "CustomerCare",
          action: "ConversationArchivesMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Followups",
        path: "/dashboard/followups",
        icon: History,
        allowedModes: [SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "CustomerCare",
          action: "FollowupsMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Feedbacks",
        path: "/dashboard/feedbacks",
        icon: MessageSquareWarning,
        allowedModes: [SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "CustomerCare",
          action: "FeedbacksMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Team",
        path: "/dashboard/teams",
        icon: Users,
        allowedModes: [SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "CustomerCare",
          action: "TeamMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Sales Team Activity",
        path: "/dashboard/sales-team-activity",
        icon: FileText,
        allowedModes: [SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "CustomerCare",
          action: "SalesTeamActivityMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Setup",
        icon: Settings,
        allowedModes: [SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "CustomerCare",
          action: "CustomerCareSetupMenu",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
        children: [
          {
            name: "Messages",
            path: "/dashboard/settings/messages",
            icon: MessageSquare,
            allowedModes: [SUPREME, PBL, ADMIN],
            requiredPermission: {
              section: "CustomerCare",
              action: "CustomerCareMessagesMenuShow",
              appliesToModes: [PBL, ADMIN],
              pblShopId: 0,
            },
          },
          {
            name: "Feedback Templates",
            path: "/dashboard/settings/feedback-templates",
            icon: FileText,
            allowedModes: [SUPREME, PBL, ADMIN],
            requiredPermission: {
              section: "CustomerCare",
              action: "CustomerCareFeedbackTemplatesMenuShow",
              appliesToModes: [PBL, ADMIN],
              pblShopId: 0,
            },
          },
          {
            name: "Followup Packages",
            path: "/dashboard/settings/followup-package",
            icon: Package,
            allowedModes: [SUPREME, PBL, ADMIN],
            requiredPermission: {
              section: "CustomerCare",
              action: "CustomerCareFollowupPackageMenuShow",
              appliesToModes: [PBL, ADMIN],
              pblShopId: 0,
            }
          },
          {
            name: "Feedback Categories",
            path: "/dashboard/settings/feedback-categories",
            icon: LayoutList,
            allowedModes: [SUPREME, PBL, ADMIN],
            requiredPermission: {
              section: "CustomerCare",
              action: "CustomerCareFeedbackCategoriesMenuShow",
              appliesToModes: [PBL, ADMIN],
              pblShopId: 0,
            }
          },
        ],
      },
    ],
  },

  {
    name: "Accounts",
    icon: UserCog,
    allowedModes: [ADMIN, SUPREME, PBL],
    // requiredPermission: {
    //   section: "Accounts",
    //   action: "AccountsMenuShow",
    //   appliesToModes: [PBL, ADMIN],
    //   pblShopId: 0,
    // },
    children: [
      {
        name: "Vehicle Purchase Calculation & Payment",
        path: "/dashboard/products/purchase-payments",
        icon: FileText,
        allowedModes: [SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "SidebarMenu",
          action: "VehiclePurchasCalculationPaymentMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      // {
      //   name: "Account List",
      //   path: "/dashboard/accounts",
      //   icon: List,
      //   allowedModes: [ADMIN, SUPREME, PBL],
      //   requiredPermission: {
      //     section: "Accounts",
      //     action: "AccountListMenuShow",
      //     appliesToModes: [PBL, ADMIN],
      //     pblShopId: 0,
      //   },
      // },
    ],
  },


  {
    name: "Products",
    icon: PackageSearch,
    allowedModes: [ADMIN, SUPREME, USER, MEMBER, PARTNER, PBL],
    requiredPermission: {
      section: "Vehicle",
      action: "ProductMenuShow",
      appliesToModes: [PBL, ADMIN],
      pblShopId: 0,
    },
    children: [
      {
        name: "Product List",
        path: "/dashboard/product-list/",
        icon: PackageSearch,
        requiredPermission: {
          section: "Vehicle",
          action: "ProductListMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Recycled Products",
        path: "/dashboard/recycled-product-list/",
        icon: PackageSearch,
        allowedModes: [ADMIN, SUPREME, PBL],
        // allowedModes: ADMIN_AND_SUPREME,
        requiredPermission: {
          section: "Vehicle",
          action: "RecycledProductsMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Archived Products",
        path: "/dashboard/archive-product-list/",
        icon: PackageSearch,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Vehicle",
          action: "ArchivedProductsMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Requested Products",
        path: "/dashboard/requested-product/",
        icon: PackageSearch,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Vehicle",
          action: "RequestedProductsMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "General Products",
        path: "/dashboard/products/general-product/list/",
        icon: PackageSearch,
        // allowedModes: ADMIN_AND_SUPREME,
        requiredPermission: {
          section: "Vehicle",
          action: "GeneralProductsMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        }
      },
      // {
      //   name: "Vehicle Purchase Calculation & Payment",
      //   path: "/dashboard/products/purchase-payments/",
      //   icon: Receipt,
      //   requiredPermission: {
      //     section: "PurchasePayment",
      //     action: "PurchasePaymentMenuShow",
      //     appliesToModes: [ADMIN, PBL],
      //     pblShopId: 0,
      //   },
      // },
    ],
  },
  {
    name: "Orders",
    icon: List,
    allowedModes: [ADMIN, SUPREME, PBL],
    requiredPermission: {
      section: "Order",
      action: "OrdersMenuShow",
      appliesToModes: [ADMIN, PBL],
      pblShopId: 0,
    },
    children: [
      {
        name: "Pending Orders",
        path: "/dashboard/order-list/pending",
        icon: Users,
        requiredPermission: {
          section: "Order",
          action: "PendingOrdersMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Quick Orders",
        path: "/dashboard/order-list/quick_order",
        icon: Users,
        requiredPermission: {
          section: "Order",
          action: "QuickOrdersMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Processing Orders",
        path: "/dashboard/order-list/processing",
        icon: Users,
        requiredPermission: {
          section: "Order",
          action: "ProcessingOrdersMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Completed Orders",
        path: "/dashboard/order-list/completed",
        icon: Users,
        requiredPermission: {
          section: "Order",
          action: "CompletedOrdersMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Cancelled Orders",
        path: "/dashboard/order-list/cancelled",
        icon: Users,
        requiredPermission: {
          section: "Order",
          action: "CancelledOrdersMenuShow",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
    ],
  },
  {
    name: "POS Sale",
    icon: ShoppingCart,
    allowedModes: [ADMIN, SUPREME, USER, MEMBER, PARTNER, PBL],
    requiredPermission: {
      section: "Order",
      action: "PosMenuShow",
      appliesToModes: [ADMIN, PBL],
      pblShopId: 0,
    },
    children: [
      {
        name: "POS Terminal",
        path: "/dashboard/pos-sale",
        icon: Receipt,
        requiredPermission: {
          section: "Order",
          action: "PosCreate",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Sales History",
        path: "/dashboard/pos-sale/history",
        icon: History,
        requiredPermission: {
          section: "Order",
          action: "PosView",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
    ],
  },
  {
    name: "Cart List",
    path: "/dashboard/cart-list",
    icon: PackageSearch,
    allowedModes: [ADMIN, SUPREME, PBL],
    requiredPermission: {
      section: "Cart",
      action: "CartListMenuShow",
      appliesToModes: [ADMIN, PBL],
      pblShopId: 0,
    },
  },
  {
    name: "Secret Information",
    path: "/dashboard/secret-information",
    icon: Lock,
    allowedModes: [ADMIN, SUPREME, PBL],
    requiredPermission: {
      section: "Vehicle",
      action: "SecretData",
      appliesToModes: [ADMIN, PBL],
      pblShopId: 0,
    },
  },
  {
    name: "User Activity Logs",
    path: "/dashboard/user-activity-logs",
    icon: History,
    allowedModes: [ADMIN, SUPREME, PBL],
    requiredPermission: {
      section: "UserActivityLog",
      action: "View",
      appliesToModes: [ADMIN, PBL],
      pblShopId: 0,
    },
  },
  {
    name: "Shop List",
    path: "/dashboard/shop/",
    icon: Store,
    allowedModes: [ADMIN, SUPREME, USER, MEMBER, PARTNER, PBL],
    requiredPermission: {
      section: "Shop",
      action: "ShopListMenuShow",
      appliesToModes: [ADMIN, PBL],
      pblShopId: 0,
    }
  },
  {
    name: "Shop Operations",
    icon: Warehouse,
    allowedModes: SELLER_MODES,
    children: [
      {
        name: "Stock Management",
        path: "/dashboard/shop-operations/stock",
        icon: Warehouse,
        requiredPermission: {
          section: "Stock",
          action: "List",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Inventory Ledger",
        path: "/dashboard/shop-operations/inventory",
        icon: ClipboardList,
        requiredPermission: {
          section: "Inventory",
          action: "List",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
      {
        name: "Purchase Management",
        path: "/dashboard/shop-operations/purchases",
        icon: Truck,
        requiredPermission: {
          section: "Purchase",
          action: "List",
          appliesToModes: [ADMIN, PBL],
          pblShopId: 0,
        },
      },
    ],
  },
  {
    name: "Conversation List",
    path: "/dashboard/conversation/",
    icon: Store,
    allowedModes: [SUPREME, PBL, ADMIN],
    requiredPermission: {
      section: "Conversation",
      action: "ConversationListMenuShow",
      appliesToModes: [ADMIN, PBL],
      pblShopId: 0,
    }
  },
  {
    name: "Users",
    icon: Users,
    allowedModes: [SUPREME, PBL, ADMIN],
    requiredPermission: {
      section: "User",
      action: "UsersMenuShow",
      appliesToModes: [PBL, ADMIN],
      pblShopId: 0,
    },
    children: [
      {
        name: "User List",
        path: "/dashboard/users/",
        icon: Users,
        requiredPermission: {
          section: "User",
          action: "UserListMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        }
      },
      {
        // Backend gate (User.Create) was never seeded for any role but
        // supreme's wildcard bypass, so menu visibility mirrors that
        // reality rather than promising access other roles don't have yet.
        name: "Add User",
        path: "/dashboard/users/create/",
        icon: Users,
        allowedModes: [SUPREME],
      },
      {
        name: "Role List",
        path: "/dashboard/roles/",
        icon: UserCog,
        requiredPermission: {
          section: "User",
          action: "RoleListMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        }
      },
      {
        name: "Permission List",
        path: "/dashboard/permissions/",
        icon: Users,
        requiredPermission: {
          section: "User",
          action: "PermissionListMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        }
      },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    allowedModes: [ADMIN, SUPREME, USER, MEMBER, PARTNER, PBL],
    requiredPermission: {
      section: "Settings",
      action: "SettingsMenuShow",
      appliesToModes: [PBL, ADMIN],
      pblShopId: 0,
    },
    children: [
      {
        name: "Master Data Type",
        path: "/dashboard/settings/master-data-type/",
        icon: DatabaseZap,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "MasterDataTypeMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Master Data",
        path: "/dashboard/settings/master-data/",
        icon: Database,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "MasterDataMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Suppliers",
        path: "/dashboard/settings/suppliers/",
        icon: Building2,
        allowedModes: [ADMIN, SUPREME, USER, MEMBER, PARTNER, PBL],
        requiredPermission: {
          section: "Supplier",
          action: "List",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Preset Queestion & Answer",
        path: "/dashboard/settings/preset-question-answer/",
        icon: Box,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "PresetQuestionAnswerMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Preset Suggestions",
        path: "/dashboard/settings/preset-suggestions/",
        icon: Box,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "PresetSuggestionsMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Payment List",
        path: "/dashboard/settings/payment-list/",
        icon: Box,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "PaymentListMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Models",
        path: "/dashboard/model/",
        icon: Box,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "ModelsMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Categories",
        path: "/dashboard/category/",
        icon: Box,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "CategoriesMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "SEO Metadata",
        path: "/dashboard/seo-metadata/",
        icon: Box,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "SEOMetadataMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Packages",
        path: "/dashboard/package/",
        icon: Boxes,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "PackagesMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Gift Management",
        path: "/dashboard/gifts/",
        icon: Gift,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Gift",
          action: "GiftManagementMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Feature SFC List",
        path: "/dashboard/feature-specification/",
        icon: ListChecks,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "FeatureSpecificationMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Package Edition",
        path: "/dashboard/package-edition/",
        icon: PackageCheck,
        allowedModes: [ADMIN, SUPREME, PBL],
        requiredPermission: {
          section: "Settings",
          action: "PackageEditionMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Location List",
        path: "/dashboard/location/",
        icon: ListChecks,
        allowedModes: [ADMIN, SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "Settings",
          action: "LocationListMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Outlet List",
        path: "/dashboard/outlets/",
        icon: ListChecks,
        requiredPermission: {
          section: "Settings",
          action: "OutletListMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "Contact Customer List",
        path: "/dashboard/contact-customers/",
        icon: UserCog,
        allowedModes: [ADMIN, SUPREME, USER, MEMBER, PARTNER, PBL],
        requiredPermission: {
          section: "Settings",
          action: "ContactCustomerListMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        name: "System Documents",
        path: "/dashboard/system-document/",
        icon: Users,
        allowedModes: [ADMIN, SUPREME, PBL, ADMIN],
        requiredPermission: {
          section: "Settings",
          action: "SystemDocumentsMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
      {
        // Superadmin-only platform config (GTM, SMS, shipping, payment
        // gateways, couriers) - menu visibility is cosmetic, the real
        // gate is the backend (SystemSettingController, supreme-only) and
        // this page's own useAppContext() check, since any authenticated
        // user could otherwise hit the URL directly.
        name: "System Setup",
        path: "/dashboard/settings/system-setup/",
        icon: SlidersHorizontal,
        allowedModes: [SUPREME],
      },
      {
        name: "Change Password",
        path: "/dashboard/change-password/",
        icon: Users,
        requiredPermission: {
          section: "Settings",
          action: "ChangePasswordMenuShow",
          appliesToModes: [PBL, ADMIN],
          pblShopId: 0,
        },
      },
    ],
  },
];
