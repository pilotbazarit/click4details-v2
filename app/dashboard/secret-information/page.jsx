"use client";
import React, { useState } from "react";
import { Search, FileText, Video, File as FileIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import SecretDataService from "@/services/SecretDataService";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

const getExtension = (doc) => {
  const source = doc?.type || doc?.url || "";
  const cleaned = String(source).split("?")[0];
  const parts = cleaned.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const isImageDoc = (doc) => IMAGE_EXTENSIONS.includes(getExtension(doc));

const youtubeEmbedUrl = (url = "") => {
  if (!url) return "";
  const patterns = [
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return "";
};

const isVimeoUrl = (url = "") => /vimeo\.com\//.test(url);
const vimeoEmbedUrl = (url = "") => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : "";
};

const SecretInformationPage = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const response = await SecretDataService.Queries.search({ q: query.trim(), type });
      if (response?.status === "success") {
        setResults(response?.data || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to search.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = async (item) => {
    setSelected(item);
    setDetail(null);
    setDetailError("");
    try {
      setDetailLoading(true);
      const response = await SecretDataService.Queries.show(item.type, item.id);
      if (response?.status === "success") {
        setDetail(response?.data);
      } else {
        setDetailError(response?.message || "No secret data found for this listing.");
      }
    } catch (error) {
      setDetailError(
        error?.response?.data?.message ||
        (error?.response?.status === 403
          ? "You do not have permission to view this listing's secret data."
          : "No secret data found for this listing.")
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const embedUrl = detail?.secret_video_link
    ? youtubeEmbedUrl(detail.secret_video_link) || (isVimeoUrl(detail.secret_video_link) ? vimeoEmbedUrl(detail.secret_video_link) : "")
    : "";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Secret Information</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-2xl">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
        >
          <option value="all">All</option>
          <option value="vehicle">Vehicle</option>
          <option value="product">Product</option>
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vehicle or product by title/code"
            className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border rounded-lg divide-y max-h-[600px] overflow-y-auto">
          {results.length === 0 && (
            <p className="p-4 text-sm text-gray-500">No results yet. Search for a vehicle or product.</p>
          )}
          {results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className={`w-full text-left p-3 hover:bg-gray-50 transition ${
                selected?.type === item.type && selected?.id === item.id ? "bg-blue-50" : ""
              }`}
            >
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-gray-200 text-gray-700 mr-2">
                {item.type}
              </span>
              <span className="font-medium text-gray-800">{item.title}</span>
              {item.code && <span className="block text-xs text-gray-500">{item.code}</span>}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 border rounded-lg p-4 min-h-[300px]">
          {!selected && <p className="text-sm text-gray-500">Select a result to view its secret data.</p>}

          {selected && detailLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading secret data...
            </div>
          )}

          {selected && !detailLoading && detailError && (
            <p className="text-sm text-red-600">{detailError}</p>
          )}

          {selected && !detailLoading && detail && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{detail.title}</h2>
                {detail.code && <p className="text-xs text-gray-500">{detail.code}</p>}
              </div>

              {detail.secret_text && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                    <FileText className="h-4 w-4" /> Secret Text
                  </h3>
                  <p className="whitespace-pre-line text-sm text-gray-800 border rounded p-3 bg-gray-50">
                    {detail.secret_text}
                  </p>
                </div>
              )}

              {detail.secret_video_link && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                    <Video className="h-4 w-4" /> Secret Video
                  </h3>
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      className="w-full aspect-video rounded border"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video controls className="w-full max-h-96 rounded border">
                      <source src={detail.secret_video_link} />
                    </video>
                  )}
                </div>
              )}

              {Array.isArray(detail.secret_docs) && detail.secret_docs.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FileIcon className="h-4 w-4" /> Secret Documents
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {detail.secret_docs.filter(Boolean).map((doc, index) => (
                      <a
                        key={index}
                        href={doc?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border rounded-lg overflow-hidden flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition"
                      >
                        {isImageDoc(doc) ? (
                          <img src={doc?.url} alt={`Secret document ${index + 1}`} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="w-full h-32 flex flex-col items-center justify-center gap-2 text-gray-500">
                            <FileIcon className="h-8 w-8" />
                            <span className="text-xs">View Document</span>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!detail.secret_text && !detail.secret_video_link && (!detail.secret_docs || detail.secret_docs.length === 0) && (
                <p className="text-sm text-gray-500">No secret data found for this listing.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecretInformationPage;
