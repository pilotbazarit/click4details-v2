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
import Swal from "sweetalert2";

// Yup Validation Schema
const schema = yup.object().shape({
  md_title: yup.string().required("Title is required"),
  md_description: yup.string().required("Description is required"),
  md_type_id: yup.string().required("Type is required"),
});

const MasterData = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });


  const onSubmit = async (data) => {
    try {
      const response = await MasterDataService.Commands.storeMasterData({
        md_title: data.md_title,
        md_description: data.md_description,
        md_type_id: data.md_type_id,
      });

      getMasterData(); // Refresh the list after adding
      reset(); // clear form

    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Registration failed");
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
      })
      setDataTypes(response.data.data);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  // get all master data
  const [masterData, setMasterData] = useState([]);
  const getMasterData = async () => {
    try {
      const response = await MasterDataService.Queries.getMasterData({
        order: "desc",
        orderBy: "md_id",
      })
      setMasterData(response.data.data);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }


  useEffect(() => {
    getMasterDataTypes();
    getMasterData();
  }, []);

  // Delete master data type  deleteMasterData

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await MasterDataService.Commands.deleteMasterData(id);
        await getMasterData(); // ✅ make sure it's awaited if it's async
        Swal.fire({
          title: "Deleted!",
          text: "Master Deleted Successfully!",
          icon: "success"
        });
      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Something went wrong");
        }
      }
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
              Name
            </label>
            <input
              {...register("md_title")}
              id="md_title"
              name="md_title"
              type="text"
              placeholder="Enter title"
              className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
            />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-1/3">
            <label className="text-base font-medium" htmlFor="md_type_id">
              Master Type
            </label>
            <select
              id="md_type_id"
              name="md_type_id"
              className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
              {...register("md_type_id")}
            >
              {dataTypes.map((item) => (
                <option key={item.mdt_id} value={item.mdt_id}>
                  {item.mdt_title}
                </option>
              ))}
            </select>
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-1 w-full md:w-1/2">
            <label className="text-base font-medium" htmlFor="md_description">
              Description
            </label>
            <textarea
              id="md_description"
              rows={1}
              placeholder="Enter description"
              className="outline-none py-2 px-3 rounded border border-gray-400 w-full resize-none"
              {...register("md_description")}
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
              <th className="px-4 py-2 border-b text-left">Type</th>
              <th className="px-4 py-2 border-b text-left">Description</th>
              <th className="px-4 py-2 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Replace with your map loop */}
            {masterData.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.md_title}</td>
                <td className="px-4 py-2">
                  {dataTypes.find((type) => type.mdt_id === item.md_type_id)
                    ?.mdt_title || "N/A"}
                </td>
                <td className="px-4 py-2">{item.md_description}</td>
                <td className="px-4 py-2">
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(item.md_id)}
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

export default MasterData;
