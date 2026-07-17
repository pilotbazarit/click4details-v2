"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import SystemSettingService from "@/services/SystemSettingService";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import {
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  MessageSquareText,
  Package,
  Save,
  ShieldAlert,
  SlidersHorizontal,
  Truck,
} from "lucide-react";

const TABS = [
  { key: "general", label: "General", icon: SlidersHorizontal },
  { key: "sms", label: "SMS / OTP", icon: MessageSquareText },
  { key: "shipping", label: "Shipping & Delivery", icon: Truck },
  { key: "payment_gateway", label: "Payment Gateways", icon: CreditCard },
  { key: "courier", label: "Courier Services", icon: Package },
];

// Friendly labels/input types per known setting key - ss_value is a plain
// JSON blob on the backend, this is what turns its raw keys into a form.
const FIELD_DEFS = {
  gtm: [
    { name: "container_id", label: "GTM Container ID", placeholder: "GTM-XXXXXXX" },
  ],
  sms: [
    { name: "user", label: "SMS Username" },
    { name: "key", label: "API Key", secret: true },
    { name: "sender_id", label: "Sender ID" },
    { name: "url", label: "API URL", placeholder: "https://" },
  ],
  shipping: [
    { name: "dhaka_charge", label: "Dhaka Delivery Charge (৳)", type: "number" },
    { name: "outside_dhaka_charge", label: "Outside Dhaka Charge (৳)", type: "number" },
    { name: "free_shipping_above", label: "Free Shipping Above (৳)", type: "number" },
    { name: "return_policy_days", label: "Return Policy (days)", type: "number" },
  ],
  payment_gateway_bkash: [
    { name: "api_key", label: "API Key", secret: true },
    { name: "api_secret", label: "API Secret", secret: true },
    { name: "username", label: "Username" },
    { name: "password", label: "Password", secret: true },
    { name: "sandbox", label: "Sandbox Mode", type: "boolean" },
    { name: "enabled", label: "Enabled", type: "boolean" },
  ],
  payment_gateway_nagad: [
    { name: "merchant_id", label: "Merchant ID" },
    { name: "merchant_private_key", label: "Merchant Private Key", secret: true },
    { name: "public_key", label: "Public Key", secret: true },
    { name: "sandbox", label: "Sandbox Mode", type: "boolean" },
    { name: "enabled", label: "Enabled", type: "boolean" },
  ],
  payment_gateway_sslcommerz: [
    { name: "store_id", label: "Store ID" },
    { name: "store_password", label: "Store Password", secret: true },
    { name: "sandbox", label: "Sandbox Mode", type: "boolean" },
    { name: "enabled", label: "Enabled", type: "boolean" },
  ],
  courier_steadfast: [
    { name: "api_key", label: "API Key", secret: true },
    { name: "secret_key", label: "Secret Key", secret: true },
    { name: "enabled", label: "Enabled", type: "boolean" },
  ],
  courier_pathao: [
    { name: "client_id", label: "Client ID" },
    { name: "client_secret", label: "Client Secret", secret: true },
    { name: "username", label: "Username" },
    { name: "password", label: "Password", secret: true },
    { name: "enabled", label: "Enabled", type: "boolean" },
  ],
  courier_lalamove: [
    { name: "api_key", label: "API Key", secret: true },
    { name: "api_secret", label: "API Secret", secret: true },
    { name: "market", label: "Market", placeholder: "e.g. BD" },
    { name: "enabled", label: "Enabled", type: "boolean" },
  ],
  courier_redx: [
    { name: "api_key", label: "API Key", secret: true },
    { name: "enabled", label: "Enabled", type: "boolean" },
  ],
};

const parseStoredUser = (user) => {
  if (!user) return null;
  const raw = typeof user === "string" ? (() => {
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  })() : user;
  return raw;
};

const SettingCard = ({ setting, onSaved }) => {
  const fields = FIELD_DEFS[setting.ss_key] || [];
  const [values, setValues] = useState(setting.ss_value || {});
  const [saving, setSaving] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState({});

  useEffect(() => {
    setValues(setting.ss_value || {});
  }, [setting]);

  const handleChange = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await SystemSettingService.Commands.updateSystemSetting(setting.ss_key, {
        value: values,
      });

      if (response?.status === "success") {
        toast.success(`${setting.ss_label} settings saved.`);
        onSaved?.(response.data);
      } else {
        toast.error(response?.message || "Failed to save setting.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save setting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">{setting.ss_label}</h3>
        {"enabled" in values ? (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${values.enabled
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
              }`}
          >
            {values.enabled ? "Enabled" : "Disabled"}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          if (field.type === "boolean") {
            return (
              <label
                key={field.name}
                className="flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={Boolean(values[field.name])}
                  onChange={(event) => handleChange(field.name, event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {field.label}
              </label>
            );
          }

          const isSecretVisible = Boolean(visibleSecrets[field.name]);

          return (
            <div key={field.name}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={
                    field.type === "number"
                      ? "number"
                      : field.secret && !isSecretVisible
                        ? "password"
                        : "text"
                  }
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    handleChange(
                      field.name,
                      field.type === "number"
                        ? Number(event.target.value)
                        : event.target.value
                    )
                  }
                  className={`h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${field.secret ? "pr-9" : ""
                    }`}
                />
                {field.secret ? (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleSecrets((previous) => ({
                        ...previous,
                        [field.name]: !previous[field.name],
                      }))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={isSecretVisible ? "Hide value" : "Show value"}
                  >
                    {isSecretVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
};

const SystemSetupPage = () => {
  const { user } = useAppContext();
  const parsedUser = useMemo(() => parseStoredUser(user), [user]);
  const userMode = String(parsedUser?.user_mode ?? "").toLowerCase();
  const isSupreme = userMode === "supreme";

  const [loading, setLoading] = useState(true);
  const [groupedSettings, setGroupedSettings] = useState({});
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await SystemSettingService.Queries.getSystemSettings();

      if (response?.status === "success") {
        setGroupedSettings(response.data || {});
      } else {
        toast.error(response?.message || "Failed to load system settings.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to load system settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupreme) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [isSupreme, fetchSettings]);

  const handleSettingSaved = (updatedSetting) => {
    if (!updatedSetting?.ss_key || !updatedSetting?.ss_group) return;

    setGroupedSettings((previous) => {
      const group = previous[updatedSetting.ss_group] || [];
      return {
        ...previous,
        [updatedSetting.ss_group]: group.map((item) =>
          item.ss_key === updatedSetting.ss_key ? updatedSetting : item
        ),
      };
    });
  };

  // Still hydrating auth state from localStorage - avoid a flash of the
  // access-restricted screen for a supreme user on first paint.
  if (user === undefined || user === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // Menu visibility is cosmetic only - this page must refuse non-supreme
  // users itself. The real enforcement is still the backend
  // (SystemSettingController), since this check can't stop a network
  // request made outside the browser.
  if (!isSupreme) {
    return (
      <div className="flex min-h-screen w-full flex-col justify-between bg-gray-50 px-6">
        <main className="mx-auto my-6 flex w-full max-w-2xl flex-col items-center rounded-lg border border-gray-200 bg-white p-10 text-center shadow-lg">
          <ShieldAlert className="mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800">Access restricted</h2>
          <p className="mt-2 text-sm text-gray-500">
            System Setup is only available to super admin accounts.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const activeSettings = groupedSettings[activeTab] || [];

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-gray-50 px-6">
      <main className="mx-auto my-6 w-full max-w-6xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">System Setup</h2>
            <p className="mt-1 text-sm text-gray-500">
              Platform-wide configuration: analytics, SMS, shipping, payment gateways &amp; courier services.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            Loading settings...
          </div>
        ) : activeSettings.length === 0 ? (
          <p className="py-16 text-center text-gray-500">No settings found in this section.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {activeSettings.map((setting) => (
              <SettingCard key={setting.ss_key} setting={setting} onSaved={handleSettingSaved} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SystemSetupPage;
