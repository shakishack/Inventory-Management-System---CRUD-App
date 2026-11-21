import { useEffect, useRef, useState } from "react";
import {
  BarChart2,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  DollarSign,
  Eye,
  Inbox,
  Info,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import {
  createOrder,
  deleteOrder as removeOrder,
  getOrders,
  updateOrder,
} from "./api/orders.js";
import {
  getTodayDDMMYYYY,
  getTodayISO,
  toDDMMYYYY,
  toYYYYMMDD,
  usd,
} from "./utils/format.js";

const DEFAULT_CATEGORIES = [
  "CPU",
  "Video Card",
  "Storage",
  "Mother Board",
  "RAM",
];

const INITIAL_FORM = {
  productName: "",
  category: "CPU",
  status: "Pending",
  description: "",
  standardCost: "",
  listPrice: "",
  profit: "",
  quantity: "",
  warehouse: "",
  orderDateISO: "",
  orderDateDisplay: "",
  customerName: "",
};

function StatusBadge({ status }) {
  const map = {
    Shipped: "shipped",
    Pending: "pending",
    Canceled: "canceled",
  };
  return <span className={`badge badge-${map[status] || "pending"}`}>{status}</span>;
}

function CategoryBadge({ category }) {
  return <span className="cat-badge">{category}</span>;
}

function shortId(id = "") {
  return id ? id.slice(-6).toUpperCase() : "";
}

export default function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState("orders");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const [detailOrder, setDetailOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toasts, setToasts] = useState([]);

  const dateInputRef = useRef(null);
  const productNameRef = useRef(null);
  const standardCostRef = useRef(null);
  const listPriceRef = useRef(null);
  const quantityRef = useRef(null);
  const warehouseRef = useRef(null);
  const customerNameRef = useRef(null);

  function showToast(msg, type = "success") {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  async function loadOrders() {
    try {
      setLoading(true);
      const list = await getOrders();
      setOrders(list);
    } catch (error) {
      showToast(error.message || "Failed to load orders.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function openCreateModal() {
    const todayISO = getTodayISO();
    setEditingId(null);
    setForm({
      ...INITIAL_FORM,
      orderDateISO: todayISO,
      orderDateDisplay: toDDMMYYYY(todayISO),
    });
    setFormOpen(true);
  }

  function openEditModal(order) {
    const iso = toYYYYMMDD(order.orderDate);
    setEditingId(order._id);
    setForm({
      productName: order.productName || "",
      category: order.category || "CPU",
      status: order.status || "Pending",
      description: order.description || "",
      standardCost: String(order.standardCost ?? ""),
      listPrice: String(order.listPrice ?? ""),
      profit: String(order.profit ?? ""),
      quantity: String(order.quantity ?? ""),
      warehouse: order.warehouse || "",
      orderDateISO: iso,
      orderDateDisplay: iso ? toDDMMYYYY(iso) : order.orderDate || "",
      customerName: order.customerName || "",
    });
    setFormOpen(true);
  }

  function handleNumericPricingChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      const cost = parseFloat(next.standardCost);
      const price = parseFloat(next.listPrice);
      if (!Number.isNaN(price) && !Number.isNaN(cost)) {
        next.profit = (price - cost).toFixed(2);
      }
      return next;
    });
  }

  function handleDateChange(isoVal) {
    if (isoVal) {
      setForm((prev) => ({
        ...prev,
        orderDateISO: isoVal,
        orderDateDisplay: toDDMMYYYY(isoVal),
      }));
    }
  }

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {}
    }
    input.focus();
  }

  async function submitForm() {
    const productName = form.productName.trim();
    if (!productName) {
      showToast("Product name is required.", "error");
      productNameRef.current?.focus();
      return;
    }

    const costVal = form.standardCost.trim();
    const cost = parseFloat(costVal);
    if (costVal === "" || Number.isNaN(cost) || cost < 0) {
      showToast("Standard cost is required.", "error");
      standardCostRef.current?.focus();
      return;
    }

    const priceVal = form.listPrice.trim();
    const price = parseFloat(priceVal);
    if (priceVal === "" || Number.isNaN(price) || price <= 0) {
      showToast("List price is required (must be > 0).", "error");
      listPriceRef.current?.focus();
      return;
    }

    const qtyVal = form.quantity.trim();
    const qty = parseInt(qtyVal, 10);
    if (qtyVal === "" || Number.isNaN(qty) || qty <= 0) {
      showToast("Quantity is required (must be at least 1).", "error");
      quantityRef.current?.focus();
      return;
    }

    const warehouse = form.warehouse.trim();
    if (!warehouse) {
      showToast("Warehouse is required.", "error");
      warehouseRef.current?.focus();
      return;
    }

    const customerName = form.customerName.trim();
    if (!customerName) {
      showToast("Customer name is required.", "error");
      customerNameRef.current?.focus();
      return;
    }

    let profit = parseFloat(form.profit);
    if (Number.isNaN(profit)) {
      profit = parseFloat((price - cost).toFixed(2));
    }

    const payload = {
      productName,
      category: form.category,
      status: form.status,
      description: form.description.trim(),
      standardCost: cost,
      listPrice: price,
      profit,
      quantity: qty,
      warehouse,
      orderDate: form.orderDateDisplay.trim() || getTodayDDMMYYYY(),
      customerName,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await updateOrder(editingId, payload);
        showToast(`Order #${shortId(editingId)} updated.`, "success");
      } else {
        const res = await createOrder(payload);
        const createdId = res?.data?._id;
        showToast(`Order #${shortId(createdId)} created.`, "success");
      }
      setFormOpen(false);
      await loadOrders();
    } catch (error) {
      showToast(error.message || "Failed to save order.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    try {
      setSubmitting(true);
      await removeOrder(target._id);
      setDeleteTarget(null);
      showToast(`Deleted "${target.productName}".`, "info");
      await loadOrders();
    } catch (error) {
      showToast(error.message || "Failed to delete order.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const kw = searchQuery.toLowerCase();
  const filteredOrders = orders.filter((o) => {
    const matchesKw =
      (o.productName || "").toLowerCase().includes(kw) ||
      (o.category || "").toLowerCase().includes(kw) ||
      (o.customerName || "").toLowerCase().includes(kw) ||
      (o.status || "").toLowerCase().includes(kw) ||
      (o.warehouse || "").toLowerCase().includes(kw);
    const matchesStatus =
      activeFilter === "all" ||
      (o.status || "").toLowerCase() === activeFilter;
    return matchesKw && matchesStatus;
  });

  const shippedCount = orders.filter((o) => o.status === "Shipped").length;
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const canceledCount = orders.filter((o) => o.status === "Canceled").length;
  const totalRevenue = orders.reduce(
    (s, o) => s + o.listPrice * o.quantity,
    0
  );
  const totalProfit = orders.reduce((s, o) => s + o.profit * o.quantity, 0);
  const totalQty = orders.reduce((s, o) => s + o.quantity, 0);

  const byStatus = {};
  const byCategory = {};
  orders.forEach((o) => {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    byCategory[o.category] = (byCategory[o.category] || 0) + 1;
  });

  const topProfit =
    orders.length > 0
      ? [...orders].sort((a, b) => b.profit - a.profit)[0]
      : null;
  const topQty =
    orders.length > 0
      ? [...orders].sort((a, b) => b.quantity - a.quantity)[0]
      : null;

  const categoryOptions = DEFAULT_CATEGORIES.includes(form.category)
    ? DEFAULT_CATEGORIES
    : [form.category, ...DEFAULT_CATEGORIES];

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">
            <Package size={16} color="#fff" />
          </div>
          <span>OrderMS</span>
        </div>

        <span className="nav-label">Management</span>
        <div
          className={`nav-item ${currentView === "orders" ? "active" : ""}`}
          onClick={() => setCurrentView("orders")}
        >
          <ClipboardList size={15} />
          Orders
        </div>

        <span className="nav-label">Analytics</span>
        <div
          className={`nav-item ${currentView === "summary" ? "active" : ""}`}
          onClick={() => setCurrentView("summary")}
        >
          <BarChart2 size={15} />
          Summary
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">
              {currentView === "orders" ? "Orders" : "Summary"}
            </div>
            <div className="topbar-sub">
              {currentView === "orders"
                ? "Manage all your product orders"
                : "Analytics & statistics"}
            </div>
          </div>
          <div className="topbar-right">
            <div className="search-wrap">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={14} /> Add Order
            </button>
          </div>
        </div>

        <div className="content">
          {currentView === "orders" ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Total Orders</span>
                    <div className="stat-icon" style={{ background: "#fae8eb" }}>
                      <ClipboardList size={15} color="#800020" />
                    </div>
                  </div>
                  <div className="stat-value">{orders.length}</div>
                  <div className="stat-sub">All time</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Shipped</span>
                    <div className="stat-icon" style={{ background: "#f0f2d8" }}>
                      <Truck size={15} color="#606400" />
                    </div>
                  </div>
                  <div className="stat-value" style={{ color: "#606400" }}>
                    {shippedCount}
                  </div>
                  <div className="stat-sub">Delivered</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Pending</span>
                    <div className="stat-icon" style={{ background: "#fbf4e2" }}>
                      <Clock size={15} color="#8c671b" />
                    </div>
                  </div>
                  <div className="stat-value" style={{ color: "#8c671b" }}>
                    {pendingCount}
                  </div>
                  <div className="stat-sub">{canceledCount} canceled</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Total Revenue</span>
                    <div className="stat-icon" style={{ background: "#eaf2fa" }}>
                      <DollarSign size={15} color="#2b6cb0" />
                    </div>
                  </div>
                  <div className="stat-value" style={{ fontSize: "22px" }}>
                    {usd(totalRevenue)}
                  </div>
                  <div className="stat-sub">Gross revenue</div>
                </div>
              </div>

              <div className="table-card">
                <div className="table-toolbar">
                  <h3>
                    Order List{" "}
                    <span
                      style={{
                        color: "var(--muted)",
                        fontWeight: 400,
                        fontSize: "12px",
                      }}
                    >
                      {filteredOrders.length} records
                    </span>
                  </h3>
                  <div className="filter-tabs">
                    {["all", "shipped", "pending", "canceled"].map((tab) => (
                      <button
                        key={tab}
                        className={`filter-tab ${
                          activeFilter === tab ? "active" : ""
                        }`}
                        onClick={() => setActiveFilter(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>List Price</th>
                      <th>Profit</th>
                      <th>Status</th>
                      <th>Customer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && orders.length === 0 ? (
                      <tr>
                        <td colSpan="9">
                          <div className="empty-state">
                            <p>Loading orders...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="9">
                          <div className="empty-state">
                            <Inbox
                              size={32}
                              style={{ display: "block", margin: "0 auto" }}
                            />
                            <p style={{ marginTop: "8px" }}>No orders found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o._id}>
                          <td style={{ color: "var(--muted)" }} title={o._id}>
                            #{shortId(o._id)}
                          </td>
                          <td>
                            <div className="product-name">{o.productName}</div>
                            <div className="product-desc">{o.description}</div>
                          </td>
                          <td>
                            <CategoryBadge category={o.category} />
                          </td>
                          <td>{o.quantity}</td>
                          <td>{usd(o.listPrice)}</td>
                          <td style={{ color: "#606400", fontWeight: 500 }}>
                            {usd(o.profit)}
                          </td>
                          <td>
                            <StatusBadge status={o.status} />
                          </td>
                          <td>{o.customerName}</td>
                          <td>
                            <div className="action-cell">
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setDetailOrder(o)}
                                title="View"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => openEditModal(o)}
                                title="Edit"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setDeleteTarget(o)}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Total Orders</span>
                    <div className="stat-icon" style={{ background: "#fae8eb" }}>
                      <ShoppingCart size={15} color="#800020" />
                    </div>
                  </div>
                  <div className="stat-value">{orders.length}</div>
                  <div className="stat-sub">{totalQty} total units</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Total Revenue</span>
                    <div className="stat-icon" style={{ background: "#eaf2fa" }}>
                      <DollarSign size={15} color="#2b6cb0" />
                    </div>
                  </div>
                  <div className="stat-value" style={{ fontSize: "22px" }}>
                    {usd(totalRevenue)}
                  </div>
                  <div className="stat-sub">Gross revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Total Profit</span>
                    <div className="stat-icon" style={{ background: "#f0f2d8" }}>
                      <TrendingUp size={15} color="#606400" />
                    </div>
                  </div>
                  <div className="stat-value" style={{ fontSize: "22px" }}>
                    {usd(totalProfit)}
                  </div>
                  <div className="stat-sub">Net profit</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Categories</span>
                    <div className="stat-icon" style={{ background: "#fbf4e2" }}>
                      <Clock size={15} color="#8c671b" />
                    </div>
                  </div>
                  <div className="stat-value">
                    {Object.keys(byCategory).length}
                  </div>
                  <div className="stat-sub">Product categories</div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div className="table-card">
                  <div className="table-toolbar">
                    <h3>By Status</h3>
                  </div>
                  <table className="summary-table">
                    <thead>
                      <tr>
                        <th style={{ width: "42%" }}>Status</th>
                        <th style={{ width: "28%", textAlign: "center" }}>
                          Count
                        </th>
                        <th style={{ width: "30%", textAlign: "right" }}>
                          Share
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(byStatus).map(([s, c]) => (
                        <tr key={s}>
                          <td>
                            <StatusBadge status={s} />
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontWeight: 600,
                              fontSize: "15px",
                            }}
                          >
                            {c}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "var(--text)",
                            }}
                          >
                            {orders.length
                              ? ((c / orders.length) * 100).toFixed(1)
                              : "0.0"}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-card">
                  <div className="table-toolbar">
                    <h3>By Category</h3>
                  </div>
                  <table className="summary-table">
                    <thead>
                      <tr>
                        <th style={{ width: "42%" }}>Category</th>
                        <th style={{ width: "28%", textAlign: "center" }}>
                          Count
                        </th>
                        <th style={{ width: "30%", textAlign: "right" }}>
                          Share
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(byCategory).map(([c, n]) => (
                        <tr key={c}>
                          <td>
                            <CategoryBadge category={c} />
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontWeight: 600,
                              fontSize: "15px",
                            }}
                          >
                            {n}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "var(--text)",
                            }}
                          >
                            {orders.length
                              ? ((n / orders.length) * 100).toFixed(1)
                              : "0.0"}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-card" style={{ gridColumn: "1/-1" }}>
                  <div className="table-toolbar">
                    <h3>Top Highlights</h3>
                  </div>
                  <table className="summary-table">
                    <thead>
                      <tr>
                        <th style={{ width: "28%" }}>Metric</th>
                        <th style={{ width: "47%" }}>Product</th>
                        <th style={{ width: "25%", textAlign: "right" }}>
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: "var(--muted)", fontWeight: 500 }}>
                          Highest Profit / unit
                        </td>
                        <td style={{ fontWeight: 600, fontSize: "14.5px" }}>
                          {topProfit ? topProfit.productName : "-"}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            color: "#606400",
                            fontWeight: 700,
                            fontSize: "16px",
                          }}
                        >
                          {usd(topProfit ? topProfit.profit : 0)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: "var(--muted)", fontWeight: 500 }}>
                          Highest Quantity
                        </td>
                        <td style={{ fontWeight: 600, fontSize: "14.5px" }}>
                          {topQty ? topQty.productName : "-"}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 700,
                            fontSize: "16px",
                          }}
                        >
                          {topQty ? topQty.quantity : 0} units
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className={`modal-overlay ${formOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setFormOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2>{editingId ? "Edit Order" : "Add New Order"}</h2>
            <button className="modal-close" onClick={() => setFormOpen(false)}>
              <X size={15} />
            </button>
          </div>
          <div className="modal-body">
            <form
              className="form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                submitForm();
              }}
            >
              <div className="form-group full">
                <label>Product Name *</label>
                <input
                  ref={productNameRef}
                  type="text"
                  placeholder="e.g. Intel Xeon E5-2699 V3"
                  value={form.productName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, productName: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option>Pending</option>
                  <option>Shipped</option>
                  <option>Canceled</option>
                </select>
              </div>
              <div className="form-group full">
                <label>Description</label>
                <textarea
                  placeholder="e.g. Speed: 2.3GHz, Cores: 18, TDP: 145W"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Standard Cost ($) *</label>
                <input
                  ref={standardCostRef}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.standardCost}
                  onChange={(e) =>
                    handleNumericPricingChange("standardCost", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>List Price ($) *</label>
                <input
                  ref={listPriceRef}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.listPrice}
                  onChange={(e) =>
                    handleNumericPricingChange("listPrice", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Profit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.profit}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, profit: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  ref={quantityRef}
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Warehouse *</label>
                <input
                  ref={warehouseRef}
                  type="text"
                  placeholder="e.g. San Francisco"
                  value={form.warehouse}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, warehouse: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Order Date</label>
                <div className="date-picker-wrap" onClick={openDatePicker}>
                  <input
                    type="text"
                    placeholder="dd-mm-yyyy"
                    value={form.orderDateDisplay}
                    readOnly
                  />
                  <input
                    ref={dateInputRef}
                    type="date"
                    tabIndex={-1}
                    value={form.orderDateISO}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                  <Calendar size={15} />
                </div>
              </div>
              <div className="form-group full">
                <label>Customer Name *</label>
                <input
                  ref={customerNameRef}
                  type="text"
                  placeholder="Customer full name"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, customerName: e.target.value }))
                  }
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-ghost"
              disabled={submitting}
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={submitting}
              onClick={submitForm}
            >
              <Save size={13} />
              <span>{editingId ? "Update Order" : "Save Order"}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay ${detailOrder ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDetailOrder(null);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2>Order Detail</h2>
            <button
              className="modal-close"
              onClick={() => setDetailOrder(null)}
            >
              <X size={15} />
            </button>
          </div>
          <div className="modal-body">
            {detailOrder && (
              <div className="detail-grid">
                <div className="detail-item full">
                  <label>Product Name</label>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>
                    {detailOrder.productName}
                  </span>
                </div>
                <div className="detail-item">
                  <label>ID</label>
                  <span>#{detailOrder._id}</span>
                </div>
                <div className="detail-item">
                  <label>Category</label>
                  <span>
                    <CategoryBadge category={detailOrder.category} />
                  </span>
                </div>
                <div className="detail-item full">
                  <label>Description</label>
                  <span style={{ color: "var(--muted)" }}>
                    {detailOrder.description || "-"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Standard Cost</label>
                  <span>{usd(detailOrder.standardCost)}</span>
                </div>
                <div className="detail-item">
                  <label>List Price</label>
                  <span style={{ fontWeight: 600 }}>
                    {usd(detailOrder.listPrice)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Profit / unit</label>
                  <span style={{ color: "#606400", fontWeight: 600 }}>
                    {usd(detailOrder.profit)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Quantity</label>
                  <span>{detailOrder.quantity} units</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span>
                    <StatusBadge status={detailOrder.status} />
                  </span>
                </div>
                <div className="detail-item">
                  <label>Warehouse</label>
                  <span>{detailOrder.warehouse}</span>
                </div>
                <div className="detail-item">
                  <label>Customer</label>
                  <span>{detailOrder.customerName}</span>
                </div>
                <div className="detail-item">
                  <label>Order Date</label>
                  <span>{detailOrder.orderDate}</span>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-ghost"
              onClick={() => setDetailOrder(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div
        className={`modal-overlay ${deleteTarget ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDeleteTarget(null);
        }}
      >
        <div className="modal" style={{ width: "400px" }}>
          <div className="confirm-body">
            <div className="confirm-icon">
              <Trash2 size={20} />
            </div>
            <h3>Delete Order</h3>
            <p>
              {deleteTarget
                ? `Delete "${deleteTarget.productName}" (ID #${shortId(
                    deleteTarget._id
                  )})? This cannot be undone.`
                : "Are you sure? This cannot be undone."}
            </p>
          </div>
          <div className="confirm-footer">
            <button
              className="btn btn-ghost"
              disabled={submitting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={submitting}
              onClick={confirmDelete}
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="toast-wrap">
        {toasts.map((t) => {
          const Icon =
            t.type === "error"
              ? XCircle
              : t.type === "info"
              ? Info
              : CheckCircle;
          return (
            <div key={t.id} className={`toast ${t.type}`}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span>{t.msg}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
