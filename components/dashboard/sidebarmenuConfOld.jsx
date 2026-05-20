import {
  Box,
  Boxes,
  Database,
  DatabaseZap,
  FileText,
  Headset,
  History,
  LayoutDashboard,
  LayoutList,
  List,
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

const ADMIN = "admin";
const SUPREME = "supreme";
const PBL = "pbl";
const USER = "user";
const MEMBER = "member";
const PARTNER = "partner";

const ADMIN_AND_SUPREME = [ADMIN, SUPREME];
const CUSTOMER_CARE_MODES = [ADMIN, SUPREME, PBL];
const SELLER_MODES = [ADMIN, SUPREME, USER, MEMBER, PARTNER];

// Dashboard menu rules stay in one place so Sidebar and future middleware
// can rely on the same access model.
export const dashboardMenuItems = [
  {
    name: "Customer care",
    icon: Headset,
    allowedModes: CUSTOMER_CARE_MODES,
    children: [
      {
        name: "CC Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        allowedModes: [SUPREME, PBL],
      },
      {
        name: "Customers",
        path: "/dashboard/customers",
        icon: Users,
        allowedModes: [SUPREME, PBL],
      },
      {
        name: "Conversation Archives",
        path: "/dashboard/conversation-archives",
        icon: MessageSquareText,
        allowedModes: [SUPREME, PBL],
      },
      {
        name: "Followups",
        path: "/dashboard/followups",
        icon: History,
        allowedModes: [SUPREME, PBL],
      },
      {
        name: "Feedbacks",
        path: "/dashboard/feedbacks",
        icon: MessageSquareWarning,
        allowedModes: [SUPREME, PBL],
      },
      {
        name: "Setup",
        icon: Settings,
        allowedModes: ADMIN_AND_SUPREME,
        children: [
          {
            name: "Messages",
            path: "/dashboard/settings/messages",
            icon: MessageSquare,
            allowedModes: ADMIN_AND_SUPREME,
          },
          {
            name: "Feedback Templates",
            path: "/dashboard/settings/feedback-templates",
            icon: FileText,
            allowedModes: ADMIN_AND_SUPREME,
          },
          {
            name: "Followup Packages",
            path: "/dashboard/settings/followup-package",
            icon: Package,
            allowedModes: ADMIN_AND_SUPREME,
          },
          {
            name: "Feedback Categories",
            path: "/dashboard/settings/feedback-categories",
            icon: LayoutList,
            allowedModes: ADMIN_AND_SUPREME,
          },
        ],
      },
    ],
  },
  {
    name: "Products",
    icon: PackageSearch,
    requiredPermission: {
      section: "SidebarMenu",
      action: "ProductMenuShow",
      appliesToModes: [PBL, ADMIN],
      pblShopId: 0,
    },
    children: [
      {
        name: "Product List",
        path: "/dashboard/product-list/",
        icon: PackageSearch,
      },
      // {
      //   name: "Recycled Products",
      //   path: "/dashboard/recycled-product-list/",
      //   icon: PackageSearch,
      //   allowedModes: ADMIN_AND_SUPREME,
      // },
      {
        name: "Recycled Products",
        path: "/dashboard/recycled-product-list/",
        icon: PackageSearch,
        allowedModes: ADMIN_AND_SUPREME,
        requiredPermission: {
          section: "Vehicle",
          action: "RecycledProductsMenuShow",
          appliesToModes: [ADMIN],
        },
      },
      {
        name: "Archived Products",
        path: "/dashboard/archive-product-list/",
        icon: PackageSearch,
        allowedModes: ADMIN_AND_SUPREME,
           requiredPermission: {
          section: "Vehicle",
          action: "ArchivedProductsMenuShow",
          appliesToModes: [ADMIN],
        },
      },
      {
        name: "Requested Products",
        path: "/dashboard/requested-product/",
        icon: PackageSearch,
        allowedModes: ADMIN_AND_SUPREME,
          allowedModes: ADMIN_AND_SUPREME,
          requiredPermission: {
          section: "Vehicle",
          action: "RequestedProductsMenuShow",
          appliesToModes: [ADMIN],
        },
      },
      {
        name: "General Products",
        path: "/dashboard/products/general-product/list/",
        icon: PackageSearch,
      },
    ],
  },
  {
    name: "Orders",
    icon: List,
    allowedModes: CUSTOMER_CARE_MODES,
    children: [
      {
        name: "Pending Orders",
        path: "/dashboard/order-list/pending",
        icon: Users,
      },
      {
        name: "Processing Orders",
        path: "/dashboard/order-list/processing",
        icon: Users,
      },
      {
        name: "Completed Orders",
        path: "/dashboard/order-list/completed",
        icon: Users,
      },
      {
        name: "Cancelled Orders",
        path: "/dashboard/order-list/cancelled",
        icon: Users,
      },
    ],
  },
  {
    name: "Cart List",
    path: "/dashboard/cart-list",
    icon: PackageSearch,
    allowedModes: CUSTOMER_CARE_MODES,
  },
  {
    name: "Shop List",
    path: "/dashboard/shop/",
    icon: Store,
    allowedModes: SELLER_MODES,
  },
  {
    name: "Conversation List",
    path: "/dashboard/conversation/",
    icon: Store,
    allowedModes: ADMIN_AND_SUPREME,
  },
  {
    name: "Users",
    icon: Users,
    allowedModes: [SUPREME],
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
    allowedModes: SELLER_MODES,
    children: [
      {
        name: "Master Data Type",
        path: "/dashboard/settings/master-data-type/",
        icon: DatabaseZap,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Master Data",
        path: "/dashboard/settings/master-data/",
        icon: Database,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Preset Queestion & Answer",
        path: "/dashboard/settings/preset-question-answer/",
        icon: Box,
        allowedModes: ADMIN_AND_SUPREME,
      },
       {
        name: "Preset Suggestions",
        path: "/dashboard/settings/preset-suggestions/",
        icon: Box,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Models",
        path: "/dashboard/model/",
        icon: Box,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Categories",
        path: "/dashboard/category/",
        icon: Box,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Packages",
        path: "/dashboard/package/",
        icon: Boxes,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Feature SFC List",
        path: "/dashboard/feature-specification/",
        icon: ListChecks,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Package Edition",
        path: "/dashboard/package-edition/",
        icon: PackageCheck,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Location List",
        path: "/dashboard/location/",
        icon: ListChecks,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Outlet List",
        path: "/dashboard/outlets/",
        icon: ListChecks,
      },
      {
        name: "Contact Customer List",
        path: "/dashboard/contact-customers/",
        icon: UserCog,
        allowedModes: SELLER_MODES,
      },
      {
        name: "System Documents",
        path: "/dashboard/system-document/",
        icon: Users,
        allowedModes: ADMIN_AND_SUPREME,
      },
      {
        name: "Change Password",
        path: "/dashboard/change-password/",
        icon: Users,
      },
    ],
  },
];
