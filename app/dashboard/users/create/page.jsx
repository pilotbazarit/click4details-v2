"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/dashboard/Footer";
import UserService from "@/services/UserService";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { Loader2, ShieldAlert, UserPlus } from "lucide-react";

const USER_MODES = [
  { value: "user", label: "User" },
  { value: "member", label: "Member" },
  { value: "partner", label: "Partner" },
  { value: "pbl_user", label: "PBL User" },
  { value: "admin", label: "Admin" },
  { value: "supreme", label: "Supreme" },
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  password: "",
  password_confirmation: "",
  user_mode: "user",
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

const CreateUserPage = () => {
  const router = useRouter();
  const { user } = useAppContext();
  const parsedUser = useMemo(() => parseStoredUser(user), [user]);
  const userMode = String(parsedUser?.user_mode ?? "").toLowerCase();
  const isSupreme = userMode === "supreme";

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match." });
      return;
    }

    try {
      setSaving(true);
      const response = await UserService.Commands.createUser(form);

      if (response?.status === "success") {
        toast.success("User created successfully.");
        router.push("/dashboard/users/");
      } else {
        toast.error(response?.message || "Failed to create user.");
      }
    } catch (error) {
      const validationErrors = error?.errors;
      if (validationErrors && typeof validationErrors === "object") {
        setErrors(
          Object.fromEntries(
            Object.entries(validationErrors).map(([key, value]) => [
              key,
              Array.isArray(value) ? value[0] : value,
            ])
          )
        );
      }
      toast.error(error?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
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
  // users itself. The real enforcement is the backend (User.Create was
  // never seeded for any role but supreme's wildcard bypass), since this
  // check can't stop a network request made outside the browser.
  if (!isSupreme) {
    return (
      <div className="flex min-h-screen w-full flex-col justify-between bg-gray-50 px-6">
        <main className="mx-auto my-6 flex w-full max-w-2xl flex-col items-center rounded-lg border border-gray-200 bg-white p-10 text-center shadow-lg">
          <ShieldAlert className="mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800">Access restricted</h2>
          <p className="mt-2 text-sm text-gray-500">
            Adding users is only available to super admin accounts.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-gray-50 px-6">
      <main className="mx-auto my-6 w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Add User</h2>
            <p className="mt-1 text-sm text-gray-500">
              Create a new user account directly from the admin panel.
            </p>
          </div>
        </div>

        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Full name"
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder="e.g. 8801XXXXXXXXX"
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone ? <p className="mt-1 text-xs text-red-500">{errors.phone}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email (optional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="name@example.com"
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              placeholder="At least 8 characters"
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password_confirmation}
              onChange={(event) => handleChange("password_confirmation", event.target.value)}
              placeholder="Re-enter password"
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password_confirmation ? (
              <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">User Mode</label>
            <select
              value={form.user_mode}
              onChange={(event) => handleChange("user_mode", event.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {USER_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 mt-2 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/users/")}
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Create User
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CreateUserPage;
