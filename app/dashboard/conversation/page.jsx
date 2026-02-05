"use client";
import React, { useEffect, useState } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import ShopModal from "@/components/modals/ShopModal";
import StoreService from "@/services/ShopService";
import { Eye, Pencil, SmilePlus, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import toast from "react-hot-toast";
import UserRolePermissionListModal from "@/components/modals/UserRolePermissionListModal";
import RoleService from "@/services/RoleService";
import AddUserModal from "@/components/modals/AddUserModal";
import ConversationService from "@/services/ConversationService";
import ViewAdminConversationModal from "@/components/modals/ViewAdminConversationModal";

const Conversation = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [openPermission, setOpenPermission] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [openPermissionList, setOpenPermissionList] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedShopForEdit, setSelectedShopForEdit] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isAdminConversationOpen, setIsAdminConversationOpen] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);


      const params = {
        _page: 1,
        _perPage: 1000,
        _order: 'desc',
        _orderBy: 's_created_at',
      };


      // Add _user_id parameter if user is not superadmin
      if (user?.user_mode !== 'supreme') {
        params._user_id = user?.id;
      }

      const response = await StoreService.Queries.getShops(params);
      setShops(response?.data?.data || []);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };


  const getConversations = async () => {
    try {
      const params = {
        _page: 1,
        _perPage: 1000,
        _order: 'desc',
        _orderBy: 'conv_id',
      }
      const response = await ConversationService.Queries.getConversationList(params);

      if (response.status == "success") {
        setConversations(response.data.data)
      }

    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };


  useEffect(() => {
    // fetchShops();
    getConversations();
  }, []);


  const handleOpenPermissionList = (shop) => {
    getUserRolePermission(shop);
    setSelectedShop(shop);
    setOpenPermissionList(true);
  };


  const [employees, setEmployees] = useState([]);

  const getUserRolePermission = async (shop) => {
    try {
      const response = await RoleService.Queries.getUserRolePermission(shop?.s_id);

      if (response.status === "success") {
        setEmployees(response?.data);
      }
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };


  const formatNotificationTime = (value) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const [selectedConversation, setSelectedConversation] = useState(null);


  const handleOpenAdminConversation = (conversation) => () => {
    setSelectedConversation(conversation);
    setIsAdminConversationOpen(true);
  }



  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      {loading ? (
        <Loading />
      ) : (
        <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-xl text-gray-800">All Conversations</h2>
            {/* <Button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Shop
            </Button> */}
          </div>

          {/* Search Filter */}
          <TableFilter searchTerm={searchTerm} setSearchTerm={handleSearchChange} />

          {/* Table Container */}
          <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-300">
                  <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                  <TableHead className="border-r border-gray-300">Conversation Id</TableHead>
                  <TableHead className="border-r border-gray-300">Product Name</TableHead>
                  <TableHead className="border-r border-gray-300">From User</TableHead>
                  <TableHead className="border-r border-gray-300">To User</TableHead>
                  <TableHead className="border-r border-gray-300">Date</TableHead>
                  <TableHead className="border-r border-gray-300">Action</TableHead>
                  {/* <TableHead className="border-r border-gray-300">Name</TableHead>
                  <TableHead className="border-r border-gray-300">Description</TableHead>
                  <TableHead className="text-right w-[10]">
                    <div className="flex justify-end items-center w-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </svg>
                    </div>
                  </TableHead> */}
                </TableRow>
              </TableHeader>

              <TableBody>
                {conversations.length > 0 ? (
                  conversations.map((conversation, index) => (
                    <TableRow key={conversation.id || index} className="border-b border-gray-200">
                      <TableCell className="border-r border-gray-200 text-center">{index + 1}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{conversation?.conv_id}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{conversation?.entity_details?.title}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <div>
                          <span>{conversation?.from_user?.name}</span><br/>
                          <span>{conversation?.from_user?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        {conversation?.to_user?.name}<br/>
                        {conversation?.to_user?.email}
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{formatNotificationTime(conversation?.conv_created_at)}</TableCell>
                      <TableCell className="flex justify-center gap-2 border-r border-gray-200 font-medium">
                        <button
                          className="text-orange-600 hover:text-orange-800"
                          aria-label={`Add Permission`}
                          title="Add Permission"
                          onClick={handleOpenAdminConversation(conversation)}
                        >
                          <Eye size={18} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No Conversation found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <Pagination />
          </div>
        </main>
      )}
      <Footer />

      {/* Shop Modal */}
      {/* <ShopModal open={open} setOpen={setOpen} /> */}
      <ShopModal open={open} setOpen={setOpen} shop={selectedShopForEdit} fetchShops={fetchShops} />

      <AddUserModal open={openUser} setOpen={setOpenUser} selectedShop={selectedShop} selectedUser={selectedUser} />

      <UserRolePermissionListModal
        open={openPermissionList}
        setOpen={setOpenPermissionList}
        selectedShop={selectedShop}
        employees={employees}
        setOpenUser={setOpenUser}
        setSelectedUser={setSelectedUser}
      />
      <ViewAdminConversationModal
        open={isAdminConversationOpen}
        setOpen={setIsAdminConversationOpen}
        productInfo={selectedConversation?.entity}
        conversationId={selectedConversation && selectedConversation.conv_id}
        selectedConversation={selectedConversation}
      />

      {/* openPermission */}
      {/* <AddShopPermissionModal open={openPermission} setOpen={setOpenPermission} selectedShop={selectedShop} /> */}
    </div>
  );
};

export default Conversation;
