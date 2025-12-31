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
import Loading from '../Loading';
import { Pencil } from 'lucide-react';

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

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
    };

    const getShopEmployee = async () => {
        if (!selectedShop?.s_id) return;
        setLoading(true);
        try {
            const response = await ShopService.Queries.getShopEmployee(selectedShop.s_id);
            // You might want to set the employees state here, e.g., setMembers(response.data);
            console.log("Shop employees response::", response.data);

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

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Users</DialogTitle>
                    </DialogHeader>

                    <div className="flex justify-end">
                        <Button onClick={() => setAddMemberModalOpen(true)}>Add User</Button>
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
                getShopEmployee={getShopEmployee}
            />
        </>
    );
};

export default ManageShopModal;
