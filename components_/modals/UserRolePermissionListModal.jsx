import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

import { get, useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { DialogTitle } from '@radix-ui/react-dialog';
import { Pencil } from 'lucide-react';
import { set } from 'lodash';


const UserRolePermissionListModal = ({ open, setOpen, selectedShop, employees, setOpenUser, setSelectedUser }) => {
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [roleNameError, setRoleNameError] = useState("");
    const [roleName, setRoleName] = useState("");
    const [permissionNames, setPermissionNames] = useState([]);
    const [isActive, setIsActive] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);




    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm({
    });

    // console.log("selectedShop", selectedShop?.s_id);



    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset(); // Reset form when dialog closes
        }
    };


    return (
        // <Dialog open={open} onOpenChange={setOpen}>
        <Dialog open={open}>
            <DialogContent className="sm:max-w-5xl [&>button]:hidden">

                <DialogTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                            <span className="inline-block w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
                            User List
                        </h2>
                        <button
                            onClick={() => {
                                setOpen(false)
                                setOpenUser(true)
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <svg className="inline-block w-4 h-4 mr-2 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add User
                        </button>
                    </div>
                </DialogTitle>




                <div>
                    <div className="container mx-auto p-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Mobile</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {
                                        employees.length > 0 && employees.map((item, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">{item?.user?.name}</td>
                                                <td className="py-3 px-4">{item?.user?.phone}</td>
                                                <td className="py-3 px-4">{item?.user?.email}</td>
                                                <td className="py-3 px-4">{item?.role?.r_name}</td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => {
                                                            setOpenUser(true)
                                                            setSelectedUser(item)
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        aria-label={`Edit`}
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-2">
                    <DialogClose asChild onClick={() => setOpen(false)} >
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}

export default UserRolePermissionListModal;