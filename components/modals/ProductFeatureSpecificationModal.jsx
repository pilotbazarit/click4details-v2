import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ListRestart, Plus, X } from 'lucide-react';
import FeatureSpecificationService from '@/services/FeatureSpecificationService';
import Swal from "sweetalert2";
import { set } from 'lodash';



const ProductFeatureSpecificationModal = ({ open, setFeatureModalShow, formData, setFormData, featureData, setSelectedFsId }) => {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenChange = (isOpen) => {
        setFeatureModalShow(isOpen);
    };

    // Sync selectedFsId with formData.vsm_fs_id when modal opens or featureData changes
    useEffect(() => {
        if (open && formData?.vsm_fs_id) {
            setSelectedFsId(formData.vsm_fs_id);
        }
    }, [open, formData?.vsm_fs_id]);




    // Toggle clear/select all
    const handleClearFilter = () => {
        // Collect all fs_ids from featureData
        let allFsIds = [];
        if (featureData && featureData.length > 0) {
            featureData.forEach(item => {
                if (item?.specification && item.specification.length > 0) {
                    allFsIds = allFsIds.concat(item.specification.map(fs => fs.fs_id));
                }
            });
        }
        // If all are selected, clear all; else, select all
        if (formData.vsm_fs_id && formData.vsm_fs_id.length === allFsIds.length) {
            setSelectedFsId([]);
            setFormData((prevData) => ({
                ...prevData,
                vsm_fs_id: []
            }));
        } else {
            setSelectedFsId(allFsIds);
            setFormData((prevData) => ({
                ...prevData,
                vsm_fs_id: allFsIds
            }));
        }
    };

    const handleChange = (e, id) => {
        // Clear filter handler

        const isChecked = e.target.checked;

        setSelectedFsId(prev => {
            if (isChecked) {
                // Add id if not present
                if (!prev.includes(id)) {
                    return [...prev, id];
                }
                return prev;
            } else {
                // Remove id if present
                return prev.filter(fsId => fsId !== id);
            }
        });

        setFormData((prevData) => {
            let updatedFsIds = [...prevData.vsm_fs_id];

            if (isChecked) {
                // Add ID if not already in the list
                if (!updatedFsIds?.includes(id)) {
                    updatedFsIds.push(id);
                }
            } else {
                // Remove ID if it's in the list
                updatedFsIds = updatedFsIds.filter((fsId) => fsId !== id);
            }

            return {
                ...prevData,
                vsm_fs_id: updatedFsIds
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await FeatureSpecificationService.Commands.storeFeatureSpecificationMapping(formData);
            if (res.status === "success") {
                Swal.fire({
                    // title: "Created!",
                    text: "Feature Specification Change Successfully.",
                    icon: "success",
                });
                setIsSubmitting(false);
                setFeatureModalShow(false);
                // setFormData({
                //     vsm_feature_id: 0,
                //     vsm_model_id: "",
                //     vsm_ve_id: "",
                //     vsm_fs_id: [],
                // });
                // setSelectedBrand("");
                // setModels([]);
                // setPackages([]);
            } else if (res.status === "error") {
                setIsSubmitting(false);
                // setFormData({});
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `${res.message}`,
                });
            }
        } catch (error) {
            console.log("Error creating subscription:", error);
        } finally {
            setIsSubmitting(false);
        }

    };


    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">

                <DialogHeader>
                    <div className="flex items-center gap-4 w-full">
                        <DialogTitle>
                            Feature Head and Specification Modal
                        </DialogTitle>
                        <button
                            type="button"
                            className="ml-2 p-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-300 hover:from-cyan-500 hover:to-purple-400 transition duration-300 shadow-md backdrop-blur-sm bg-opacity-80 border border-white/30"
                            title="Clear Filter"
                            onClick={handleClearFilter}
                        >
                            <ListRestart className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </DialogHeader>

                <div className="border border-gray-300 p-4">
                    <div className="grid grid-cols-4 grid-rows-1 gap-2">
                        {
                            featureData && featureData.length > 0 && featureData.map((item, index) => (
                                <div key={index} className="border rounded p-4">
                                    <p className="text-sm font-medium mb-2">{item?.md_title}:</p>
                                    <hr />
                                    <div className="flex items-end justify-between mt-2">
                                        <div className="flex flex-col space-y-2">
                                            {
                                                item?.specification?.map((fs, ind) => (
                                                    <div key={ind} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4"
                                                            checked={formData?.vsm_fs_id.includes(fs?.fs_id)}
                                                            onChange={(e) => handleChange(e, fs.fs_id)}
                                                        />
                                                        <span className="text-sm">{fs?.fs_title}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        <div>
                                            <button className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                                <Plus />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>


                    <div className="flex items-center justify-end gap-2 mt-4">
                        <span className="font-medium">Add Feature Head </span>
                        <button className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                            <Plus />
                        </button>
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            // type="submit"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium disabled:opacity-50"
                            // disabled={isSubmitting}
                            onClick={() => setFeatureModalShow(false)}
                        >
                            Next
                        </button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}

export default ProductFeatureSpecificationModal;