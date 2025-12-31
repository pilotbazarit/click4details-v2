import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import {
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import { get, useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import Select from 'react-select';
import StoreService from '@/services/ShopService'
import UserService from '@/services/UserService'
import RoleService from '@/services/RoleService'
import PermissionService from '@/services/PermissionService'



// Yup Validation Schema
const schema = yup.object().shape({
    user_id: yup.string().required("User is required"),
    role_id: yup.string().required("Role is required"),
    // s_title: yup.string().required("Title is required"),
    // s_description: yup.string().required("Description is required"),
    // s_shop_category_id: yup.string().required("Category is required")
});


const AddShopPermissionModal = ({ open, setOpen, selectedShop }) => {
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
        resolver: yupResolver(schema),
    });



    const onSubmit = async (data) => {

       

        let permissionArr = [];
        permissionNames.forEach((role) => {
            role.permissions.forEach((perm) => {
                if (perm.p_is_selected) {
                    permissionArr.push(perm.p_id);
                }
            });
        })

        

        // Prepare payload
        const payload = {
            urp_entity_id: selectedShop?.s_id,
            urp_entity_type: 'shop',
            urp_user_id: data?.user_id,
            urp_role_id: data?.role_id,
            urp_permissions: permissionArr
        };

         console.log("payload", payload);
        //  console.log("permissionArr", permissionArr);


        // const formData = new FormData();
        // formData.append("s_title", data.s_title);
        // formData.append("s_description", data.s_description);
        // formData.append("s_shop_category_id", data.s_shop_category_id);

        // if (image) {
        //     formData.append("s_shop_banner", image);
        // }

        try {
            const response = await PermissionService.Commands.storeUserPermission(payload);

            console.log("response", response);
            // reset(); // clear the form
          
            // setOpen(false); // close modal
            // toast.success("Permission added successfully!");
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };


    const handleImageDelete = () => {
        setImage(null);
    };

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset(); // Reset form when dialog closes
        }
    };


    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        try {
            const response = await UserService.Queries.getUsers({
                _perPage: 1000,
            });
            if (response.status === "success") {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };


    const [roles, setRoles] = useState([]);
    const getRoles = async () => {
        try {
            const response = await RoleService.Queries.getRoles({
                _perPage: 1000,
            });
            if (response.status === "success") {
                setRoles(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const getUserPermissionName = async () => {
        try {
            const response = await UserService.Queries.getUserPermissionName({
                _role_id: 0
            });
            if (response.status == "success") {
                setPermissionNames(response.data);
            }
        } catch (error) {
            // console.log("error", error);
        }
    };


    const handlePermissionChange = (roleName, permissionName, e) => {
        setPermissionNames((prevPermissions) =>
            prevPermissions.map((role) =>
                role.name === roleName
                    ? {
                        ...role,
                        permissions: role.permissions.map((perm) =>
                            perm.p_name === permissionName
                                ? { ...perm, p_is_selected: e.target.checked }
                                : perm
                        ),
                    }
                    : role
            )
        );
    };


    useEffect(() => {
        getUsers();
        getRoles();
        getUserPermissionName();
    }, []);



    // console.log("permissionNames", permissionNames);

    return (
        // <Dialog open={open} onOpenChange={setOpen}>
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Add Permission</DialogTitle>
                </DialogHeader>

                <hr />

                {/* Add your form fields here */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="w-full p-6 bg-white rounded-xl shadow-md mb-4">
                        <div className="grid gap-4 py-4">



                            <div className="flex flex-col gap-1 w-[50%]">
                                <label className="text-base font-medium" htmlFor="user_id">
                                    User
                                </label>
                                <Controller
                                    name="user_id"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            id="user_id"
                                            options={[
                                                { value: '', label: 'Select User' },
                                                ...users.map(user => ({ value: user.id, label: user.name }))
                                            ]}
                                            classNamePrefix="react-select"
                                            className="w-full"
                                            value={[
                                                { value: '', label: 'Select User' },
                                                ...users.map(user => ({ value: user.id, label: user.name }))
                                            ].find(option => option.value === field.value)}
                                            onChange={option => field.onChange(option.value)}
                                        />
                                    )}
                                />
                                {errors.user_id && (
                                    <span className="text-red-500 text-xs mt-1">{errors.user_id.message}</span>
                                )}
                            </div>


                            <div className="flex flex-col gap-1 w-[50%]">
                                <label className="text-base font-medium" htmlFor="role_id">
                                    Role
                                </label>
                                <Controller
                                    name="role_id"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            id="role_id"
                                            options={[
                                                { value: '', label: 'Select User' },
                                                ...roles.map(role => ({ value: role.r_id, label: role.r_name }))
                                            ]}
                                            classNamePrefix="react-select"
                                            className="w-full"
                                            value={[
                                                { value: '', label: 'Select Role' },
                                                ...roles.map(role => ({ value: role.r_id, label: role.r_name }))
                                            ].find(option => option.value === field.value)}
                                            onChange={option => field.onChange(option.value)}
                                        />
                                    )}
                                />
                                {errors.role_id && (
                                    <span className="text-red-500 text-xs mt-1">{errors.role_id.message}</span>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Add your form fields here */}
                    <div className="w-full p-6 bg-white rounded-xl shadow-md">
                        <div className="mb-4">
                            <div className='mb-4'>
                                <span className="font-bold text-xl">Role Permissions</span>
                            </div>

                            <div className="flex items-center justify-between mb-2">

                                <div>
                                    <span>Administrator Access</span>
                                    <span className="text-gray-400 cursor-pointer" title="Administrator has full access">ℹ️</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {permissionNames.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-2">
                                        <span className="w-1/3">{item?.name}</span>
                                        <div className="flex gap-6">
                                            {item?.permissions.map((action, index) => (
                                                <label key={index} className="flex items-center gap-1 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        className="accent-purple-600"
                                                        checked={action.p_is_selected || false}
                                                        onChange={(e) => handlePermissionChange(item?.name, action?.p_name, e)}
                                                    />
                                                    {action?.p_name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* <hr/> */}
                        {/* <br/> */}
                    </div>

                    <div className="flex justify-end mt-6 gap-4">
                        <button
                            type="button"
                            className="border px-6 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
                            disabled={submitLoading}
                        >
                            {submitLoading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddShopPermissionModal;