import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AddMemberModal from './AddMemberModal';
import { useAppContext } from '@/context/AppContext';
import ShopService from '@/services/ShopService';
import PermissionService from '@/services/PermissionService';
import Loading from '../Loading';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

// Dummy Data for Members
// const members = [
//     {
//         id: 1,
//         name: "John Doe",
//         email: "john.doe@example.com",
//         role: "Admin",
//     },
//     {
//         id: 2,
//         name: "Jane Smith",
//         email: "jane.smith@example.com",
//         role: "Editor",
//     },
//     {
//         id: 3,
//         name: "Sam Wilson",
//         email: "sam.wilson@example.com",
//         role: "Viewer",
//     },
// ];

const ManageShopModal = ({ open, setOpen }) => {
    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const { selectedShop } = useAppContext();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
    };

    const getShopEmployee = async () => {
        if (!selectedShop?.s_id) return;
        setLoading(true);
        try {
            const response = await ShopService.Queries.getShopEmployee(selectedShop.s_id);
            // You might want to set the employees state here, e.g., setMembers(response.data);

            if (response.status == 'success') {
                setEmployees(response?.data);
            }
            setLoading(false);
        } catch (error) {
            setEmployees([]);
            setLoading(false);
            console.log("Failed to fetch shop employees:", error);
        }
    };

    // console.log("employees", employees);

    useEffect(() => {
        if (open && selectedShop) {
            getShopEmployee();
        }
    }, [open, selectedShop]);

    const handleDeleteUser = async (item) => {
        const permissionId = item?.urp_id ?? item?.p_id ?? item?.id;

        if (!permissionId) {
            toast.error('Delete id not found');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete ${item?.user?.name || 'this user'}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            customClass: {
                container: 'swal2-container-high-z',
                popup: 'swal2-popup-high-z',
                actions: 'swal2-actions-visible',
            },
        });

        if (!result.isConfirmed) return;

        try {
            setDeletingId(permissionId);
            const response = await PermissionService.Commands.deleteUserRolePermission(permissionId);

            if (response?.status === 'success') {
                toast.success('User deleted successfully!');
                await getShopEmployee();
            } else {
                toast.error(response?.data?.message || 'Failed to delete user');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to delete user');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Users</DialogTitle>
                    </DialogHeader>

                    <div className="flex justify-end">
                        <Button onClick={() => {
                            setSelectedUser(null);
                            setAddMemberModalOpen(true);
                        }}>Add User</Button>
                    </div>

                    <div className="mt-4 border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) :
                                        employees?.length > 0 ? employees.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item?.user?.name}</TableCell>
                                                <TableCell className="font-medium">{item?.user?.email}</TableCell>
                                                <TableCell className="font-medium">{item?.user?.phone}</TableCell>
                                                <TableCell className="font-medium">{item?.role?.r_name}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setAddMemberModalOpen(true)
                                                                setSelectedUser(item)
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            aria-label={`Edit`}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteUser(item)}
                                                            disabled={deletingId === (item?.urp_id ?? item?.p_id ?? item?.id)}
                                                            className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                            aria-label="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>


                                                    
                                                </TableCell>
                                                {/* <TableCell>{item.email}</TableCell>
                                        <TableCell>{item.role}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                ...
                                            </Button>
                                        </TableCell> */}
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No Member Found
                                                </TableCell>
                                            </TableRow>
                                        )
                                }
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            <AddMemberModal
                open={isAddMemberModalOpen}
                setOpen={setAddMemberModalOpen}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                getShopEmployee={getShopEmployee}
            />
        </>
    );
};

export default ManageShopModal;
