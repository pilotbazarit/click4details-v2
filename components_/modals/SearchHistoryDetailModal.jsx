import dayjs from "dayjs";

const SearchHistoryDetailModal = ({ isOpen, onClose, historyItem, parseSearchParams, isEmptyValue, formatValue, allLocations, allShops }) => {
  if (!isOpen || !historyItem) return null;

  const parsed = historyItem.search_params ? parseSearchParams(historyItem.search_params) : null;

  const displayEntries = [];

  if (parsed) {
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
    if (extGradeNames) {
      addDisplayEntry("Ext Grade", extGradeNames);
    }
    if (intGradeNames) {
      addDisplayEntry("Int Grade", intGradeNames);
    }
    if (transmissionNames) {
      addDisplayEntry("Transmission", transmissionNames);
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

    // Add this block for Shops
    if (parsed.shops && Array.isArray(parsed.shops) && allShops && allShops.length > 0) {
      const shopNames = parsed.shops
        .map((shopId) => {
          const foundShop = allShops.find((shop) => shop.value === shopId || shop.value === String(shopId));
          return foundShop ? foundShop.label : null;
        })
        .filter((name) => name !== null)
        .join(", ");
      addDisplayEntry("Shops", shopNames);
    }

    Object.entries(parsed).forEach(([key, value]) => {
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
          "consolidated",
          "operation_type",
          "history_id",
          "customerMobile",
          "location",
          "shops",
        ].includes(key) // Exclude 'consolidated', 'operation_type', 'history_id', 'customerMobile', 'location', and 'shops' fields
      ) {
        addDisplayEntry(key, value);
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl my-8">
        <h2 className="text-xl font-semibold mb-4">Search History Details (ID: {historyItem.id})</h2>
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Date:</strong> {historyItem.created_at ? dayjs(historyItem.created_at).format("YYYY-MM-DD hh:mm a") : "N/A"}
          </p>

          {displayEntries.length > 0 ? (
            <div className="mb-4">
              <h3 className="font-medium text-gray-800 mb-2">Search Parameters:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                {displayEntries.map(([key, value]) => (
                  <div key={key} className="text-sm text-gray-600">
                    <span className="font-semibold capitalize mr-2">{key.replace(/([A-Z])/g, " $1").replaceAll("_", " ")}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No specific search parameters found.</p>
          )}

          {historyItem.visiting_card_image && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Visiting Card:</strong>
              </p>
              <a href={historyItem.visiting_card_image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                <img src={historyItem.visiting_card_image} alt="Visiting Card" className="max-w-full h-auto rounded-md border border-gray-300" />
              </a>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchHistoryDetailModal;
