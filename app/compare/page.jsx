'use client'
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import VehicleService from "@/services/VehicleService";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/helpers/functions";
import { GitCompare, Trash2, X, ArrowLeft, Eye, Lightbulb, ThumbsUp, TrendingDown, Gauge, Calendar, Fuel, Star } from "lucide-react";

const COMPARE_ATTRIBUTES = [
  { key: "v_brand_name", label: "Brand" },
  { key: "v_model_name", label: "Model" },
  { key: "v_edition_name", label: "Edition" },
  { key: "v_mod_year", label: "Model Year" },
  { key: "v_condition_name", label: "Condition" },
  { key: "v_transmission_name", label: "Transmission" },
  { key: "v_fuel_name", label: "Fuel Type" },
  { key: "v_skeleton_name", label: "Body Type" },
  { key: "v_color_name", label: "Color" },
  { key: "v_capacity", label: "Engine Capacity (cc)" },
  { key: "v_mileage", label: "Mileage (km)" },
  { key: "v_engine", label: "Engine No." },
  { key: "v_registration", label: "Registration" },
  { key: "v_grade_name", label: "Grade" },
  { key: "v_seat_name", label: "Seats" },
  { key: "v_availability_status", label: "Availability" },
  { key: "v_location", label: "Location", render: (v) => v?.v_location?.location_name || "N/A" },
];

const FEATURE_DISPLAY_ORDER = [
  "Seat",
  "Front Light",
  "Roof",
  "Seat Power",
  "Start Option",
  "Steering Option",
  "Engine Special Features",
  "Seat Color",
  "Back Light",
  "Multimedia",
  "Ac Panel",
  "Mobile Charger",
  "Wheel & Rim",
  "Glass",
  "Door",
  "Safety Features",
  "Brake System",
  "Interior",
  "Camera",
  "Sound System",
  "Types Of Engine",
  "Windscreen Wipers",
];

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare, router } = useAppContext();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareItems.length > 0) {
      fetchVehicles();
    } else {
      setVehicles([]);
    }
  }, [compareItems]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await VehicleService.Queries.getVehiclesForCompare(compareItems);
      if (res.status === "success" && res.data) {
        const ordered = compareItems
          .map((id) => res.data.find((v) => v.v_id === id))
          .filter(Boolean);
        setVehicles(ordered);
      }
    } catch (error) {
      console.log("Error fetching compare vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (vehicle) => {
    const price = vehicle?.vehicle_price?.pbl_price;
    if (!price || price === "Call for Price") return "Call for Price";
    const currency = vehicle?.vehicle_db_price?.vp_currency || "BDT";
    return `${currency}. ${formatPrice(price)}`;
  };

  const getImageSrc = (vehicle) => {
    return vehicle?.vehicle_front_image?.url || null;
  };

  const getCellValue = (vehicle, attr) => {
    if (attr.render) return attr.render(vehicle);
    const val = vehicle?.[attr.key];
    if (val === null || val === undefined || val === "") return "N/A";
    return String(val);
  };

  const isDifferent = (attr) => {
    if (vehicles.length < 2) return false;
    const values = vehicles.map((v) => getCellValue(v, attr));
    return new Set(values).size > 1;
  };

  const getFeatureValuesByTitle = (vehicle) => {
    const featureValues = new Map();

    (vehicle?.feature_specification || []).forEach((group) => {
      // Current API shape: { md_title, specification: [{ fs_title, is_selected }] }
      // Legacy shape fallback: { items: [{ fs_title, fs_pam_value }] }
      if (Array.isArray(group?.specification) && group?.md_title) {
        const title = group.md_title;

        group.specification.forEach((item) => {
          if (!item?.is_selected || !item?.fs_title) return;

          if (!featureValues.has(title)) {
            featureValues.set(title, []);
          }

          const existingValues = featureValues.get(title);
          if (!existingValues.includes(item.fs_title)) {
            existingValues.push(item.fs_title);
          }
        });
        return;
      }

      (group?.items || []).forEach((item) => {
        const title = item?.fs_title;
        const value = item?.fs_pam_value;
        if (!title || !value) return;

        if (!featureValues.has(title)) {
          featureValues.set(title, []);
        }

        const existingValues = featureValues.get(title);
        if (!existingValues.includes(value)) {
          existingValues.push(value);
        }
      });
    });

    return featureValues;
  };

  const generateSummary = () => {
    if (vehicles.length < 2) return null;

    const parseNumericPrice = (v) => {
      const raw = v?.vehicle_price?.pbl_price;
      if (!raw || raw === "Call for Price") return null;
      const num = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
      return isNaN(num) ? null : num;
    };

    const parseNum = (val) => {
      if (val === null || val === undefined || val === "" || val === "N/A") return null;
      const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
      return isNaN(num) ? null : num;
    };

    const summaries = vehicles.map((v) => {
      const highlights = [];
      const concerns = [];
      return { vehicle: v, highlights, concerns };
    });

    const prices = vehicles.map(parseNumericPrice);
    const validPrices = prices.filter((p) => p !== null);
    if (validPrices.length >= 2) {
      const minPrice = Math.min(...validPrices);
      const maxPrice = Math.max(...validPrices);
      if (minPrice !== maxPrice) {
        vehicles.forEach((v, i) => {
          if (prices[i] === minPrice) summaries[i].highlights.push({ icon: "price", text: "Lowest price" });
          if (prices[i] === maxPrice) summaries[i].concerns.push("Highest price among compared");
        });
      }
    }

    const mileages = vehicles.map((v) => parseNum(v.v_mileage));
    const validMileages = mileages.filter((m) => m !== null);
    if (validMileages.length >= 2) {
      const minMileage = Math.min(...validMileages);
      const maxMileage = Math.max(...validMileages);
      if (minMileage !== maxMileage) {
        vehicles.forEach((v, i) => {
          if (mileages[i] === minMileage) summaries[i].highlights.push({ icon: "mileage", text: "Lowest mileage — less wear" });
          if (mileages[i] === maxMileage) summaries[i].concerns.push("Highest mileage among compared");
        });
      }
    }

    const years = vehicles.map((v) => parseNum(v.v_mod_year));
    const validYears = years.filter((y) => y !== null);
    if (validYears.length >= 2) {
      const maxYear = Math.max(...validYears);
      const minYear = Math.min(...validYears);
      if (minYear !== maxYear) {
        vehicles.forEach((v, i) => {
          if (years[i] === maxYear) summaries[i].highlights.push({ icon: "year", text: "Newest model year" });
          if (years[i] === minYear) summaries[i].concerns.push("Oldest model year among compared");
        });
      }
    }

    const capacities = vehicles.map((v) => parseNum(v.v_capacity));
    const validCapacities = capacities.filter((c) => c !== null);
    if (validCapacities.length >= 2) {
      const maxCap = Math.max(...validCapacities);
      const minCap = Math.min(...validCapacities);
      if (minCap !== maxCap) {
        vehicles.forEach((v, i) => {
          if (capacities[i] === maxCap) summaries[i].highlights.push({ icon: "engine", text: "Largest engine capacity" });
          if (capacities[i] === minCap) summaries[i].highlights.push({ icon: "fuel", text: "Smaller engine — better fuel economy" });
        });
      }
    }

    vehicles.forEach((v, i) => {
      if (v.v_availability_status === "available") {
        summaries[i].highlights.push({ icon: "available", text: "Ready & available now" });
      } else if (v.v_availability_status === "sold") {
        summaries[i].concerns.push("Already sold");
      } else if (v.v_availability_status === "booked") {
        summaries[i].concerns.push("Currently booked");
      }
    });

    const conditions = vehicles.map((v) => (v.v_condition_name || "").toLowerCase());
    vehicles.forEach((v, i) => {
      if (conditions[i].includes("new") || conditions[i].includes("brand new")) {
        summaries[i].highlights.push({ icon: "star", text: "Brand new condition" });
      }
    });

    return summaries;
  };

  const highlightIcon = (type) => {
    switch (type) {
      case "price": return <TrendingDown className="h-4 w-4 text-green-600 shrink-0" />;
      case "mileage": return <Gauge className="h-4 w-4 text-blue-600 shrink-0" />;
      case "year": return <Calendar className="h-4 w-4 text-purple-600 shrink-0" />;
      case "engine": return <Gauge className="h-4 w-4 text-orange-600 shrink-0" />;
      case "fuel": return <Fuel className="h-4 w-4 text-emerald-600 shrink-0" />;
      case "available": return <ThumbsUp className="h-4 w-4 text-green-600 shrink-0" />;
      case "star": return <Star className="h-4 w-4 text-yellow-500 shrink-0" />;
      default: return <ThumbsUp className="h-4 w-4 text-cyan-600 shrink-0" />;
    }
  };

  if (compareItems.length === 0) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <div className="bg-gray-50 rounded-2xl p-10 text-center max-w-md">
            <GitCompare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Products to Compare</h2>
            <p className="text-gray-500 mb-6">
              Add at least 2 products to start comparing. Browse products and tap the compare icon to add them.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse Products
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Navbar />
      <div className="px-4 md:px-8 lg:px-16 pt-8 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Compare <span className="text-cyan-600">Vehicles</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {vehicles.length} of 4 vehicles selected
              {vehicles.length < 2 && " — Add more products to compare"}
            </p>
          </div>
          <button
            onClick={clearCompare}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gray-50 z-10 min-w-[140px] p-4 text-left text-sm font-semibold text-gray-600 border-b border-r border-gray-200">
                    Specification
                  </th>
                  {vehicles.map((vehicle) => (
                    <th
                      key={vehicle.v_id}
                      className="p-4 border-b border-gray-200 min-w-[200px] bg-white"
                    >
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(vehicle.v_id)}
                          className="absolute -top-1 -right-1 bg-red-100 hover:bg-red-200 text-red-500 rounded-full p-1 transition"
                          title="Remove from compare"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-full h-36 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                            {getImageSrc(vehicle) ? (
                              <Image
                                src={getImageSrc(vehicle)}
                                alt={vehicle.v_title}
                                width={240}
                                height={160}
                                className="object-contain h-full w-auto"
                              />
                            ) : (
                              <div className="text-gray-400 text-xs">No Image</div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                              {vehicle.v_title}
                            </p>
                            <p className="text-cyan-600 font-bold text-base mt-1">
                              {getPrice(vehicle)}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              Code: {vehicle.v_code}
                            </p>
                          </div>
                          <Link
                            href={`/product/${vehicle.v_id}`}
                            className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                  {vehicles.length < 4 && (
                    <th className="p-4 border-b border-gray-200 min-w-[200px] bg-white">
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <button
                          onClick={() => router.push("/")}
                          className="border-2 border-dashed border-gray-300 hover:border-cyan-400 rounded-lg p-6 transition flex flex-col items-center gap-2 w-full"
                        >
                          <GitCompare className="h-8 w-8" />
                          <span className="text-sm font-medium">Add Vehicle</span>
                        </button>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ATTRIBUTES.map((attr, idx) => {
                  const diff = isDifferent(attr);
                  return (
                    <tr
                      key={attr.key}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="sticky left-0 bg-inherit z-10 p-3 text-[15px] font-semibold text-gray-800 border-r border-gray-200 whitespace-nowrap">
                        {attr.label}
                      </td>
                      {vehicles.map((vehicle) => {
                        const val = getCellValue(vehicle, attr);
                        return (
                          <td
                            key={vehicle.v_id}
                            className={`p-3 text-[15px] leading-6 text-left ${
                              diff
                                ? "text-[#0167a2] bg-orange-50/60"
                                : "text-gray-800"
                            } ${val === "N/A" ? "text-gray-500 italic" : ""}`}
                          >
                            {attr.key === "v_availability_status" ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  val === "available"
                                    ? "bg-green-100 text-green-700"
                                    : val === "sold"
                                    ? "bg-red-100 text-red-700"
                                    : val === "booked"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {val?.charAt(0).toUpperCase() + val?.slice(1)}
                              </span>
                            ) : (
                              val
                            )}
                          </td>
                        );
                      })}
                      {vehicles.length < 4 && <td className="p-3" />}
                    </tr>
                  );
                })}

                {vehicles.some((v) => v.feature_specification?.length > 0) && (
                  <>
                    <tr className="bg-cyan-50">
                      <td
                        colSpan={vehicles.length + 1 + (vehicles.length < 4 ? 1 : 0)}
                        className="sticky left-0 p-3 text-[15px] font-bold text-cyan-800"
                      >
                        Features & Specifications
                      </td>
                    </tr>
                    {(() => {
                      const vehicleFeatureMaps = vehicles.map((v) => getFeatureValuesByTitle(v));
                      const allTitles = new Set();

                      vehicleFeatureMaps.forEach((featureMap) => {
                        featureMap.forEach((_, title) => allTitles.add(title));
                      });

                      const orderedTitles = [
                        ...FEATURE_DISPLAY_ORDER.filter((title) => allTitles.has(title)),
                        ...[...allTitles].filter((title) => !FEATURE_DISPLAY_ORDER.includes(title)),
                      ];

                      return orderedTitles.map((featureTitle, idx) => {
                        const values = vehicleFeatureMaps.map((featureMap) => {
                          const featureValues = featureMap.get(featureTitle);
                          return featureValues?.length ? featureValues.join(", ") : "N/A";
                        });

                        const featureDiff = new Set(values).size > 1;

                        return (
                          <tr
                            key={featureTitle}
                            className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                          >
                            <td className="sticky left-0 bg-inherit z-10 p-3 text-[15px] font-semibold text-gray-800 border-r border-gray-200 whitespace-nowrap">
                              {featureTitle}
                            </td>
                            {vehicles.map((vehicle, vIdx) => (
                              <td
                                key={vehicle.v_id}
                                className={`p-3 text-[15px] leading-6 text-left ${
                                  featureDiff
                                    ? "text-[#0167a2] bg-orange-50/60"
                                    : "text-gray-800"
                                } ${values[vIdx] === "N/A" ? "text-gray-500 italic" : ""}`}
                              >
                                {values[vIdx]}
                              </td>
                            ))}
                            {vehicles.length < 4 && <td className="p-3" />}
                          </tr>
                        );
                      });
                    })()}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {vehicles.length >= 2 && (() => {
            const summaries = generateSummary();
            if (!summaries) return null;

            const bestIdx = summaries.reduce((best, curr, idx) => {
              return curr.highlights.length > summaries[best].highlights.length ? idx : best;
            }, 0);

            return (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-800">Quick Summary</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {summaries.map((s, idx) => (
                    <div
                      key={s.vehicle.v_id}
                      className={`rounded-xl border p-4 transition-all ${
                        idx === bestIdx
                          ? "border-cyan-400 bg-cyan-50/50 shadow-md ring-1 ring-cyan-200"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-1">
                            {s.vehicle.v_title}
                          </p>
                          <p className="text-cyan-600 font-bold text-sm mt-0.5">
                            {getPrice(s.vehicle)}
                          </p>
                        </div>
                        {idx === bestIdx && (
                          <span className="shrink-0 ml-2 inline-flex items-center gap-1 bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            <ThumbsUp className="h-3 w-3" /> Best Pick
                          </span>
                        )}
                      </div>

                      {s.highlights.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          {s.highlights.map((h, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-2">
                              {highlightIcon(h.icon)}
                              <span className="text-xs text-gray-700">{h.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {s.concerns.length > 0 && (
                        <div className="space-y-1.5 border-t border-gray-100 pt-2">
                          {s.concerns.map((c, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-2">
                              <span className="h-4 w-4 shrink-0 flex items-center justify-center text-amber-500 text-xs">⚠</span>
                              <span className="text-xs text-gray-500">{c}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {s.highlights.length === 0 && s.concerns.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No standout differences</p>
                      )}

                      <Link
                        href={`/product/${s.vehicle.v_id}`}
                        className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition ${
                          idx === bestIdx
                            ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-3 italic">
                  * This summary is auto-generated based on the comparison data. Please review all details before making a decision.
                </p>
              </div>
            );
          })()}
          </>
        )}
      </div>
    </>
  );
};

export default ComparePage;
