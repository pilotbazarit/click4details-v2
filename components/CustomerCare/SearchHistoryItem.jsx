import { Edit, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const SearchHistoryItem = ({
  history,
  index,
  formatDate,
  parseSearchParams,
  isEmptyValue,
  formatValue,
  customer,
  handleOpenSearchHistoryModal,
  handleOpenModal, // This will be for non-consolidated items
  onDelete,
  allLocations,
}) => {
  const router = useRouter();

  const renderSearchParams = (historyItem) => {
    if (!historyItem.search_params) return null;

    const parsed = parseSearchParams(historyItem.search_params);
    if (!parsed) return null;

    const packageNames = parsed.package_names;
    const modelNames = parsed.model_names;
    const brandNames = parsed.brand_names;
    const colorNames = parsed.color_names;
    const seatNames = parsed.seat_names;
    const fuelNames = parsed.fuel_fuels;
    const skeletonNames = parsed.skeleton_names;
    const conditionNames = parsed.condition_names;
    const availabilityNames = parsed.availability_names;
    const gradeNames = parsed.grade_grades;
    const transmissionNames = parsed.transmission_names;
    const extGradeNames = parsed.ext_grade_names;
    const intGradeNames = parsed.int_grade_names;

    const displayEntries = [];

    const addDisplayEntry = (label, value) => {
      const formattedValue = formatValue(value);
      if (formattedValue && formattedValue.trim() !== "" && formattedValue.trim().toLowerCase() !== "n/a") {
        displayEntries.push([label, formattedValue]);
      }
    };

    if (brandNames) {
      addDisplayEntry("Brand", brandNames);
    }
    if (modelNames) {
      addDisplayEntry("Model", modelNames);
    }
    if (packageNames) {
      addDisplayEntry("Package", packageNames);
    }
    if (colorNames) {
      addDisplayEntry("Color", colorNames);
    }
    if (conditionNames) {
      addDisplayEntry("Condition", conditionNames);
    }
    if (fuelNames) {
      addDisplayEntry("Fuel", fuelNames);
    }
    if (seatNames) {
      addDisplayEntry("Seat", seatNames);
    }
    if (skeletonNames) {
      addDisplayEntry("Skeleton", skeletonNames);
    }
    if (gradeNames) {
      addDisplayEntry("Grade", gradeNames);
    }
    if (transmissionNames) {
      addDisplayEntry("Transmission", transmissionNames);
    }
    if (extGradeNames) {
      addDisplayEntry("Ext Grade", extGradeNames);
    }
    if (intGradeNames) {
      addDisplayEntry("Int Grade", intGradeNames);
    }

    if (availabilityNames) {
      addDisplayEntry("Availability", availabilityNames);
    }

    // Add this block for Location
    if (parsed.location && Array.isArray(parsed.location) && allLocations && allLocations.length > 0) {
      const locationNames = parsed.location
        .map((locId) => {
          const foundLoc = allLocations.find((loc) => loc.value === locId);
          return foundLoc ? foundLoc.label : null;
        })
        .filter((name) => name !== null)
        .join(", ");
      addDisplayEntry("Location", locationNames);
    }

    // Add all other parameters
    Object.entries(parsed).forEach(([key, value]) => {
      // Only display if the key is not in the list of already displayed "names" fields
      if (
        ![
          "package",
          "package_names",
          "model",
          "model_names",
          "brand",
          "color",
          "seat",
          "fuel",
          "skeleton",
          "condition",
          "brand_names",
          "color_names",
          "seat_names",
          "fuel_names",
          "skeleton_names",
          "condition_names",
          "availability",
          "availability_names",
          "grade",
          "grade_grades",
          "transmission",
          "transmission_names",
          "ext_grade",
          "int_grade",
          "ext_grade_names",
          "int_grade_names",
          "consolidated", // Exclude 'consolidated' field
          "operation_type", // Exclude 'operation_type' field
          "history_id", // Exclude 'history_id' field
          "customerMobile", // Exclude 'customerMobile' field
          "location", // Exclude 'location' field as it's handled separately
        ].includes(key)
      ) {
        addDisplayEntry(key, value);
      }
    });

    if (displayEntries.length === 0) return null;

    const gridColsClass =
      historyItem.consolidated === 1 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"; // 4-column layout for non-consolidated

    return (
      <div className="mb-2">
        <div className={`grid ${gridColsClass} gap-x-6 gap-y-1`}>
          {displayEntries.map(([key, value]) => (
            <div key={key} className="text-sm text-gray-600">
              <span className="font-semibold capitalize mr-2">{key.replace(/([A-Z])/g, " $1").replaceAll("_", " ")}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      key={history.id || index}
      className={`border border-gray-200 rounded-lg p-4 ${history.consolidated === 1 ? "bg-blue-100/50 w-full" : "bg-white max-w-sm"}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-4">
          <h3
            className="font-medium text-orange-900 cursor-pointer"
            onClick={() => {
              const parsedSearchParams = typeof history.search_params === "string" ? JSON.parse(history.search_params) : history.search_params;
              const prepopulatedData = {
                ...parsedSearchParams,
                consolidated: history.consolidated,
                customerMobile: customer?.mobile,
                operation_type: "update_search",
                history_id: history.id,
              };
              localStorage.setItem("prepopulatedFilterData", JSON.stringify(prepopulatedData));
              router.push("/filter-products/");
            }}
          >
            Search ID: {history.id}
          </h3>
          <div className="flex items-center space-x-2">
            {history.consolidated === 1 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling to the h3
                  handleOpenSearchHistoryModal(history);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling to the h3
                    handleOpenModal(history); // Open modal for non-consolidated
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(history);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        <span className="text-sm text-gray-500">{history.created_at ? formatDate(history.created_at) : "N/A"}</span>
      </div>
      {history.consolidated === 1 && renderSearchParams(history)}

      {history.consolidated === 1 && history.visiting_card_image && (
        <div className="mb-2">
          <p className="text-sm text-gray-600">
            <strong>Visiting Card:</strong>
            <a href={history.visiting_card_image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
              View Image
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchHistoryItem;
