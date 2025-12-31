"use client";
import React, { useEffect, useState } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Plus } from "lucide-react";
import constData from "@/lib/constant";
import toast from "react-hot-toast";
import VehicleModelService from "@/services/VehicleModelService";
import Swal from "sweetalert2";
import MasterDataService from "@/services/MasterDataService";
import PackageService from "@/services/PackageService";
import FeatureSpecificationService from "@/services/FeatureSpecificationService";
import BrandAddModal from "@/components/modals/BrandAddModal";
import VehicleModelAddModal from "@/components/modals/VehicleModelAddModal";
import PackageAddModal from "@/components/modals/PackageAddModal";
import FeatureSpecificationAddModal from "@/components/modals/FeatureSpecificationAddModal";
import FeatureAddModal from "@/components/modals/FeatureAddModal";

const PackageEdition = () => {
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [open, setOpen] = useState(false);
    const [openModel, setOpenModel] = useState(false);
    const [openPackage, setOpenPackage] = useState(false);
    const [openFeature, setOpenFeature] = useState(false);
    const [openFeatureSpecification, setopenFeatureSpecificationSpecification] = useState(false);
    const [openBrand, setOpenBrand] = useState(false);
    const [packages, setPackages] = useState([]);
    const [featureData, setFeatureData] = useState([]);
    const [featureLoading, setFeatureLoading] = useState(false);
    const [formData, setFormData] = useState({
        vsm_feature_id: 0,
        vsm_model_id: "",
        vsm_ve_id: "",
        vsm_fs_id: [],
    });

    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedPackage, setSelectedPackage] = useState("");
    const [selectedFeatureSpecification, setSelectedFeatureSpecification] = useState("");

    const handleChange = (e, id) => {
        const isChecked = e.target.checked;

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



    const getBrands = async () => {
        try {
            const brand_code = constData.BRAND_MD_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(brand_code);

            const brandMasterData = response.data?.master_data;
            const brandData = brandMasterData.map((brand) => ({
                value: brand.md_id,
                label: brand.md_title,
            }));

            setBrands(brandData);
        } catch (error) {
            console.log("Error fetching brand data:", error);
        }
    }

    // const filteredShops = shops.filter((shop) =>
    //     shop.s_title.toLowerCase().includes(searchTerm.toLowerCase())
    // );



    const handlePackageClose = () => {
        setOpenPackage(false);
    }

    const handleFeatureSpecificationClose = () => {
        setopenFeatureSpecificationSpecification(false);
    }

    const handleFeatureClose = () => {
        setOpenFeature(false);
    }


    

    const handleAddBrand = () => {
        setOpenBrand(true);
    }


    const handleBrandClose = () => {
        setOpenBrand(false);
    }

    // handleAddModel
    // setOpenModel(true);
    const handleAddModel = () => {
        if (selectedBrand === '') return toast.error('Please select a brand');
        setOpenModel(true);
    }

    // Reset selected model when modal closes
    const handleModalClose = () => {
        setOpenModel(false);
    }


    const handleAddPackage = () => {
        if (selectedModel === '') return toast.error('Please select a model ');
        setOpenPackage(true);
    }

    const handleAddFeature = () => {
        // if (selectedPackage === '') return toast.error('Please select a package');
        setOpenFeature(true);
    }

    const handleAddFeatureSpecification = (id) => {
        if (selectedPackage === '') return toast.error('Please select a package');
        setSelectedFeatureSpecification(id);
        setopenFeatureSpecificationSpecification(true);
    }


    // Handle brand change
    const handleBrandChange = async (e) => {
        setSelectedBrand(e.target.value);
        setModels([]);
        setPackages([]);
        setFeatureData([]);
        const selectedBrand = e.target.value;
        if (selectedBrand) {
            const response = await VehicleModelService.Queries.getModelsByBrand({
                _brand_id: selectedBrand,
                _page: 1,
                _perPage: 1000,
            });
            setModels(response?.data?.data || []);
        } else {
            setModels([]);
        }
    };


    const getModels = async () => {
        try {
            if (selectedBrand) {
                const response = await VehicleModelService.Queries.getModelsByBrand({
                    _brand_id: selectedBrand,
                    _page: 1,
                    _perPage: 1000,
                });
                setModels(response?.data?.data || []);
            }
            setModels(response?.data?.data);
        } catch (error) {
            console.log("Error fetching models:", error);
        }
    };

    const getPackages = async () => {
        try {
            selectedModel
            if (selectedModel) {

                const response = await PackageService.Queries.getPackageById({
                    _model_id: selectedModel,
                    _page: 1,
                    _perPage: 1000,
                });

                setPackages(response?.data?.data || []);
            }
            setPackages(response?.data?.data);
        } catch (error) {
            console.log("Error fetching packages:", error);
        }
    };

    const getFeatureSpecification = async () => {
        try {
            if (selectedPackage) {
                setFeatureLoading(true);
                const response = await PackageService.Queries.getFeatureByPackageId(selectedPackage);
                setFeatureData(response?.data || []);
                const arr = [];
                response?.data && response?.data.map((item) => {
                    item?.specification && item?.specification.map((feature) => {
                        if (feature.is_selected === true) {
                            arr.push(feature.fs_id);
                        }
                    })
                });

                setFormData({
                    ...formData,
                    vsm_ve_id: selectedPackage,
                    vsm_fs_id: arr
                })
                setFeatureLoading(false);
            }
        } catch (error) {
            console.log("Error fetching feature specification:", error);
        }
    };



    // Handle Model Change
    const handleModelChange = async (e) => {
        const selectedModel = e.target.value;
        setSelectedModel(selectedModel);
        if (selectedModel) {
            const response = await PackageService.Queries.getPackageById({
                _model_id: selectedModel,
                _page: 1,
                _perPage: 1000,
            });
            setPackages(response?.data?.data || []);
            setFormData({
                ...formData,
                vsm_model_id: selectedModel
            });
        } else {
            setPackages([]);
        }
    }


    // setFeatureData
    const handlePackageChange = async (e) => {
        setFeatureLoading(true);
        const selectedPackage = e.target.value;
        setSelectedPackage(selectedPackage);
        if (selectedPackage) {
            const response = await PackageService.Queries.getFeatureByPackageId(selectedPackage);
            setFeatureData(response?.data || []);
            const arr = [];
            response?.data && response?.data.map((item) => {
                item?.specification && item?.specification.map((feature) => {
                    if (feature.is_selected === true) {
                        arr.push(feature.fs_id);
                    }
                })
            });

            setFormData({
                ...formData,
                vsm_ve_id: selectedPackage,
                vsm_fs_id: arr
            })
            setFeatureLoading(false);
        } else {
            setFeatureData([]);
            setFeatureLoading(false);
        }
    }

    useEffect(() => {
        getBrands();
    }, []);

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.vsm_model_id) {
            newErrors.model = "Model is required.";
        }
        if (!formData.vsm_ve_id) {
            newErrors.package = "Package Field is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
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
                    setFormData({
                        vsm_feature_id: 0,
                        vsm_model_id: "",
                        vsm_ve_id: "",
                        vsm_fs_id: [],
                    });
                    setSelectedBrand("");
                    setModels([]);
                    setPackages([]);
                } else if (res.status === "error") {
                    setIsSubmitting(false);
                    setFormData({});
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
        }
    };


    return (
        <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
            {loading ? (
                <Loading />
            ) : (
                <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <h2 className="text-xl text-gray-800">Create Package</h2>
                    </div>


                    {/* Table Container */}
                    <div className="overflow-x-auto rounded-md border border-gray-300 mt-4 p-4">

                        <div>
                            {/* Brand Select */}
                            <div className="w-[30%] mb-2">
                                <label className="text-base font-medium" htmlFor="p_brand_id">
                                    Brand
                                </label>
                                <div className="flex items-center gap-2">
                                    <select
                                        id="p_brand_id"
                                        value={selectedBrand}
                                        className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                        onChange={handleBrandChange}
                                    >
                                        <option value="">Brand</option>
                                        {brands?.map((item, index) => (
                                            <option key={item.value || index} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleAddBrand}
                                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                    >
                                        <Plus />
                                    </button>
                                </div>
                            </div>


                            {/* Model Select */}
                            <div className="w-[30%] mb-2">
                                <label className="text-base font-medium" htmlFor="p_model_id">
                                    Model
                                </label>
                                <div className="flex items-center gap-2">
                                    <select
                                        id="p_model_id"
                                        className={`outline-none py-2 px-3 rounded border w-full ${errors.model ? "border-red-500" : "border-gray-400"}`}
                                        onChange={handleModelChange}
                                    >
                                        <option value="">Select Model</option>
                                        {selectedBrand && models.length === 0 && (
                                            <option disabled>No data available</option>
                                        )}
                                        {models?.map((item) => (
                                            <option key={item.vm_id} value={item.vm_id}>
                                                {item.vm_name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleAddModel}
                                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                        <Plus />
                                    </button>
                                </div>
                            </div>

                            {/* Add Package */}
                            <div className="w-[30%] mb-2">
                                <label className="text-base font-medium" htmlFor="p_model_id">
                                    Package
                                </label>

                                <div className="flex items-center gap-2">
                                    <select
                                        id="p_model_id"
                                        className={`outline-none py-2 px-3 rounded border w-full ${errors.package ? "border-red-500" : "border-gray-400"}`}
                                        onChange={handlePackageChange}

                                    >
                                        <option value="">Select Package</option>
                                        {/* packages */}
                                        {selectedModel && packages.length === 0 && (
                                            <option disabled>No data available</option>
                                        )}
                                        {packages?.map((item) => (
                                            <option key={item.p_id} value={item.p_id}>
                                                {item.p_name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleAddPackage}
                                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                        <Plus />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {
                            featureData && featureData.length > 0 && (
                                <div className="border border-gray-300 p-4">
                                    <h2 className="text-lg font-semibold mb-2">Feature Head & Specification</h2>
                                    {
                                        featureLoading && (
                                            <Loading />
                                        )
                                    }
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
                                                            <button

                                                                onClick={() => handleAddFeatureSpecification(item?.md_id)}
                                                                className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
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
                                        <button 
                                            onClick={handleAddFeature}
                                            className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                            <Plus />
                                        </button>
                                    </div>
                                </div>
                            )
                        }


                    </div>

                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium disabled:opacity-50"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? "Processing..." : "Save"}
                            {/* Save */}
                        </button>
                    </div>
                </main>
            )}

            {/* BrandAddModal */}
            <BrandAddModal
                open={openBrand}
                setOpen={handleBrandClose}
                getBrands={getBrands}
            />


            {/* setOpenModel */}
            <VehicleModelAddModal
                open={openModel}
                setOpen={handleModalClose}
                brandId={selectedBrand}
                getModels={getModels}
            />

            <PackageAddModal
                open={openPackage}
                setOpen={handlePackageClose}
                brandId={selectedBrand}
                modelId={selectedModel}
                getPackages={getPackages}
            />

            {/* setopenFeatureSpecificationSpecification */}

            <FeatureSpecificationAddModal
                open={openFeatureSpecification}
                setOpen={handleFeatureSpecificationClose}
                featureId={selectedFeatureSpecification}
                getFeatureSpecification={getFeatureSpecification}
            />

            <FeatureAddModal
                open={openFeature}
                setOpen={handleFeatureClose}
                getFeatureSpecification={getFeatureSpecification}
            />

           


            {/* setOpenFeature */}
            <Footer />
        </div>
    );
};

export default PackageEdition;
