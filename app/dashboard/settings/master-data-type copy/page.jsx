"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { get, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import api from "@/lib/api"; // Adjust the import based on your project structure
import MasterDataService from "@/services/MasterDataService";

// Yup Validation Schema
const schema = yup.object().shape({
  mdt_title: yup.string().required("Title is required"),
  mdt_description: yup.string().required("Description is required"),
});

const MasterDataType = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // const onSubmit = async (data) => {
  //   try {
  //     console.log(data);
  //     const response = await api.post("/master-data-type", {
  //       mdt_title: data.mdt_title,
  //       mdt_description: data.mdt_description,
  //     });
  //     getMasterDataTypes(); // Refresh the list after adding
  //     reset(); // clear form
  //   } catch (error) {
  //     if (error.errors) {
  //       Object.values(error.errors).forEach((e) => toast.error(e[0]));
  //     } else {
  //       console.log(error);
  //       //toast.error(error.message || "Registration failed");
  //     }
  //   }
  // };


  const onSubmit = async (data) => {
    try {
      const response = await MasterDataService.Commands.storeMasterDataType({
        mdt_title: data.mdt_title,
        mdt_description: data.mdt_description,
      });
      getMasterDataTypes(); // Refresh the list after adding
      reset(); // clear form

    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        console.log(error);
        //toast.error(error.message || "Registration failed");
      }
    }
  };

  // get all master data types
  const [dataTypes, setDataTypes] = useState([]);
  const getMasterDataTypes = async () => {
    try {
      const response = await MasterDataService.Queries.getMaterDatatype({
        order: "desc",
        orderBy: "md_id",
      });

      setDataTypes(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch data types"
      );
    }
  };
  useEffect(() => {
    getMasterDataTypes();
  }, []);

  // Delete master data type
  const deleteMasterDataType = async (id) => {
    try {
      const response = await api.deleteRequest(`/master-data-type/${id}`);
      getMasterDataTypes(); // Refresh the list after deletion
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to delete data type"
      );
    }
  };
  // Handle delete button click
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteMasterDataType(id);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-10 py-6">
      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col md:flex-row items-end gap-4">
          {/* Name Field */}
          <div className="flex flex-col gap-1 w-full md:w-1/3">
            <label className="text-base font-medium" htmlFor="name">
              Type Name
            </label>
            <input
              {...register("mdt_title")}
              id="mdt_title"
              name="mdt_title"
              type="text"
              placeholder="Enter title"
              className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
            />
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-1 w-full md:w-1/2">
            <label className="text-base font-medium" htmlFor="mdt_description">
              Description
            </label>
            <textarea
              id="mdt_description"
              rows={1}
              placeholder="Enter description"
              className="outline-none py-2 px-3 rounded border border-gray-400 w-full resize-none"
              {...register("mdt_description")}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium"
            >
              ADD
            </button>
          </div>
        </div>
      </form>

      {/* Table Section */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border border-blue-600 text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2 border-b text-left">#</th>
              <th className="px-4 py-2 border-b text-left">Name</th>
              <th className="px-4 py-2 border-b text-left">Code</th>
              <th className="px-4 py-2 border-b text-left">Description</th>
              <th className="px-4 py-2 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Replace with your map loop */}
            {dataTypes.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.mdt_title}</td>
                <td className="px-4 py-2">{item.mdt_code}</td>
                <td className="px-4 py-2">{item.mdt_description}</td>
                <td className="px-4 py-2">
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(item.mdt_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterDataType;
