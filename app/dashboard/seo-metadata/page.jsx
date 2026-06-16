"use client";

import React, { useMemo, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import Pagination from "@/components/Pagination";
import TableFilter from "@/components/TableFilter";
import SeoMetadataModal from "@/components/modals/SeoMetadataModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/helpers/functions";
import SeoMetadataService from "@/services/SeoMetadataService";
import { Loader2, Pencil, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

const ENTITY_TYPE_OPTIONS = [
  "vehicle",
  "product",
  "vehicle_model",
  "package",
  "category",
];

const getNestedValue = (item, key) => {
  if (!item || !key) return undefined;

  return key.split(".").reduce((value, part) => {
    if (value === null || value === undefined) return undefined;
    return value[part];
  }, item);
};

const getValue = (item, keys) => {
  for (const key of keys) {
    const value = getNestedValue(item, key);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);

  return String(value);
};

const normalizeSeoMetadata = (response) => {
  const payload = Object.prototype.hasOwnProperty.call(response || {}, "data")
    ? response.data
    : response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.seo_metadata)) return payload.seo_metadata;
  if (Array.isArray(payload?.metadata)) return payload.metadata;
  if (Array.isArray(payload?.items)) return payload.items;

  if (payload?.data && typeof payload.data === "object") return [payload.data];
  if (payload?.seo_metadata && typeof payload.seo_metadata === "object") {
    return [payload.seo_metadata];
  }
  if (payload?.metadata && typeof payload.metadata === "object") {
    return [payload.metadata];
  }
  if (payload && typeof payload === "object") {
    const dataKeys = Object.keys(payload).filter(
      (key) => !["status", "message"].includes(key)
    );

    return dataKeys.length > 0 ? [payload] : [];
  }

  return [];
};

const SeoMetaData = () => {
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [activeEntity, setActiveEntity] = useState({ type: "", id: "" });
  const [seoMetadata, setSeoMetadata] = useState([]);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState(null);

  const getSeoMetadata = async (
    nextEntityType = entityType,
    nextEntityId = entityId
  ) => {
    const trimmedEntityType = String(nextEntityType || "").trim();
    const trimmedEntityId = String(nextEntityId || "").trim();

    if (!trimmedEntityType || !trimmedEntityId) {
      toast.error("Entity type and entity ID are required");
      return;
    }

    try {
      setLoading(true);
      setHasFetched(true);

      const response = await SeoMetadataService.Queries.getSeoMetadata(
        trimmedEntityType,
        trimmedEntityId
      );

      if (typeof response?.status === "string" && response.status !== "success") {
        setSeoMetadata([]);
        toast.error(response?.message || "Failed to fetch SEO metadata");
        return;
      }

      const normalizedItems = normalizeSeoMetadata(response);
      setSeoMetadata(normalizedItems);
      setActiveEntity({ type: trimmedEntityType, id: trimmedEntityId });
      setCurrentPage(1);
    } catch (error) {
      setSeoMetadata([]);
      if (error?.silent) return;

      if (error?.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error?.message || "Failed to fetch SEO metadata");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMetadataSaved = async ({ entityType: savedEntityType, entityId: savedEntityId }) => {
    setEntityType(savedEntityType);
    setEntityId(savedEntityId);
    setSelectedMetadata(null);
    await getSeoMetadata(savedEntityType, savedEntityId);
  };

  const handleAdd = () => {
    setSelectedMetadata(null);
    setOpenAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedMetadata(item);
    setOpenAddModal(true);
  };

  const handleModalOpenChange = (isOpen) => {
    setOpenAddModal(isOpen);
    if (!isOpen) {
      setSelectedMetadata(null);
    }
  };

  const fetchSearchResults = (value = query) => {
    setCurrentPage(1);
    setSearchQuery(String(value || "").trim());
  };

  const handleClearSearch = () => {
    setCurrentPage(1);
    setSearchQuery("");
  };

  const filteredSeoMetadata = useMemo(() => {
    if (!searchQuery) return seoMetadata;

    const loweredQuery = searchQuery.toLowerCase();

    return seoMetadata.filter((item) => {
      const searchableText = [
        getValue(item, ["sm_entity_type", "entity_type", "entityType", "seo.entity_type", "metadata.entity_type"]),
        getValue(item, ["sm_entity_id", "entity_id", "entityId", "seo.entity_id", "metadata.entity_id"]),
        getValue(item, ["sm_meta_title", "meta_title", "metaTitle", "seo_title", "title", "seo.meta_title", "metadata.meta_title"]),
        getValue(item, ["sm_meta_description", "meta_description", "metaDescription", "seo_description", "description", "seo.meta_description", "metadata.meta_description"]),
        getValue(item, ["sm_meta_keywords", "meta_keywords", "metaKeywords", "keywords", "seo.meta_keywords", "metadata.meta_keywords"]),
        getValue(item, ["sm_tags", "tags", "seo.tags", "metadata.tags"]),
        getValue(item, ["sm_canonical_url", "canonical_url", "canonicalUrl", "canonical", "seo.canonical_url", "metadata.canonical_url"]),
      ]
        .map(formatValue)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(loweredQuery);
    });
  }, [searchQuery, seoMetadata]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSeoMetadata = filteredSeoMetadata.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const emptyStateText = hasFetched
    ? "No SEO metadata found."
    : "Load SEO metadata by entity type and entity ID.";

  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl text-gray-800">All SEO Metadata</h2>
            {activeEntity.type && activeEntity.id && (
              <p className="text-sm text-gray-500 mt-1">
                Entity: {activeEntity.type} / {activeEntity.id}
              </p>
            )}
          </div>
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Metadata
          </Button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            getSeoMetadata();
          }}
          className="grid grid-cols-1 md:grid-cols-[minmax(180px,240px)_minmax(160px,1fr)_auto] items-end gap-3 mb-5"
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="seo_entity_type">Entity Type</Label>
            <select
              id="seo_entity_type"
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
              className="outline-none py-2 px-3 rounded border border-gray-300 w-full"
              disabled={loading}
            >
              <option value="">Select Entity Type</option>
              {ENTITY_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="seo_entity_id">Entity ID</Label>
            <Input
              id="seo_entity_id"
              value={entityId}
              onChange={(event) => setEntityId(event.target.value)}
              placeholder="Enter entity ID"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading || !entityType.trim() || !entityId.trim()}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Load
          </Button>
        </form>

        <TableFilter
          query={query}
          setQuery={setQuery}
          setCurrentPage={setCurrentPage}
          fetchSearchResults={fetchSearchResults}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          placeholder="Search metadata..."
          onClearSearch={handleClearSearch}
        />

        <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Entity Type</TableHead>
                <TableHead className="border-r border-gray-300">Entity ID</TableHead>
                <TableHead className="border-r border-gray-300">Meta Title</TableHead>
                <TableHead className="border-r border-gray-300">Meta Description</TableHead>
                <TableHead className="border-r border-gray-300">Keywords</TableHead>
                <TableHead className="border-r border-gray-300">Tags</TableHead>
                <TableHead className="border-r border-gray-300">Canonical URL</TableHead>
                <TableHead className="border-r border-gray-300">Updated At</TableHead>
                <TableHead className="text-right w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && paginatedSeoMetadata.length > 0 ? (
                paginatedSeoMetadata.map((item, index) => {
                  const rowEntityType = getValue(item, [
                    "sm_entity_type",
                    "entity_type",
                    "entityType",
                    "seo.entity_type",
                    "metadata.entity_type",
                  ]);
                  const rowEntityId = getValue(item, [
                    "sm_entity_id",
                    "entity_id",
                    "entityId",
                    "seo.entity_id",
                    "metadata.entity_id",
                  ]);
                  const updatedAt = getValue(item, [
                    "updated_at",
                    "updatedAt",
                    "seo.updated_at",
                    "metadata.updated_at",
                    "created_at",
                    "createdAt",
                  ]);

                  return (
                    <TableRow
                      key={getValue(item, ["id", "seo_metadata_id", "sm_id"]) || `${rowEntityType}-${rowEntityId}-${index}`}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="border-r border-gray-200 text-center">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium">
                        {formatValue(rowEntityType || activeEntity.type)}
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium">
                        {formatValue(rowEntityId || activeEntity.id)}
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium min-w-[220px] max-w-[320px]">
                        <span className="block whitespace-normal break-words">
                          {formatValue(getValue(item, [
                            "sm_meta_title",
                            "meta_title",
                            "metaTitle",
                            "seo_title",
                            "title",
                            "seo.meta_title",
                            "metadata.meta_title",
                          ]))}
                        </span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium min-w-[260px] max-w-[420px]">
                        <span className="block whitespace-normal break-words">
                          {formatValue(getValue(item, [
                            "sm_meta_description",
                            "meta_description",
                            "metaDescription",
                            "seo_description",
                            "description",
                            "seo.meta_description",
                            "metadata.meta_description",
                          ]))}
                        </span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium min-w-[180px] max-w-[280px]">
                        <span className="block whitespace-normal break-words">
                          {formatValue(getValue(item, [
                            "sm_meta_keywords",
                            "meta_keywords",
                            "metaKeywords",
                            "keywords",
                            "seo.meta_keywords",
                            "metadata.meta_keywords",
                          ]))}
                        </span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium min-w-[160px] max-w-[260px]">
                        <span className="block whitespace-normal break-words">
                          {formatValue(getValue(item, [
                            "sm_tags",
                            "tags",
                            "seo.tags",
                            "metadata.tags",
                          ]))}
                        </span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium min-w-[220px] max-w-[320px]">
                        <span className="block whitespace-normal break-all">
                          {formatValue(getValue(item, [
                            "sm_canonical_url",
                            "canonical_url",
                            "canonicalUrl",
                            "canonical",
                            "seo.canonical_url",
                            "metadata.canonical_url",
                          ]))}
                        </span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium whitespace-nowrap">
                        {updatedAt ? formatDate(updatedAt, "DD MMM, YYYY h:mm A") : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Edit SEO metadata"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                        <span className="text-gray-500 font-semibold">Loading...</span>
                      </div>
                    ) : (
                      <div>{emptyStateText}</div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredSeoMetadata.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>
      <Footer />

      <SeoMetadataModal
        open={openAddModal}
        setOpen={handleModalOpenChange}
        initialEntityType={entityType}
        initialEntityId={entityId}
        initialData={selectedMetadata}
        onSaved={handleMetadataSaved}
      />
    </div>
  );
};

export default SeoMetaData;
