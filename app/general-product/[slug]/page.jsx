'use client'
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useParams } from 'next/navigation'
import VehicleService from "@/services/VehicleService";
import Header from "@/components/Header";
import ProductDetails from "@/components/frontend/ProductDetails"; // Import the new component
import GeneralProductService from "@/services/GeneralProductService";
import GeneralProductDetails from "@/components/frontend/GeneralProductDetails";

const ProductDetailsPage = () => {
    const { slug } = useParams();
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchProductDetails();
        }
    }, [slug]);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const res = await GeneralProductService.Queries.getGeneralProductBySlug(slug);
    
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
                <GeneralProductDetails productDetails={productDetails} />
            )}
        </>
    );
};

export default ProductDetailsPage;