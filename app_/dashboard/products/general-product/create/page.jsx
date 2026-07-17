"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Wand2,
  X,
} from "lucide-react";

import { useAppContext } from "@/context/AppContext";
import PblHistoryPanel from "@/components/PblHistoryPanel";
import CategoryService from "@/services/CategoryService";
import GeneralProductService from "@/services/GeneralProductService";
import LocationService from "@/services/LocationService";
import MasterDataService from "@/services/MasterDataService";
import OutletService from "@/services/OutletService";
import PackageService from "@/services/PackageService";
import ShopService from "@/services/ShopService";
import SupplierService from "@/services/SupplierService";
import VehicleModelService from "@/services/VehicleModelService";
import constData from "@/lib/constant";
import { hasPermission } from "@/lib/utils";
import { formatPermissions } from "@/helpers/functions";

const DRAFT_PREFIX = "pbl.general-product";

const steps = [
  { key: "basic", label: "Basic Information" },
  { key: "media", label: "Media" },
  { key: "attributes", label: "Attributes" },
  { key: "variants", label: "Variants" },
  { key: "inventory", label: "Inventory" },
  { key: "review", label: "Review & Publish" },
];

const attributePresets = ["Color", "Size", "Material", "Storage", "RAM", "Format"];

const emptyBasic = {
  productName: "",
  productTypeId: "",
  categoryId: "",
  brandId: "",
  modelId: "",
  packageId: "",
  shopId: "",
  supplierId: "",
  outletId: "",
  countryId: "",
  locationId: "",
  videoLink: "",
  shortDescription: "",
  pblTest: "",
  productDetails: "",
  saleByPbl: false,
  pblPartnershipExpireDate: "",
  showSellerMobile: false,
  status: "active",
  secretText: "",
  secretVideoLink: "",
};

const emptyInventory = {
  trackInventory: true,
  lowStockAlert: 5,
  backorderPolicy: "deny",
};

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const initialAttributes = [
  { id: "attribute-color", name: "Color", valueDraft: "", values: [] },
  { id: "attribute-size", name: "Size", valueDraft: "", values: [] },
];

const createAttribute = (name = "") => ({
  id: newId(),
  name,
  valueDraft: "",
  values: [],
});

const createVariant = (attributes = {}, index = 1) => {
  const name = variantName(attributes) || `Variant ${index}`;

  return {
    id: newId(),
    name,
    sku: skuFromName(name, index),
    costPrice: "",
    sellingPrice: "",
    discountPrice: "",
    discountPercent: "",
    b2bPrice: "",
    additionalPrice: "",
    wholesalePrice: "",
    stockQuantity: "",
    status: "active",
    attributes,
  };
};

const parseUser = (value) => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    return null;
  }
};

const toOptions = (items, valueKey, labelKey) =>
  (items || []).map((item) => ({
    value: String(item[valueKey]),
    label: item[labelKey],
  }));

const canSeeAllShops = (user) =>
  ["supreme", "super_admin", "admin", "pbl"].includes(String(user?.user_mode || "").toLowerCase());

const canManagePblSale = (user) => {
  const mode = String(user?.user_mode || "").toLowerCase();
  if (["supreme", "super_admin", "admin", "pbl"].includes(mode)) return true;

  const rawPermissions = user?.permissions;
  if (!Array.isArray(rawPermissions)) return false;

  return rawPermissions.some((permission) => {
    const text = typeof permission === "string" ? permission : JSON.stringify(permission);
    return /pbl|sale.*approve|approve.*sale|general product/i.test(text || "");
  });
};

const checkAdditionalPriceAccess = (user) => {
  const mode = String(user?.user_mode || "").toLowerCase();
  if (["supreme", "super_admin"].includes(mode)) return true;

  const rawPermissions = user?.permissions;
  if (!Array.isArray(rawPermissions)) return false;

  return rawPermissions.some((permission) => {
    const text = typeof permission === "string" ? permission : JSON.stringify(permission);
    return /productAdditionalPriceView/i.test(text || "");
  });
};

const toShopOptions = (items) => {
  const unique = new Map();

  (items || []).forEach((item) => {
    const shop = item?.shop || item;
    if (!shop?.s_id) return;
    unique.set(String(shop.s_id), {
      value: String(shop.s_id),
      label: shop.s_title,
      phone: shop?.user?.phone || shop?.s_user_phone || item?.user?.phone || "",
      userId: shop.s_user_id || item?.s_user_id || shop?.user?.id || item?.user?.id,
    });
  });

  return Array.from(unique.values());
};

const toVehicleModelOptions = (items) =>
  (items || []).map((item) => ({
    value: String(item.vm_id),
    label: item.vm_name,
  }));

const toPackageOptions = (items) =>
  (items || []).map((item) => ({
    value: String(item.p_id),
    label: item.p_name,
  }));

const toLocationOptions = (items) =>
  (items || []).map((item) => ({
    value: String(item.l_id ?? item.id),
    label: item.l_name ?? item.name,
  }));

const toSupplierOptions = (items) =>
  (items || []).map((item) => ({
    value: String(item.s_id),
    label: item.s_name,
    userId: item.s_user_id,
  }));

const variantName = (attributes) => Object.values(attributes || {}).filter(Boolean).join(" / ");

const skuFromName = (name, index) => {
  const base = String(name || `VARIANT-${index}`)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return base ? `${base}-${index}` : `VARIANT-${index}`;
};

const cartesian = (groups) => {
  if (!groups.length) return [];

  return groups.reduce(
    (acc, group) =>
      acc.flatMap((combination) =>
        group.values.map((value) => ({
          ...combination,
          [group.name]: value,
        }))
      ),
    [{}]
  );
};

const moneyOrBlank = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const number = Number(value);
  return Number.isNaN(number) ? "" : number.toFixed(2);
};

const draftKeyFor = (mode, productId) => `${DRAFT_PREFIX}.${mode}.${productId || "new"}.draft.v2`;

const cloneInitialAttributes = () => initialAttributes.map((attribute) => ({ ...attribute, values: [] }));

const cloneEmptyMoreInformation = () => [{ id: "more-info-0", key: "", value: "" }];

const createMoreInformationRow = (key = "", value = "") => ({
  id: newId(),
  key,
  value,
});

const stringValue = (value) => (value === null || value === undefined ? "" : String(value));

const maybeJson = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const arrayValue = (value) => {
  const parsed = maybeJson(value);
  return Array.isArray(parsed) ? parsed : [];
};

const imageUrl = (image) => {
  const parsed = maybeJson(image);

  if (!parsed) return "";
  if (typeof parsed === "string") return parsed;

  return parsed.secure_url || parsed.url || "";
};

// like imageUrl(), but also keeps the S3/document public_id so a removed existing
// image can be reported back to the API (see pv_images_remove / p_images_remove).
const imageMeta = (image) => {
  const parsed = maybeJson(image);

  if (!parsed) return null;
  if (typeof parsed === "string") return parsed ? { url: parsed, publicId: "" } : null;

  const url = parsed.secure_url || parsed.url || "";
  return url ? { url, publicId: parsed.public_id || "" } : null;
};

const readDraft = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const attributesFromOptions = (options = []) =>
  options.reduce((attributes, option, index) => {
    const rawValue =
      option?.display_value ||
      option?.pvo_value_text ||
      option?.attribute_value?.fs_title ||
      option?.attributeValue?.fs_title ||
      "";
    const rawAttribute = option?.attribute?.md_title || option?.attribute?.md_name || "";

    if (!rawValue && !rawAttribute) return attributes;

    if (typeof rawValue === "string" && rawValue.includes(":")) {
      const separator = rawValue.indexOf(":");
      const name = rawValue.slice(0, separator).trim();
      const value = rawValue.slice(separator + 1).trim();
      if (name && value) attributes[name] = value;
      return attributes;
    }

    attributes[rawAttribute || `Option ${index + 1}`] = rawValue;
    return attributes;
  }, {});

const variantsFromProduct = (product) => {
  const apiVariants = Array.isArray(product?.variants) ? product.variants : [];

  if (!apiVariants.length) {
    const legacyPrice = Array.isArray(product?.prices) ? product.prices[0] : null;
    if (!legacyPrice) return [];

    return [
      {
        id: `variant-legacy-${product?.p_id || newId()}`,
        backendId: null,
        name: "Default",
        sku: product?.p_code || skuFromName(product?.p_name || "Default", 1),
        costPrice: stringValue(legacyPrice?.pp_purchase_price),
        sellingPrice: stringValue(legacyPrice?.pp_regular_price),
        discountPrice: stringValue(legacyPrice?.pp_discount_price),
        discountPercent: "",
        b2bPrice: "",
        additionalPrice: "",
        wholesalePrice: stringValue(legacyPrice?.pp_wholesale_price),
        stockQuantity: "",
        lowStockThreshold: "5",
        status: product?.p_status || "active",
        attributes: {},
        existingPrimaryImage: null,
        existingGalleryImages: [],
      },
    ];
  }

  return apiVariants.map((item, index) => {
    const attributes = attributesFromOptions(item?.options || []);
    const name = item?.pv_title || item?.pv_option_summary || variantName(attributes) || `Variant ${index + 1}`;

    return {
      id: `variant-${item?.pv_id || newId()}`,
      backendId: item?.pv_id || null,
      name,
      sku: item?.pv_sku || skuFromName(name, index + 1),
      costPrice: stringValue(item?.pv_purchase_price),
      sellingPrice: stringValue(item?.pv_regular_price),
      discountPrice: stringValue(item?.pv_discount_price),
      discountPercent: "",
      b2bPrice: stringValue(item?.pv_b2b_price || ""),
      additionalPrice: stringValue(item?.pv_additional_price || ""),
      wholesalePrice: stringValue(item?.pv_wholesale_price),
      stockQuantity: stringValue(item?.pv_stock_qty),
      lowStockThreshold: stringValue(item?.pv_low_stock_threshold),
      status: item?.pv_status || "active",
      attributes,
      existingPrimaryImage: imageMeta(item?.pv_primary_image),
      existingGalleryImages: arrayValue(item?.pv_images).map(imageMeta).filter(Boolean),
    };
  });
};

const attributesFromVariants = (items) => {
  const grouped = new Map();

  items.forEach((variant) => {
    Object.entries(variant.attributes || {}).forEach(([name, value]) => {
      if (!name || !value) return;
      const existing = grouped.get(name) || new Set();
      existing.add(value);
      grouped.set(name, existing);
    });
  });

  if (!grouped.size) return cloneInitialAttributes();

  return Array.from(grouped.entries()).map(([name, values]) => ({
    id: newId(),
    name,
    valueDraft: "",
    values: Array.from(values),
  }));
};

const moreInformationFromProduct = (product) => {
  const rows = product?.extended_data || product?.extendedData || [];
  const normalizedRows = (Array.isArray(rows) ? rows : [])
    .map((item, index) => ({
      id: `more-info-${item?.ed_id || index}`,
      key: stringValue(item?.ed_entity_key).trim(),
      value: stringValue(item?.ed_entity_value).trim(),
    }))
    .filter((item) => item.key || item.value);

  return normalizedRows.length ? normalizedRows : cloneEmptyMoreInformation();
};

const validMoreInformation = (items = []) =>
  items
    .map((item) => ({
      key: stringValue(item.key).trim(),
      value: stringValue(item.value).trim(),
    }))
    .filter((item) => item.key || item.value);

const FieldError = ({ message }) => {
  if (!message) return null;

  return (
    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
      <AlertCircle className="h-4 w-4" />
      {message}
    </p>
  );
};

const TextInput = ({ label, error, className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
    <input
      {...props}
      className={`h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:border-slate-900 ${error ? "border-red-400" : "border-slate-300"
        }`}
    />
    <FieldError message={error} />
  </label>
);

const SelectInput = ({ label, error, options, placeholder = "Select", className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
    <select
      {...props}
      className={`h-10 w-full rounded-md border bg-white px-3 text-sm outline-none transition focus:border-slate-900 ${error ? "border-red-400" : "border-slate-300"
        }`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <FieldError message={error} />
  </label>
);

const SearchableSelect = ({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = "Select",
  className = "",
  disabled = false,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) => {
    const term = query.toLowerCase();
    return (
      String(option.label || "").toLowerCase().includes(term) ||
      String(option.phone || "").toLowerCase().includes(term)
    );
  });

  return (
    <label className={`relative block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        disabled={disabled}
        className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm outline-none transition focus:border-slate-900 disabled:bg-slate-100 disabled:text-slate-400 ${error ? "border-red-400" : "border-slate-300"
          }`}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>{selected?.label || placeholder}</span>
        {value ? (
          <X
            className="h-4 w-4 text-slate-400"
            onMouseDown={(event) => {
              event.preventDefault();
              onChange("");
              setQuery("");
            }}
          />
        ) : (
          <Search className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={query}
              placeholder="Search..."
              className="h-8 w-full text-sm outline-none"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="max-h-56 overflow-auto py-1">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${option.value === value ? "bg-slate-100 font-medium text-slate-900" : "text-slate-700"
                    }`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onChange(option.value, option);
                    setQuery("");
                    setIsOpen(false);
                  }}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>{option.label}</span>
                    {option.phone ? <span className="text-xs text-slate-400">{option.phone}</span> : null}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-slate-500">No results</div>
            )}
          </div>
        </div>
      )}
      <FieldError message={error} />
    </label>
  );
};

const FileDrop = ({ label, multiple = false, value, onChange, accept = "image/*", error, existingCount = 0, previewUrl = "", onClear }) => {
  const count = Array.isArray(value) ? value.length : value ? 1 : 0;
  const displayCount = count || existingCount;
  const showPreview = previewUrl && !count;

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <label
          className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-white px-4 py-5 text-center ${error ? "border-red-400" : "border-slate-300"
            }`}
        >
          {showPreview ? (
            <img src={previewUrl} alt="" className="mb-2 h-14 w-14 rounded-md object-cover" />
          ) : (
            <ImagePlus className="mb-2 h-6 w-6 text-slate-500" />
          )}
          <span className="text-sm font-medium text-slate-700">
            {displayCount ? `${displayCount} ${count ? "selected" : "existing"}` : "Upload"}
          </span>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              onChange(multiple ? files : files[0] || null);
            }}
          />
        </label>
        {showPreview && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
};

export function GeneralProductFormWizard({ mode = "create", productId = "" } = {}) {
  const router = useRouter();
  const { user: contextUser, permissionList } = useAppContext();
  const currentUser = useMemo(() => parseUser(contextUser), [contextUser]);
  const isEdit = mode === "edit";
  const draftKey = useMemo(() => draftKeyFor(isEdit ? "edit" : "create", productId), [isEdit, productId]);

  const [activeStep, setActiveStep] = useState(0);
  const [basic, setBasic] = useState(emptyBasic);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [pblImage, setPblImage] = useState(null);
  const [existingFeaturedImage, setExistingFeaturedImage] = useState(null);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [existingPblImage, setExistingPblImage] = useState(null);
  const [removedFeaturedImagePublicId, setRemovedFeaturedImagePublicId] = useState("");
  const [removedGalleryImages, setRemovedGalleryImages] = useState([]);
  const [removedPblImagePublicId, setRemovedPblImagePublicId] = useState("");
  const [secretDocs, setSecretDocs] = useState([]);
  const [existingSecretDocs, setExistingSecretDocs] = useState([]);
  const [secretDocs2, setSecretDocs2] = useState([]);
  const [existingSecretDocs2, setExistingSecretDocs2] = useState([]);
  const [sellerInfoRows, setSellerInfoRows] = useState([{ name: "", phone: "" }]);
  const [attributes, setAttributes] = useState(cloneInitialAttributes);
  const [variants, setVariants] = useState([]);
  const [variantMedia, setVariantMedia] = useState({});
  const [inventory, setInventory] = useState(emptyInventory);
  const [moreInformation, setMoreInformation] = useState(cloneEmptyMoreInformation);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(isEdit);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [bulk, setBulk] = useState({ sellingPrice: "", stockQuantity: "" });

  const [productTypeOptions, setProductTypeOptions] = useState([]);
  const [categoryLevels, setCategoryLevels] = useState([]);
  const [categoryPath, setCategoryPath] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);
  const [shopOptions, setShopOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [outletOptions, setOutletOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const currentStep = steps[activeStep];
  const hasVariants = variants.length > 0;
  const actionLabel = isEdit ? "Update" : "Publish";
  const actionBusyLabel = isEdit ? "Updating" : "Publishing";
  const pageTitle = isEdit ? "Edit Product" : "Create Product";
  const canApprovePblSale = canManagePblSale(currentUser);
  const showAdditionalPrice = checkAdditionalPriceAccess(currentUser);

  const canManagePbl = (targetUser = currentUser) => {
    if (!targetUser) return false;
    const targetPermissions = permissionList?.length ? permissionList : formatPermissions(targetUser?.permissions ?? []);
    const userMode = String(targetUser?.user_mode ?? "").toLowerCase();
    return userMode === "supreme" || hasPermission(targetPermissions, 0, "Product", "Create");
  };

  const handleSellerInfoChange = (index, field, value) => {
    setSellerInfoRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const handleAddSellerInfoRow = () => {
    setSellerInfoRows((prev) => [...prev, { name: "", phone: "" }]);
  };

  const handleRemoveSellerInfoRow = (index) => {
    setSellerInfoRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  useEffect(() => {
    if (isEdit) return;

    const draft = readDraft(draftKey);
    if (!draft) return;

    setBasic({ ...emptyBasic, ...(draft.basic || {}) });
    setAttributes(Array.isArray(draft.attributes) && draft.attributes.length ? draft.attributes : cloneInitialAttributes());
    setVariants(Array.isArray(draft.variants) ? draft.variants : []);
    setInventory({ ...emptyInventory, ...(draft.inventory || {}) });
    setMoreInformation(Array.isArray(draft.moreInformation) && draft.moreInformation.length ? draft.moreInformation : cloneEmptyMoreInformation());
    setActiveStep(Number.isInteger(draft.activeStep) ? draft.activeStep : 0);
  }, [draftKey, isEdit]);

  useEffect(() => {
    if (!isEdit || !productId) return;

    let isMounted = true;

    const hydrateProduct = async () => {
      setIsProductLoading(true);

      try {
        const response = await GeneralProductService.Queries.getGeneralProductDetailById(productId);

        if (response?.status !== "success" || !response?.data) {
          toast.error(response?.message || "Product could not be loaded.");
          return;
        }

        const product = response.data;
        const description = maybeJson(product?.p_description) || {};
        const productVariants = variantsFromProduct(product);
        const variantMediaById = productVariants.reduce((media, variant) => {
          media[variant.id] = {
            existingPrimaryImage: variant.existingPrimaryImage,
            existingGalleryImages: variant.existingGalleryImages,
          };
          return media;
        }, {});

        if (!isMounted) return;

        setBasic({
          ...emptyBasic,
          productName: product?.p_name || "",
          productTypeId: stringValue(product?.p_type_id),
          categoryId: stringValue(product?.p_category_id),
          brandId: stringValue(product?.p_brand_id ?? product?.brand?.md_id),
          modelId: stringValue(product?.p_model_id ?? product?.model?.vm_id ?? product?.model?.md_id),
          packageId: stringValue(product?.p_package_id ?? product?.package?.p_id ?? product?.package?.md_id),
          shopId: stringValue(product?.p_shop_id ?? product?.shop?.s_id),
          supplierId: stringValue(product?.p_supplier_id ?? product?.supplier?.s_id),
          outletId: stringValue(product?.p_outlet_id ?? product?.outlet?.uo_id),
          countryId: stringValue(product?.p_country_id ?? product?.country?.md_id ?? product?.location?.l_country_id ?? product?.location?.country_id),
          locationId: stringValue(product?.p_location_id ?? product?.location?.id ?? product?.location?.l_id),
          videoLink: product?.p_video_link || "",
          shortDescription: description?.pbl || description?.meta || "",
          pblTest: description?.pbl_test || "",
          productDetails: description?.user || "",
          saleByPbl: Number(product?.p_is_saleBy_pbl) === 1,
          pblPartnershipExpireDate: product?.p_pbl_partnership_expire_date || "",
          showSellerMobile: Number(product?.p_show_seller_mobile) === 1,
          status: product?.p_status || "active",
          secretText: product?.p_secret_text || "",
          secretVideoLink: product?.p_secret_video_link || "",
        });
        if (product?.p_category_id && product?.category?.c_name) {
          const selectedCategory = {
            value: stringValue(product.p_category_id),
            label: product.category.c_name,
          };
          setCategoryPath([selectedCategory]);
          setCategoryLevels([[selectedCategory]]);
        }
        setFeaturedImage(null);
        setGalleryImages([]);
        setPblImage(null);
        setExistingFeaturedImage(imageMeta(product?.p_primary_image || product?.p_default_image));
        setExistingGalleryImages(arrayValue(product?.p_images).map(imageMeta).filter(Boolean));
        setExistingPblImage(imageMeta(product?.p_pbl_image));
        setRemovedFeaturedImagePublicId("");
        setRemovedGalleryImages([]);
        setRemovedPblImagePublicId("");
        setSecretDocs([]);
        setExistingSecretDocs(arrayValue(product?.p_secret_docs).map(imageUrl).filter(Boolean));
        setSecretDocs2([]);
        setExistingSecretDocs2(arrayValue(product?.p_secret_docs_2).map(imageUrl).filter(Boolean));
        const existingSellerInfo = arrayValue(product?.p_seller_info)
          .map((seller) => ({ name: seller?.name || "", phone: seller?.phone || "" }))
          .filter((seller) => seller.name || seller.phone);
        setSellerInfoRows(existingSellerInfo.length ? existingSellerInfo : [{ name: "", phone: "" }]);
        setVariants(productVariants);
        setVariantMedia(variantMediaById);
        setAttributes(attributesFromVariants(productVariants));
        setMoreInformation(moreInformationFromProduct(product));
        setInventory({
          ...emptyInventory,
          trackInventory: true,
          lowStockAlert: productVariants[0]?.pv_low_stock_threshold || productVariants[0]?.lowStockThreshold || 5,
        });

        const draft = readDraft(draftKey);
        if (draft) {
          setBasic((current) => ({ ...current, ...(draft.basic || {}) }));
          setAttributes(Array.isArray(draft.attributes) && draft.attributes.length ? draft.attributes : attributesFromVariants(productVariants));
          setVariants(Array.isArray(draft.variants) ? draft.variants : productVariants);
          setInventory((current) => ({ ...current, ...(draft.inventory || {}) }));
          setMoreInformation(Array.isArray(draft.moreInformation) && draft.moreInformation.length ? draft.moreInformation : moreInformationFromProduct(product));
          setActiveStep(Number.isInteger(draft.activeStep) ? draft.activeStep : 0);
        }
      } catch (error) {
        if (isMounted) toast.error(error?.response?.data?.message || "Product could not be loaded.");
      } finally {
        if (isMounted) setIsProductLoading(false);
      }
    };

    hydrateProduct();

    return () => {
      isMounted = false;
    };
  }, [draftKey, isEdit, productId]);

  useEffect(() => {
    if (isProductLoading) return undefined;

    const draft = {
      activeStep,
      basic,
      attributes,
      variants,
      inventory,
      moreInformation,
      savedAt: new Date().toISOString(),
    };

    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setLastSavedAt(new Date());
    }, 500);

    return () => clearTimeout(timer);
  }, [activeStep, basic, attributes, draftKey, inventory, isProductLoading, moreInformation, variants]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const shopRequest = canSeeAllShops(currentUser)
          ? ShopService.Queries.getShops({
            _page: 1,
            _perPage: 1000,
            order: "desc",
            orderBy: "s_id",
          })
          : currentUser?.id
            ? ShopService.Queries.getShopsWithCompanyShops({
              _user_id: currentUser.id,
              _type: "all",
              _page: 1,
              _perPage: 1000,
            })
            : Promise.resolve({ data: [] });

        const [typesRes, brandsRes, countriesRes, shopsRes] = await Promise.all([
          CategoryService.Queries.getCategories({ _page: 1, _perPage: 1000, _parent_id: 0 }),
          MasterDataService.Queries.getMasterDataByTypeCode(constData.BRAND_MD_CODE),
          MasterDataService.Queries.getMasterDataByTypeCode(constData.COUNTRY_CODE),
          shopRequest,
        ]);

        setProductTypeOptions(toOptions(typesRes?.data?.data, "c_id", "c_name"));
        setBrandOptions(toOptions(brandsRes?.data?.master_data, "md_id", "md_title"));
        setCountryOptions(toOptions(countriesRes?.data?.master_data, "md_id", "md_title"));
        setShopOptions(toShopOptions(canSeeAllShops(currentUser) ? shopsRes?.data?.data : shopsRes?.data));
      } catch (error) {
        toast.error(error?.message || "Failed to load product form data");
      }
    };

    loadInitialData();
  }, [currentUser?.id, currentUser?.user_mode]);

  useEffect(() => {
    if (!basic.productTypeId) {
      setCategoryLevels([]);
      return;
    }

    const loadCategories = async () => {
      try {
        const response = await CategoryService.Queries.getCategories({
          _page: 1,
          _perPage: 1000,
          _parent_id: basic.productTypeId,
        });
        setCategoryLevels([toOptions(response?.data?.data, "c_id", "c_name")]);
      } catch {
        setCategoryLevels([]);
      }
    };

    loadCategories();
  }, [basic.productTypeId]);

  useEffect(() => {
    if (!basic.brandId) {
      setModelOptions([]);
      return;
    }

    const loadModels = async () => {
      try {
        const response = await VehicleModelService.Queries.getModelsByBrand({
          _page: 1,
          _perPage: 1000,
          _brand_id: basic.brandId,
        });
        setModelOptions(toVehicleModelOptions(response?.data?.data));
      } catch {
        setModelOptions([]);
      }
    };

    loadModels();
  }, [basic.brandId]);

  useEffect(() => {
    if (!basic.modelId) {
      setPackageOptions([]);
      return;
    }

    const loadPackages = async () => {
      try {
        const response = await PackageService.Queries.getPackageById({
          _page: 1,
          _perPage: 1000,
          _model_id: basic.modelId,
        });
        setPackageOptions(toPackageOptions(response?.data?.data));
      } catch {
        setPackageOptions([]);
      }
    };

    loadPackages();
  }, [basic.modelId]);

  useEffect(() => {
    if (!basic.shopId) {
      setOutletOptions([]);
      return;
    }

    const loadOutlets = async () => {
      try {
        const response = await OutletService.Queries.getOutletByShopId({
          _page: 1,
          _perPage: 1000,
          _shop_id: basic.shopId,
        });
        setOutletOptions(toOptions(response?.data?.data, "uo_id", "uo_name"));
      } catch {
        setOutletOptions([]);
      }
    };

    loadOutlets();
  }, [basic.shopId]);

  useEffect(() => {
    if (!basic.shopId) {
      setSupplierOptions([]);
      return;
    }

    const loadSuppliers = async () => {
      try {
        const selectedShop = shopOptions.find((option) => option.value === basic.shopId);
        const params = {
          _page: 1,
          _perPage: 1000,
          _status: "active",
          orderBy: "s_name",
          order: "ASC",
        };

        if (canSeeAllShops(currentUser) && selectedShop?.userId) {
          params._user_id = selectedShop.userId;
        }

        const response = await SupplierService.Queries.getSuppliers(params);
        setSupplierOptions(toSupplierOptions(response?.data?.data));
      } catch {
        setSupplierOptions([]);
      }
    };

    loadSuppliers();
  }, [basic.shopId, currentUser?.id, currentUser?.user_mode, shopOptions]);

  useEffect(() => {
    if (!basic.countryId) {
      setLocationOptions([]);
      return;
    }

    const loadLocations = async () => {
      try {
        const response = await LocationService.Queries.getLocationByCountryId({
          _page: 1,
          _perPage: 1000,
          _country_id: basic.countryId,
        });
        setLocationOptions(toLocationOptions(response?.data?.data));
      } catch {
        setLocationOptions([]);
      }
    };

    loadLocations();
  }, [basic.countryId]);

  const setBasicValue = (key, value) => {
    setBasic((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const chooseProductType = (value) => {
    setBasic((current) => ({
      ...current,
      productTypeId: value,
      categoryId: "",
    }));
    setCategoryPath([]);
    setCategoryLevels([]);
    setErrors((current) => ({ ...current, productTypeId: undefined, categoryId: undefined }));
  };

  const chooseBrand = (value) => {
    setBasic((current) => ({
      ...current,
      brandId: value,
      modelId: "",
      packageId: "",
    }));
    setModelOptions([]);
    setPackageOptions([]);
  };

  const chooseModel = (value) => {
    setBasic((current) => ({ ...current, modelId: value, packageId: "" }));
    setPackageOptions([]);
  };

  const chooseShop = (value) => {
    setBasic((current) => ({ ...current, shopId: value, supplierId: "", outletId: "" }));
    setOutletOptions([]);
    setSupplierOptions([]);
    setErrors((current) => ({ ...current, shopId: undefined }));
  };

  const chooseCountry = (value) => {
    setBasic((current) => ({ ...current, countryId: value, locationId: "" }));
    setLocationOptions([]);
  };

  const chooseCategoryAtLevel = async (levelIndex, value, option) => {
    const nextPath = [...categoryPath.slice(0, levelIndex), option].filter(Boolean);
    setCategoryPath(nextPath);
    setBasicValue("categoryId", value);

    try {
      const response = await CategoryService.Queries.getCategories({
        _page: 1,
        _perPage: 1000,
        _parent_id: value,
      });
      const children = toOptions(response?.data?.data, "c_id", "c_name");
      setCategoryLevels((current) => {
        const nextLevels = current.slice(0, levelIndex + 1);
        return children.length ? [...nextLevels, children] : nextLevels;
      });
    } catch {
      setCategoryLevels((current) => current.slice(0, levelIndex + 1));
    }
  };

  const setAttribute = (id, patch) => {
    setAttributes((current) => current.map((attribute) => (attribute.id === id ? { ...attribute, ...patch } : attribute)));
  };

  const setMoreInformationRow = (id, patch) => {
    setMoreInformation((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addMoreInformationRow = () => {
    setMoreInformation((current) => [...current, createMoreInformationRow()]);
  };

  const removeMoreInformationRow = (id) => {
    setMoreInformation((current) => {
      const nextRows = current.filter((row) => row.id !== id);
      return nextRows.length ? nextRows : cloneEmptyMoreInformation();
    });
  };

  const addAttributeValue = (id) => {
    setAttributes((current) =>
      current.map((attribute) => {
        if (attribute.id !== id) return attribute;

        const incomingValues = attribute.valueDraft
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
        const values = Array.from(new Set([...attribute.values, ...incomingValues]));

        return { ...attribute, valueDraft: "", values };
      })
    );
  };

  const removeAttributeValue = (attributeId, value) => {
    setAttributes((current) =>
      current.map((attribute) =>
        attribute.id === attributeId
          ? { ...attribute, values: attribute.values.filter((item) => item !== value) }
          : attribute
      )
    );
  };

  const generateVariants = () => {
    const usableAttributes = attributes
      .map((attribute) => ({
        name: attribute.name.trim(),
        values: attribute.values.filter(Boolean),
      }))
      .filter((attribute) => attribute.name && attribute.values.length);

    const combinations = cartesian(usableAttributes);

    if (!combinations.length) {
      setErrors((current) => ({ ...current, attributes: "Add at least one attribute value set." }));
      return;
    }

    const existingByName = new Map(variants.map((variant) => [variant.name, variant]));
    const generated = combinations.map((attributesMap, index) => {
      const name = variantName(attributesMap);
      return existingByName.get(name) || createVariant(attributesMap, index + 1);
    });

    setVariants(generated);
    setErrors((current) => ({ ...current, variants: undefined, attributes: undefined }));
    setActiveStep(3);
  };

  const addSingleVariant = () => {
    setVariants((current) => [...current, createVariant({}, current.length + 1)]);
  };

  const setVariant = (id, key, value) => {
    setVariants((current) =>
      current.map((variant) => {
        if (variant.id !== id) return variant;
        const updated = { ...variant, [key]: value };
        const selling = Number(key === "sellingPrice" ? value : variant.sellingPrice) || 0;
        if (key === "discountPrice") {
          const dp = Number(value) || 0;
          updated.discountPercent = selling > 0 && dp > 0 ? String(Math.round((1 - dp / selling) * 100)) : "";
        } else if (key === "discountPercent") {
          const pct = Number(value) || 0;
          updated.discountPrice = selling > 0 && pct > 0 ? String(Math.round(selling * (1 - pct / 100))) : "";
        } else if (key === "sellingPrice") {
          const dp = Number(variant.discountPrice) || 0;
          const pct = Number(variant.discountPercent) || 0;
          if (dp > 0) {
            updated.discountPercent = selling > 0 ? String(Math.round((1 - dp / selling) * 100)) : "";
          } else if (pct > 0) {
            updated.discountPrice = selling > 0 ? String(Math.round(selling * (1 - pct / 100))) : "";
          }
        }
        return updated;
      })
    );
  };

  const applyBulk = (key, value) => {
    if (value === "") return;
    setVariants((current) => current.map((variant) => ({ ...variant, [key]: value })));
  };

  const setAllStatuses = (status) => {
    setVariants((current) => current.map((variant) => ({ ...variant, status })));
  };

  const validateStep = (stepKey = currentStep.key) => {
    const nextErrors = {};

    if (stepKey === "basic" || stepKey === "review") {
      if (!basic.productName.trim()) nextErrors.productName = "Product name is required.";
      if (!basic.shopId) nextErrors.shopId = "Shop is required.";
      if (!basic.productTypeId) nextErrors.productTypeId = "Product type is required.";
      if (!basic.categoryId) nextErrors.categoryId = "Category is required.";
    }

    if (stepKey === "media" || stepKey === "review") {
      if (!featuredImage && !existingFeaturedImage) nextErrors.featuredImage = "Featured image is required.";
    }

    if (stepKey === "attributes") {
      const incomplete = attributes.some((attribute) => attribute.name.trim() && attribute.values.length === 0);
      if (incomplete) nextErrors.attributes = "Each active attribute needs at least one value.";
    }

    if (stepKey === "variants" || stepKey === "review") {
      if (!variants.length) nextErrors.variants = "At least one variant is required.";
      variants.forEach((variant, index) => {
        if (!variant.name.trim()) nextErrors[`variant_${index}_name`] = "Variant name is required.";
        if (variant.status === "active" && !variant.sellingPrice) {
          nextErrors[`variant_${index}_sellingPrice`] = "Selling price is required.";
        }
      });
    }

    if (stepKey === "inventory" || stepKey === "review") {
      if (inventory.trackInventory) {
        variants.forEach((variant, index) => {
          if (variant.stockQuantity === "" || Number(variant.stockQuantity) < 0) {
            nextErrors[`variant_${index}_stockQuantity`] = "Stock quantity is required.";
          }
        });
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const buildPayload = () => {
    const formData = new FormData();

    if (isEdit) {
      formData.append("_method", "PUT");
    }

    formData.append("p_type_id", basic.productTypeId);
    formData.append("p_category_id", basic.categoryId);
    formData.append("p_name", basic.productName);
    formData.append("p_brand_id", basic.brandId);
    formData.append("p_model_id", basic.modelId);
    formData.append("p_package_id", basic.packageId);
    formData.append("p_shop_id", basic.shopId);
    formData.append("p_supplier_id", basic.supplierId || "");
    formData.append("p_outlet_id", basic.outletId || 0);
    formData.append("p_country_id", basic.countryId);
    formData.append("p_location_id", basic.locationId);
    formData.append("p_status", basic.status);
    formData.append("p_video_link", basic.videoLink);
    formData.append("p_is_saleBy_pbl", basic.saleByPbl ? 1 : 0);
    formData.append("p_pbl_partnership_expire_date", basic.pblPartnershipExpireDate || "");
    formData.append("p_description[meta]", basic.shortDescription);
    formData.append("p_description[user]", basic.productDetails);
    formData.append("extended_data_clear", "1");
    if (canManagePbl()) {
      formData.append("p_description[pbl]", basic.shortDescription);
      formData.append("p_description[pbl_test]", basic.pblTest);
      formData.append("p_show_seller_mobile", basic.showSellerMobile ? 1 : 0);
      const sellerInfoPayload = sellerInfoRows.filter((row) => row.name?.trim() || row.phone?.trim());
      formData.append("p_seller_info", JSON.stringify(sellerInfoPayload));
      formData.append("p_secret_text", basic.secretText || "");
      formData.append("p_secret_video_link", basic.secretVideoLink || "");
      secretDocs.forEach((file, index) => formData.append(`p_secret_docs[${index}]`, file));
      secretDocs2.forEach((file, index) => formData.append(`p_secret_docs_2[${index}]`, file));
    }

    validMoreInformation(moreInformation).forEach((item) => {
      formData.append("ed_entity[]", "product");
      formData.append("ed_entity_key[]", item.key);
      formData.append("ed_entity_value[]", item.value);
    });

    if (featuredImage) formData.append("p_primary_image", featuredImage);
    if (removedFeaturedImagePublicId) formData.append("p_primary_image_remove", removedFeaturedImagePublicId);
    if (pblImage && canApprovePblSale) formData.append("p_pbl_image", pblImage);
    if (removedPblImagePublicId) formData.append("p_pbl_image_remove", removedPblImagePublicId);
    galleryImages.forEach((file) => formData.append("p_images[]", file));
    removedGalleryImages.forEach((publicId) => formData.append("p_images_remove[]", publicId));

    const variantsPayload = variants.map((variant, index) => {
      const media = variantMedia[variant.id] || {};

      if (media.primaryImage) {
        formData.append(`pv_primary_image_${index}`, media.primaryImage);
      }
      if (media.removedPrimaryImagePublicId) {
        formData.append(`pv_primary_image_remove_${index}`, media.removedPrimaryImagePublicId);
      }

      (media.galleryImages || []).forEach((file) => {
        formData.append(`pv_images_${index}[]`, file);
      });
      (media.removedGalleryImages || []).forEach((publicId) => {
        formData.append(`pv_images_remove_${index}[]`, publicId);
      });

      return {
        id: variant.backendId || undefined,
        title: variant.name,
        sku: variant.sku,
        status: variant.status,
        purchase_price: variant.costPrice,
        regular_price: variant.sellingPrice,
        discount_price: variant.discountPrice || "",
        b2b_price: variant.b2bPrice || "",
        additional_price: showAdditionalPrice ? (variant.additionalPrice || "") : undefined,
        wholesale_price: variant.wholesalePrice,
        minimum_wholesale_qty: 0,
        stock_qty: inventory.trackInventory ? variant.stockQuantity || 0 : 0,
        low_stock_threshold: inventory.lowStockAlert || 0,
        options: Object.entries(variant.attributes || {}).map(([name, value]) => ({
          value_text: `${name}: ${value}`,
        })),
        backorder_policy: inventory.backorderPolicy,
      };
    });

    formData.append("variants", JSON.stringify(variantsPayload));

    return formData;
  };

  const submit = async () => {
    if (!validateStep("review")) {
      setActiveStep(5);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const response = isEdit
        ? await GeneralProductService.Commands.updateGeneralProduct(productId, payload)
        : await GeneralProductService.Commands.createGeneralProduct(payload);

      if (response?.status === "success") {
        localStorage.removeItem(draftKey);
        toast.success(isEdit ? "Product updated." : "Product published.");
        router.push("/dashboard/products/general-product/list");
        return;
      }

      toast.error(response?.message || `Product could not be ${isEdit ? "updated" : "published"}.`);
    } catch (error) {
      toast.error(error?.response?.data?.message || `Product could not be ${isEdit ? "updated" : "published"}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMessages = Object.values(errors).filter(Boolean);
  const selectedSupplier = supplierOptions.find((option) => option.value === basic.supplierId);

  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
        <div className="mx-auto max-w-7xl rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading product...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-6">
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-slate-100 pb-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">{pageTitle}</h1>
            <p className="text-sm text-slate-500">{lastSavedAt ? `Autosaved ${lastSavedAt.toLocaleTimeString()}` : "Draft ready"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium hover:bg-slate-50"
              onClick={() => router.push("/dashboard/products/general-product/list")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={submit}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? actionBusyLabel : actionLabel}
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm">
          <span className="shrink-0 font-semibold text-slate-700">Validation</span>
          {errorMessages.length === 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              Ready
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {errorMessages.slice(0, 8).map((message) => (
                <div key={message} className="flex items-center gap-1.5 rounded bg-red-50 px-2 py-0.5 text-red-700">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {message}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="rounded-md border border-slate-200 bg-white">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              const isDone = activeStep > index;

              return (
                <button
                  key={step.key}
                  type="button"
                  className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${isActive ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  onClick={() => setActiveStep(index)}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${isActive
                        ? "border-white text-white"
                        : isDone
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 text-slate-500"
                      }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  {step.label}
                </button>
              );
            })}
          </aside>

          <main className="min-h-[620px] rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold">{currentStep.label}</h2>
            </div>

            <div className="p-5">
              {currentStep.key === "basic" && (
                <section className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Product Name"
                    value={basic.productName}
                    error={errors.productName}
                    onChange={(event) => setBasicValue("productName", event.target.value)}
                  />
                  
                  <SearchableSelect
                    label="Shop"
                    value={basic.shopId}
                    error={errors.shopId}
                    options={shopOptions}
                    onChange={chooseShop}
                  />

                  <SearchableSelect
                    label="Supplier"
                    value={basic.supplierId}
                    options={supplierOptions}
                    disabled={!basic.shopId}
                    onChange={(value) => setBasicValue("supplierId", value)}
                  />

                  <SearchableSelect
                    label="Product Type"
                    value={basic.productTypeId}
                    error={errors.productTypeId}
                    options={productTypeOptions}
                    onChange={chooseProductType}
                  />

                  <div className="grid gap-3 md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-700">Category</span>
                      {categoryPath.length > 0 && (
                        <span className="truncate text-xs text-slate-500">
                          {categoryPath.map((item) => item.label).join(" / ")}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {categoryLevels.length ? (
                        categoryLevels.map((options, index) => (
                          <SearchableSelect
                            key={`${basic.productTypeId}-${index}`}
                            label={index === 0 ? "Parent Category" : `Child Category ${index}`}
                            value={categoryPath[index]?.value || ""}
                            options={options}
                            placeholder="Select category"
                            onChange={(value, option) => chooseCategoryAtLevel(index, value, option)}
                          />
                        ))
                      ) : (
                        <div className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                          Select a product type to load categories.
                        </div>
                      )}
                    </div>
                    <FieldError message={errors.categoryId} />
                  </div>

                  <SearchableSelect
                    label="Brand"
                    value={basic.brandId}
                    options={brandOptions}
                    onChange={chooseBrand}
                  />

                  <SearchableSelect
                    label="Model"
                    value={basic.modelId}
                    options={modelOptions}
                    disabled={!basic.brandId}
                    onChange={chooseModel}
                  />

                  <SearchableSelect
                    label="Package"
                    value={basic.packageId}
                    options={packageOptions}
                    disabled={!basic.modelId}
                    onChange={(value) => setBasicValue("packageId", value)}
                  />

                  <SearchableSelect
                    label="Outlet"
                    value={basic.outletId}
                    options={outletOptions}
                    disabled={!basic.shopId}
                    onChange={(value) => setBasicValue("outletId", value)}
                  />

                  <SearchableSelect
                    label="Country"
                    value={basic.countryId}
                    options={countryOptions}
                    onChange={chooseCountry}
                  />

                  <SearchableSelect
                    label="District"
                    value={basic.locationId}
                    options={locationOptions}
                    disabled={!basic.countryId}
                    onChange={(value) => setBasicValue("locationId", value)}
                  />

                  <SelectInput
                    label="Status"
                    value={basic.status}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    onChange={(event) => setBasicValue("status", event.target.value)}
                  />

                  <TextInput
                    label="Video Link"
                    type="url"
                    value={basic.videoLink}
                    placeholder="https://example.com/video"
                    onChange={(event) => setBasicValue("videoLink", event.target.value)}
                  />


                  <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">More Information</h3>
                        <p className="text-xs text-slate-500">Add public product facts like warranty, material, origin, care, or delivery notes.</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {moreInformation.map((item) => (
                        <div key={item.id} className="grid gap-2 md:grid-cols-[220px_1fr_40px]">
                          <input
                            value={item.key}
                            placeholder="Label, e.g. Warranty"
                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                            onChange={(event) => setMoreInformationRow(item.id, { key: event.target.value })}
                          />
                          <input
                            value={item.value}
                            placeholder="Value, e.g. 1 year service warranty"
                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                            onChange={(event) => setMoreInformationRow(item.id, { value: event.target.value })}
                          />
                          <button
                            type="button"
                            className="flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                            onClick={() => removeMoreInformationRow(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
                          onClick={addMoreInformationRow}
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-slate-700">User Description</span>
                    <textarea
                      value={basic.productDetails}
                      onChange={(event) => setBasicValue("productDetails", event.target.value)}
                      rows={5}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                    />
                  </label>


                  <label className="flex items-center justify-between rounded-md border border-slate-200 p-4 md:col-span-2">
                    <span className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-slate-700" />
                      <span>
                        <span className="block text-sm font-semibold text-slate-800">
                          {canApprovePblSale ? "Request to Approve Sale by PBL" : "Request Sale by PBL"}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {canApprovePblSale
                            ? "Approved products can use PBL image and PBL sale display."
                            : "The request will notify authorized PBL approvers."}
                        </span>
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={basic.saleByPbl}
                      onChange={(event) => setBasicValue("saleByPbl", event.target.checked)}
                    />
                  </label>

                  {canManagePbl() && (
                    <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-slate-900">PBL Information</h3>
                        <p className="text-xs text-slate-500">Visible only to super admins and users with PBL permission.</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block md:col-span-2">
                          <span className="mb-1 block text-sm font-medium text-slate-700">Partnership Expire Date</span>
                          <input
                            type="date"
                            value={basic.pblPartnershipExpireDate}
                            onChange={(event) => setBasicValue("pblPartnershipExpireDate", event.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                          />
                          <span className="mt-1 block text-xs text-slate-500">
                            After this date, the product is automatically removed from PBL sale (home &amp; category pages).
                          </span>
                        </label>
                        <label className="block md:col-span-2">
                          <span className="mb-1 block text-sm font-medium text-slate-700">PBL Description</span>
                          <textarea
                            value={basic.shortDescription}
                            onChange={(event) => setBasicValue("shortDescription", event.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                          />
                        </label>
                        <label className="block md:col-span-2">
                          <span className="mb-1 block text-sm font-medium text-slate-700">PBL Text</span>
                          <textarea
                            value={basic.pblTest}
                            onChange={(event) => setBasicValue("pblTest", event.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                          />
                        </label>
                        <label className="block md:col-span-2">
                          <span className="mb-1 block text-sm font-medium text-slate-700">Secret Text</span>
                          <textarea
                            value={basic.secretText}
                            onChange={(event) => setBasicValue("secretText", event.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                          />
                        </label>
                        <TextInput
                          label="Secret Video Link"
                          type="url"
                          value={basic.secretVideoLink}
                          placeholder="https://example.com/video"
                          onChange={(event) => setBasicValue("secretVideoLink", event.target.value)}
                        />
                        <label className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4 md:col-span-2">
                          <span className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-slate-700" />
                            <span>
                              <span className="block text-sm font-semibold text-slate-800">Show Seller Mobile Number</span>
                              <span className="block text-xs text-slate-500">
                                Highlights the seller&apos;s mobile number with an animation on the product details page.
                              </span>
                            </span>
                          </span>
                          <input
                            type="checkbox"
                            checked={basic.showSellerMobile}
                            onChange={(event) => setBasicValue("showSellerMobile", event.target.checked)}
                          />
                        </label>
                        {basic.showSellerMobile && (
                          <div className="md:col-span-2">
                            <h4 className="mb-2 text-sm font-semibold text-slate-800">Sellers</h4>
                            <div className="grid gap-2">
                              {sellerInfoRows.map((row, index) => (
                                <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_90px] md:items-end">
                                  <label className="block">
                                    <span className="mb-1 block text-xs font-medium text-slate-700">Seller Name</span>
                                    <input
                                      value={row.name}
                                      placeholder="Seller Name"
                                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                                      onChange={(event) => handleSellerInfoChange(index, "name", event.target.value)}
                                    />
                                  </label>
                                  <label className="block">
                                    <span className="mb-1 block text-xs font-medium text-slate-700">Phone</span>
                                    <input
                                      value={row.phone}
                                      placeholder="Phone"
                                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
                                      onChange={(event) => handleSellerInfoChange(index, "phone", event.target.value)}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSellerInfoRow(index)}
                                    className="flex h-10 items-center justify-center rounded-md border border-red-300 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={handleAddSellerInfoRow}
                              className="mt-2 rounded-md border border-blue-300 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                            >
                              + Add Seller
                            </button>
                          </div>
                        )}
                      </div>
                      <PblHistoryPanel type="product" id={productId} />
                    </div>
                  )}


                </section>
              )}

              {currentStep.key === "media" && (
                <section className="grid gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FileDrop
                      label="Featured Image"
                      value={featuredImage}
                      onChange={setFeaturedImage}
                      error={errors.featuredImage}
                      existingCount={existingFeaturedImage ? 1 : 0}
                      previewUrl={existingFeaturedImage?.url || ""}
                      onClear={() => {
                        if (existingFeaturedImage?.publicId) setRemovedFeaturedImagePublicId(existingFeaturedImage.publicId);
                        setExistingFeaturedImage(null);
                      }}
                    />
                    <div>
                      <span className="mb-1 block text-sm font-medium text-slate-700">Gallery Images</span>
                      <div className="flex flex-wrap gap-2 rounded-md border border-dashed border-slate-300 bg-white p-3">
                        {existingGalleryImages.map((img, i) => (
                          <div key={img.publicId || img.url} className="relative">
                            <img src={img.url} alt="" className="h-16 w-16 rounded-md object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setExistingGalleryImages((imgs) => imgs.filter((_, j) => j !== i));
                                if (img.publicId) setRemovedGalleryImages((prev) => [...prev, img.publicId]);
                              }}
                              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {galleryImages.map((file, i) => (
                          <div key={i} className="relative">
                            <img src={URL.createObjectURL(file)} alt="" className="h-16 w-16 rounded-md object-cover" />
                            <button
                              type="button"
                              onClick={() => setGalleryImages((files) => files.filter((_, j) => j !== i))}
                              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-400 hover:bg-slate-50">
                          <ImagePlus className="h-5 w-5" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setGalleryImages((prev) => [...prev, ...files]);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* -------------- */}

                      {hasVariants && (
                        <div className="md:col-span-2 rounded-md border p-4">
                          <div className="border-b  py-3 text-sm font-semibold">Variant Images</div>
                          <div className="divide-y ">
                            {variants.map((variant) => {
                              const media = variantMedia[variant.id] || {};

                              return (
                                <div key={variant.id} className="grid gap-4 px-4 py-4 md:grid-cols-[1fr_180px_180px] md:items-center">
                                  <span className="text-sm font-medium text-slate-800">{variant.name}</span>
                                  <div className="grid gap-1">
                                    {media.existingPrimaryImage && !media.primaryImage ? (
                                      <div className="flex items-center gap-2">
                                        <div className="relative">
                                          <img src={media.existingPrimaryImage} alt="" className="h-12 w-12 rounded-md object-cover" />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setVariantMedia((current) => ({
                                                ...current,
                                                [variant.id]: { ...media, existingPrimaryImage: "" },
                                              }))
                                            }
                                            className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                          >
                                            <X className="h-2.5 w-2.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="text-sm"
                                        onChange={(event) =>
                                          setVariantMedia((current) => ({
                                            ...current,
                                            [variant.id]: {
                                              ...media,
                                              primaryImage: event.target.files?.[0] || null,
                                            },
                                          }))
                                        }
                                      />
                                    )}
                                  </div>
                                  <div className="grid gap-1">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="text-sm"
                                      onChange={(event) =>
                                        setVariantMedia((current) => ({
                                          ...current,
                                          [variant.id]: {
                                            ...media,
                                            galleryImages: Array.from(event.target.files || []),
                                          },
                                        }))
                                      }
                                    />
                                    {Boolean(media.existingGalleryImages?.length) && !media.galleryImages?.length && (
                                      <span className="text-xs text-slate-500">{media.existingGalleryImages.length} gallery images</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                  {/* -------------------------- */}
                    {canApprovePblSale && (
                      <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <ShieldCheck className="h-4 w-4" />
                          PBL Image
                        </div>
                        <FileDrop
                          label="PBL Image"
                          value={pblImage}
                          onChange={setPblImage}
                          existingCount={existingPblImage ? 1 : 0}
                          previewUrl={existingPblImage?.url || ""}
                          onClear={() => {
                            if (existingPblImage?.publicId) setRemovedPblImagePublicId(existingPblImage.publicId);
                            setExistingPblImage(null);
                          }}
                        />
                      </div>
                    )}
                    {canApprovePblSale && (
                      <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <ShieldCheck className="h-4 w-4" />
                          Secret Documents
                        </div>
                        <FileDrop
                          label="Secret Documents"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          value={secretDocs}
                          onChange={setSecretDocs}
                          existingCount={existingSecretDocs.length}
                        />
                      </div>
                    )}
                    {canApprovePblSale && (
                      <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <ShieldCheck className="h-4 w-4" />
                          Secret Documents 2
                        </div>
                        <FileDrop
                          label="Secret Documents 2"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          value={secretDocs2}
                          onChange={setSecretDocs2}
                          existingCount={existingSecretDocs2.length}
                        />
                      </div>
                    )}
                  </div>

                  {hasVariants && (
                    <div className="overflow-hidden rounded-md border border-slate-200">
                      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold">Variant Images</div>
                      <div className="divide-y divide-slate-100">
                        {variants.map((variant) => {
                          const media = variantMedia[variant.id] || {};
                          const updateMedia = (patch) =>
                            setVariantMedia((current) => ({
                              ...current,
                              [variant.id]: { ...(current[variant.id] || {}), ...patch },
                            }));

                          return (
                            <div key={variant.id} className="grid gap-4 px-4 py-4 md:grid-cols-[1fr_180px_220px] md:items-center">
                              <span className="text-sm font-medium text-slate-800">{variant.name}</span>
                              <div className="grid gap-1">
                                {media.existingPrimaryImage && !media.primaryImage ? (
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <img src={media.existingPrimaryImage.url} alt="" className="h-12 w-12 rounded-md object-cover" />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateMedia({
                                            existingPrimaryImage: null,
                                            removedPrimaryImagePublicId: media.existingPrimaryImage.publicId || "",
                                          })
                                        }
                                        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                      >
                                        <X className="h-2.5 w-2.5" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="text-sm"
                                    onChange={(event) => updateMedia({ primaryImage: event.target.files?.[0] || null })}
                                  />
                                )}
                              </div>
                              <div className="grid gap-1">
                                <div className="flex flex-wrap gap-1.5">
                                  {(media.existingGalleryImages || []).map((img, i) => (
                                    <div key={img.publicId || img.url} className="relative">
                                      <img src={img.url} alt="" className="h-10 w-10 rounded object-cover" />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateMedia({
                                            existingGalleryImages: (media.existingGalleryImages || []).filter((_, j) => j !== i),
                                            removedGalleryImages: img.publicId
                                              ? [...(media.removedGalleryImages || []), img.publicId]
                                              : media.removedGalleryImages || [],
                                          })
                                        }
                                        className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                      >
                                        <X className="h-2 w-2" />
                                      </button>
                                    </div>
                                  ))}
                                  {(media.galleryImages || []).map((file, i) => (
                                    <div key={i} className="relative">
                                      <img src={URL.createObjectURL(file)} alt="" className="h-10 w-10 rounded object-cover" />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateMedia({ galleryImages: (media.galleryImages || []).filter((_, j) => j !== i) })
                                        }
                                        className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                      >
                                        <X className="h-2 w-2" />
                                      </button>
                                    </div>
                                  ))}
                                  <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 hover:bg-slate-50">
                                    <ImagePlus className="h-4 w-4" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(event) => {
                                        const files = Array.from(event.target.files || []);
                                        updateMedia({ galleryImages: [...(media.galleryImages || []), ...files] });
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {currentStep.key === "attributes" && (
                <section className="grid gap-4">
                  <div className="flex flex-wrap gap-2">
                    {attributePresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                        onClick={() => setAttributes((current) => [...current, createAttribute(preset)])}
                      >
                        {preset}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
                      onClick={() => setAttributes((current) => [...current, createAttribute()])}
                    >
                      <Plus className="h-4 w-4" />
                      Add Attribute
                    </button>
                  </div>

                  <FieldError message={errors.attributes} />

                  <div className="grid gap-3">
                    {attributes.map((attribute) => (
                      <div key={attribute.id} className="rounded-md border border-slate-200 p-4">
                        <div className="grid gap-3 md:grid-cols-[220px_1fr_40px]">
                          <input
                            value={attribute.name}
                            placeholder="Attribute"
                            className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
                            onChange={(event) => setAttribute(attribute.id, { name: event.target.value })}
                          />
                          <div className="flex gap-2">
                            <input
                              value={attribute.valueDraft}
                              placeholder="Values"
                              className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
                              onChange={(event) => setAttribute(attribute.id, { valueDraft: event.target.value })}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  addAttributeValue(attribute.id);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="h-10 rounded-md border border-slate-300 px-3 text-sm hover:bg-slate-50"
                              onClick={() => addAttributeValue(attribute.id)}
                            >
                              Add
                            </button>
                          </div>
                          <button
                            type="button"
                            className="flex h-10 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                            onClick={() => setAttributes((current) => current.filter((item) => item.id !== attribute.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {attribute.values.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {attribute.values.map((value) => (
                              <button
                                type="button"
                                key={value}
                                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
                                onClick={() => removeAttributeValue(attribute.id, value)}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
                      onClick={generateVariants}
                    >
                      <Wand2 className="h-4 w-4" />
                      Generate Variants
                    </button>
                  </div>
                </section>
              )}

              {currentStep.key === "variants" && (
                <section className="grid gap-4">
                  <div className="flex flex-wrap items-end gap-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <TextInput
                      label="Set Price"
                      type="number"
                      value={bulk.sellingPrice}
                      onChange={(event) => setBulk((current) => ({ ...current, sellingPrice: event.target.value }))}
                      className="w-36"
                    />
                    <button
                      type="button"
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50"
                      onClick={() => applyBulk("sellingPrice", bulk.sellingPrice)}
                    >
                      Apply
                    </button>
                    <TextInput
                      label="Set Stock"
                      type="number"
                      value={bulk.stockQuantity}
                      onChange={(event) => setBulk((current) => ({ ...current, stockQuantity: event.target.value }))}
                      className="w-36"
                    />
                    <button
                      type="button"
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50"
                      onClick={() => applyBulk("stockQuantity", bulk.stockQuantity)}
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50"
                      onClick={() => setAllStatuses("active")}
                    >
                      Enable All
                    </button>
                    <button
                      type="button"
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50"
                      onClick={() => setAllStatuses("inactive")}
                    >
                      Disable All
                    </button>
                    <button
                      type="button"
                      className="ml-auto inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm text-white"
                      onClick={addSingleVariant}
                    >
                      <Plus className="h-4 w-4" />
                      Add Variant
                    </button>
                  </div>

                  <FieldError message={errors.variants} />

                  <div className="overflow-x-auto rounded-md border border-slate-200">
                    <table className="w-full min-w-[1400px] border-collapse text-sm">
                      <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-3">Variant Name</th>
                          <th className="px-3 py-3">SKU</th>
                          <th className="px-3 py-3">Cost Price</th>
                          <th className="px-3 py-3">Selling Price</th>
                          <th className="px-3 py-3">Discount Price</th>
                          <th className="px-3 py-3">Disc %</th>
                          <th className="px-3 py-3">B2B Price</th>
                          {showAdditionalPrice && <th className="px-3 py-3">Additional Price</th>}
                          <th className="px-3 py-3">Wholesale Price</th>
                          <th className="px-3 py-3">Stock Qty</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="w-12 px-3 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {variants.map((variant, index) => (
                          <tr key={variant.id}>
                            <td className="px-3 py-2">
                              <input
                                value={variant.name}
                                className={`h-9 w-full rounded-md border px-2 text-sm outline-none focus:border-slate-900 ${errors[`variant_${index}_name`] ? "border-red-400" : "border-slate-300"
                                  }`}
                                onChange={(event) => setVariant(variant.id, "name", event.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={variant.sku}
                                className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-slate-900"
                                onChange={(event) => setVariant(variant.id, "sku", event.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={variant.costPrice}
                                className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-slate-900"
                                onChange={(event) => setVariant(variant.id, "costPrice", event.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={variant.sellingPrice}
                                className={`h-9 w-full rounded-md border px-2 text-sm outline-none focus:border-slate-900 ${errors[`variant_${index}_sellingPrice`] ? "border-red-400" : "border-slate-300"
                                  }`}
                                onChange={(event) => setVariant(variant.id, "sellingPrice", event.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={variant.discountPrice}
                                placeholder="0.00"
                                className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-slate-900"
                                onChange={(event) => setVariant(variant.id, "discountPrice", event.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={variant.discountPercent}
                                placeholder="0"
                                min="0"
                                max="100"
                                className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-slate-900"
                                onChange={(event) => setVariant(variant.id, "discountPercent", event.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={variant.b2bPrice}
                                placeholder="0.00"
                                className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-slate-900"
                                onChange={(event) => setVariant(variant.id, "b2bPrice", event.target.value)}
                              />
                            </td>
                            {showAdditionalPrice && (
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={variant.additionalPrice}
                                  placeholder="0.00"
                                  className="h-9 w-full rounded-md border border-amber-300 bg-amber-50 px-2 text-sm outline-none focus:border-amber-600"
                                  onChange={(event) => setVariant(variant.id, "additionalPrice", event.target.value)}
                                />
                              </td>
                            )}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={variant.wholesalePrice}
                                className="h-9 w-full rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-slate-900"
                                onChange={(event) => setVariant(variant.id, "wholesalePrice", event.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={variant.stockQuantity}
                                className={`h-9 w-full rounded-md border px-2 text-sm outline-none focus:border-slate-900 ${errors[`variant_${index}_stockQuantity`] ? "border-red-400" : "border-slate-300"
                                  }`}
                                onChange={(event) => setVariant(variant.id, "stockQuantity", event.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={variant.status}
                                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-slate-900"
                                onChange={(event) => setVariant(variant.id, "status", event.target.value)}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="out_of_stock">Out of stock</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                                onClick={() => setVariants((current) => current.filter((item) => item.id !== variant.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {currentStep.key === "inventory" && (
                <section className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center justify-between rounded-md border border-slate-200 p-4">
                    <span className="text-sm font-medium text-slate-700">Track Inventory</span>
                    <input
                      type="checkbox"
                      checked={inventory.trackInventory}
                      onChange={(event) => setInventory((current) => ({ ...current, trackInventory: event.target.checked }))}
                    />
                  </label>
                  <TextInput
                    label="Low Stock Alert"
                    type="number"
                    value={inventory.lowStockAlert}
                    onChange={(event) => setInventory((current) => ({ ...current, lowStockAlert: event.target.value }))}
                  />
                  <SelectInput
                    label="Backorder Settings"
                    value={inventory.backorderPolicy}
                    options={[
                      { value: "deny", label: "Do not allow" },
                      { value: "allow", label: "Allow" },
                      { value: "notify", label: "Allow with notice" },
                    ]}
                    onChange={(event) => setInventory((current) => ({ ...current, backorderPolicy: event.target.value }))}
                  />
                </section>
              )}

              {currentStep.key === "review" && (
                <section className="grid gap-4">
                  <div className="grid gap-3 md:grid-cols-5">
                    <div className="rounded-md border border-slate-200 p-4">
                      <div className="text-xs uppercase text-slate-500">Product</div>
                      <div className="mt-1 font-semibold">{basic.productName || "Untitled"}</div>
                    </div>
                    <div className="rounded-md border border-slate-200 p-4">
                      <div className="text-xs uppercase text-slate-500">Supplier</div>
                      <div className="mt-1 font-semibold">{selectedSupplier?.label || "Not selected"}</div>
                    </div>
                    <div className="rounded-md border border-slate-200 p-4">
                      <div className="text-xs uppercase text-slate-500">Variants</div>
                      <div className="mt-1 font-semibold">{variants.length}</div>
                    </div>
                    <div className="rounded-md border border-slate-200 p-4">
                      <div className="text-xs uppercase text-slate-500">Total Stock</div>
                      <div className="mt-1 font-semibold">
                        {variants.reduce((sum, variant) => sum + Number(variant.stockQuantity || 0), 0)}
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-200 p-4">
                      <div className="text-xs uppercase text-slate-500">Status</div>
                      <div className="mt-1 font-semibold capitalize">{basic.status}</div>
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">More Information</div>
                        <div className="text-xs text-slate-500">{validMoreInformation(moreInformation).length} public fact rows</div>
                      </div>
                    </div>
                    {validMoreInformation(moreInformation).length ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {validMoreInformation(moreInformation).map((item) => (
                          <div key={`${item.key}-${item.value}`} className="rounded-md bg-slate-50 px-3 py-2">
                            <span className="text-xs font-medium uppercase text-slate-500">{item.key || "Information"}</span>
                            <div className="mt-1 text-sm font-semibold text-slate-900">{item.value || "-"}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">No more information added.</div>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-md border border-slate-200">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold">Variant Review</div>
                    <div className="max-h-72 overflow-auto">
                      <table className="w-full min-w-[760px] text-sm">
                        <thead className="bg-white text-left text-xs uppercase text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Selling</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {variants.map((variant) => (
                            <tr key={variant.id}>
                              <td className="px-4 py-3">{variant.name}</td>
                              <td className="px-4 py-3">{variant.sku}</td>
                              <td className="px-4 py-3">{moneyOrBlank(variant.sellingPrice)}</td>
                              <td className="px-4 py-3">{variant.stockQuantity || 0}</td>
                              <td className="px-4 py-3 capitalize">{variant.status.replaceAll("_", " ")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </main>

        </div>
      </div>

      <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            onClick={goBack}
            disabled={activeStep === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <div className="text-sm text-slate-500">
            {activeStep + 1} of {steps.length}
          </div>
          {activeStep === steps.length - 1 ? (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={submit}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? actionBusyLabel : actionLabel}
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
              onClick={goNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeneralProductFormWizard;
