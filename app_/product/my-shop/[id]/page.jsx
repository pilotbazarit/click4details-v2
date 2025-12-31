'use client'
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useParams } from 'next/navigation'
import VehicleService from "@/services/VehicleService";
import Header from "@/components/Header";
import ProductDetails from "@/components/frontend/ProductDetails"; // Import the new component

const MyShopProductDetailsPage = () => {
    const { id } = useParams();
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const res = await VehicleService.Queries.getVehicleDetailById(id, {
                _is_saleBy_pbl: 0,
            });
            if (res.status === 'success') {
                setProductDetails(res?.data);
            }
        } catch (error) {
            console.log('Error fetching product by ID:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Navbar />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <ProductDetails productDetails={productDetails} />
            )}
        </>
    );
};

export default MyShopProductDetailsPage;