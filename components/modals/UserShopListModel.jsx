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


const UserShopListModel = ({ open, setOpen, selectedModel, shops }) => {

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Shop List</DialogTitle>
                </DialogHeader>

                <hr />

                <div>
                    <div className="container mx-auto p-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Shop Name</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Mobile</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                        {/* <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Mode</th> */}
                                    </tr>
                                </thead>
                              
                                <tbody className="text-gray-700">
                                    {
                                        shops?.length > 0 ?
                                            shops?.map((shop, index) => (
                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">{shop?.s_title}</td>
                                                    <td className="py-3 px-4">{shop?.user?.phone}</td>
                                                    <td className="py-3 px-4">{shop?.user?.email}</td>
                                                    {/* <td className="py-3 px-4">{shop?.user?.mode}</td> */}
                                                </tr>
                                            )) :
                                            <tr className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4" colSpan="4">No Shop Found</td>
                                            </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}

export default UserShopListModel;