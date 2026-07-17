"use client";

import Footer from "@/components/dashboard/Footer";
import Pagination from "@/components/Pagination";
import TableFilter from "@/components/TableFilter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";
import SupplierService from "@/services/SupplierService";
import UserService from "@/services/UserService";
import { Building2, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const emptyForm = {
  s_name: "",
  s_email: "",
  s_phone: "",
  s_address: "",
  s_status: "active",
  s_account_details: "",
  s_tin: "",
  s_bin: "",
  s_user_id: "",
  s_bank_id: "",
  s_payment_method: "",
  s_payment_terms: "",
  s_payment_term_condition: "",
  s_weight: "",
  s_type: "",
  s_company_id: "0",
};

const parseUser = (value) => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    return null;
  }
};

const adminModes = ["admin", "pbl"];

const canUsePermission = (permissionList, section, action) =>
  hasPermission(permissionList, 0, section, action);

const SupplierModal = ({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  saving,
  selectedSupplier,
  users,
  canAssignOwner,
}) => {
  if (!open) return null;

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-950 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-950">
                {selectedSupplier ? "Edit Supplier" : "Add Supplier"}
              </h2>
              <p className="text-sm text-gray-500">Supplier profile and payment terms</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Name</span>
              <input
                required
                value={form.s_name}
                onChange={(event) => updateField("s_name", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Status</span>
              <select
                value={form.s_status}
                onChange={(event) => updateField("s_status", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-950"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            {canAssignOwner && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Owner</span>
                <select
                  value={form.s_user_id}
                  onChange={(event) => updateField("s_user_id", event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-950"
                >
                  <option value="">Current user</option>
                  {users.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.phone || item.email}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Phone</span>
              <input
                value={form.s_phone}
                onChange={(event) => updateField("s_phone", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={form.s_email}
                onChange={(event) => updateField("s_email", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">TIN</span>
              <input
                value={form.s_tin}
                onChange={(event) => updateField("s_tin", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">BIN</span>
              <input
                value={form.s_bin}
                onChange={(event) => updateField("s_bin", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Payment Method</span>
              <input
                value={form.s_payment_method}
                onChange={(event) => updateField("s_payment_method", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Payment Terms</span>
              <input
                value={form.s_payment_terms}
                onChange={(event) => updateField("s_payment_terms", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Bank ID</span>
              <input
                type="number"
                value={form.s_bank_id}
                onChange={(event) => updateField("s_bank_id", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Weight</span>
              <input
                type="number"
                value={form.s_weight}
                onChange={(event) => updateField("s_weight", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Type</span>
              <input
                value={form.s_type}
                onChange={(event) => updateField("s_type", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Company ID</span>
              <input
                value={form.s_company_id}
                onChange={(event) => updateField("s_company_id", event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-gray-700">Address</span>
              <textarea
                rows={3}
                value={form.s_address}
                onChange={(event) => updateField("s_address", event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-gray-700">Account Details</span>
              <textarea
                rows={2}
                value={form.s_account_details}
                onChange={(event) => updateField("s_account_details", event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-gray-700">Payment Term Condition</span>
              <textarea
                rows={3}
                value={form.s_payment_term_condition}
                onChange={(event) => updateField("s_payment_term_condition", event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-gray-950 px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {selectedSupplier ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SuppliersPage = () => {
  const { permissionList, user } = useAppContext();
  const currentUser = useMemo(() => parseUser(user), [user]);
  const mode = String(currentUser?.user_mode || "").toLowerCase();
  const adminNeedsPermission = adminModes.includes(mode);
  const canListAll = canUsePermission(permissionList, "Supplier", "List");
  const canCreate = !adminNeedsPermission || canUsePermission(permissionList, "Supplier", "Create");
  const canAssignOwner = canCreate && canListAll;
  const canGlobalUpdate = canUsePermission(permissionList, "Supplier", "Update");
  const canGlobalDelete = canUsePermission(permissionList, "Supplier", "Delete");

  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const getSuppliers = async (value = query) => {
    try {
      setLoading(true);
      const response = await SupplierService.Queries.getSuppliers({
        _page: currentPage,
        _perPage: itemsPerPage,
        _name: value,
        _status: status,
        orderBy: "s_id",
        order: "DESC",
      });

      if (response?.status === "success") {
        setSuppliers(response?.data?.data || []);
        setTotalItems(response?.data?.total || 0);
      } else {
        setSuppliers([]);
        setTotalItems(0);
      }
    } catch (error) {
      setSuppliers([]);
      setTotalItems(0);
      toast.error(error?.response?.data?.message || error?.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    if (!canListAll) return;
    try {
      const response = await UserService.Queries.getUserList();
      setUsers(Array.isArray(response?.data) ? response.data : []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    getSuppliers();
  }, [currentPage, itemsPerPage, status]);

  useEffect(() => {
    getUsers();
  }, [canListAll]);

  const openCreate = () => {
    setSelectedSupplier(null);
    setForm({ ...emptyForm, s_user_id: canAssignOwner ? "" : currentUser?.id || "" });
    setOpen(true);
  };

  const openEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setForm({
      ...emptyForm,
      ...Object.fromEntries(
        Object.entries(supplier || {}).map(([key, value]) => [key, value === null || value === undefined ? "" : String(value)])
      ),
    });
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = { ...form };
      if (!canAssignOwner) {
        delete payload.s_user_id;
      }

      const response = selectedSupplier
        ? await SupplierService.Commands.updateSupplier(selectedSupplier.s_id, payload)
        : await SupplierService.Commands.createSupplier(payload);

      if (response?.status === "success") {
        toast.success(selectedSupplier ? "Supplier updated" : "Supplier created");
        setOpen(false);
        await getSuppliers();
        return;
      }

      toast.error(response?.message || "Supplier could not be saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Supplier could not be saved");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (supplier) => {
    const result = await Swal.fire({
      title: "Delete supplier?",
      text: supplier?.s_name || "This supplier will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#111827",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await SupplierService.Commands.deleteSupplier(supplier.s_id);
      toast.success("Supplier deleted");
      await getSuppliers();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Supplier could not be deleted");
    }
  };

  const canEditRow = (supplier) => Number(supplier?.s_user_id) === Number(currentUser?.id) || canGlobalUpdate;
  const canDeleteRow = (supplier) => Number(supplier?.s_user_id) === Number(currentUser?.id) || canGlobalDelete;

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-gray-50 px-6">
      <main className="my-6 w-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Suppliers</h1>
            <p className="mt-1 text-sm text-gray-500">Manage supplier contacts, accounts, and payment terms.</p>
          </div>
          {canCreate && (
            <Button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Supplier
            </Button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <TableFilter
            query={query}
            setQuery={setQuery}
            setCurrentPage={setCurrentPage}
            fetchSearchResults={() => getSuppliers(query)}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            placeholder="Search supplier..."
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Status</span>
            <select
              value={status}
              onChange={(event) => {
                setCurrentPage(1);
                setStatus(event.target.value);
              }}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-950"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-gray-300">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Supplier</TableHead>
                <TableHead className="border-r border-gray-300">Contact</TableHead>
                <TableHead className="border-r border-gray-300">Payment</TableHead>
                <TableHead className="border-r border-gray-300">Owner</TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
                <TableHead className="w-[90px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier, index) => (
                  <TableRow key={supplier.s_id} className="border-b border-gray-200">
                    <TableCell className="border-r border-gray-200 text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="border-r border-gray-200">
                      <div className="font-semibold text-gray-900">{supplier.s_name}</div>
                      <div className="mt-1 max-w-sm truncate text-sm text-gray-500">{supplier.s_address}</div>
                    </TableCell>
                    <TableCell className="border-r border-gray-200">
                      <div>{supplier.s_phone || "-"}</div>
                      <div className="text-sm text-gray-500">{supplier.s_email || "-"}</div>
                    </TableCell>
                    <TableCell className="border-r border-gray-200">
                      <div>{supplier.s_payment_method || "-"}</div>
                      <div className="text-sm text-gray-500">{supplier.s_payment_terms || "-"}</div>
                    </TableCell>
                    <TableCell className="border-r border-gray-200">
                      {supplier?.user?.name || `User #${supplier.s_user_id}`}
                    </TableCell>
                    <TableCell className="border-r border-gray-200">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        supplier.s_status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {supplier.s_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {canEditRow(supplier) && (
                          <button
                            type="button"
                            onClick={() => openEdit(supplier)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit supplier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {canDeleteRow(supplier) && (
                          <button
                            type="button"
                            onClick={() => remove(supplier)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete supplier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        Loading...
                      </span>
                    ) : (
                      "No suppliers found."
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>

      <Footer />

      <SupplierModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        form={form}
        setForm={setForm}
        saving={saving}
        selectedSupplier={selectedSupplier}
        users={users}
        canAssignOwner={canAssignOwner}
      />
    </div>
  );
};

export default SuppliersPage;
