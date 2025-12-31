import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import UserService from '@/services/UserService'
import toast from 'react-hot-toast'


const UserEditModel = ({ open, setOpen, selectedData, users, setUsers }) => {
    const handleUpdate = async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();

        // You can add validation here if needed
        try {
            // Replace with your actual update API call
            const response = await UserService.Commands.updateUser(selectedData.id, 
                { 
                    name, 
                    email, 
                    phone,
                    _method: 'PUT'
                }
            );

            if(response.status === "success") {
                toast.success("User updated successfully!");
                setOpen(false);
                setUsers(users.map((user) => (user.id === selectedData.id ? { ...user, name, email, phone } : user)));
            }
        } catch (error) {
            toast.error(error?.message || "Failed to update user.");
        }
    };

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>

                <hr />

                <div>
                    <div className="container mx-auto p-4">
                        <div className="overflow-x-auto">
                          <form className="space-y-2" onSubmit={handleUpdate}>
                            <div>
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter name"
                                defaultValue={selectedData?.name || ""}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter email"
                                defaultValue={selectedData?.email || ""}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                name="phone"
                                type="text"
                                placeholder="Enter phone number"
                                defaultValue={selectedData?.phone || ""}
                                className=" w-full"
                              />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                              <Button type="submit" className="bg-blue-600 text-white">Update</Button>
                            </div>
                          </form>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}

export default UserEditModel;