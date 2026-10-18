import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import config from "../../config/config";
import Button from "../common/ui/buttons/button";
import GoodLoader from "../common/ui/loader/loader";
import MessageModal from "../common/ui/messagemodel/messageModel";
import { fetchProducts } from "../../store/slices/productsSlice";
import { loginUser, updateAuthUser } from "../../store/slices/authSlice";
import SellerDocumentSubmission from "./SellerDocumentSubmission";
import SellerApprovalPending from "./SellerApprovalPending";
import SellerRejectedView from "./SellerRejectedView";
import { getProductImage } from "../../utils/productImages";
import "./SellerPortal.css";

const CATEGORIES = ["Electronics", "Clothing", "Home", "Books", "Sports", "Beauty", "Toys", "Others"];

const CATEGORY_CONFIG = {
  Electronics: {
    icon: "bi-laptop",
    namePlaceholder: "e.g. Sony WH-1000XM5 Headphones, Samsung 65\" 4K TV, Dell XPS 15",
    brandPlaceholder: "e.g. Sony, Apple, Samsung, Dell, Bose, LG",
    highlightsPlaceholder: "Active Noise Cancellation with ambient sound mode\nUp to 30 hours battery life with quick charging\nMultipoint Bluetooth 5.3 connection",
    tagsPlaceholder: "headphones, noise cancelling, wireless, bluetooth, audio, travel",
    descriptionPlaceholder: "Detailed summary of tech features, design, build quality, and intended usage...",
  },
  Clothing: {
    icon: "bi-tag",
    namePlaceholder: "e.g. Classic Oxford Cotton Shirt, Merino Wool Sweater, Running Jacket",
    brandPlaceholder: "e.g. Nike, Zara, Levi's, Adidas, Uniqlo, Ralph Lauren",
    highlightsPlaceholder: "100% Breathable combed cotton\nWrinkle-resistant tailored slim fit\nMachine wash cold & color-safe",
    tagsPlaceholder: "cotton, slim fit, casual, formal, breathable, summer",
    descriptionPlaceholder: "Describe fabric quality, sizing guidance, comfort, and recommended styling...",
  },
  Home: {
    icon: "bi-house-door",
    namePlaceholder: "e.g. Ergonomic Office Desk Chair, Ceramic Cookware Set, HEPA Air Purifier",
    brandPlaceholder: "e.g. IKEA, Dyson, KitchenAid, Philips, West Elm",
    highlightsPlaceholder: "Ergonomic lumbar support with 3D armrests\nHeavy-duty steel frame supports up to 300 lbs\nEasy 15-minute toolless assembly",
    tagsPlaceholder: "ergonomic, office chair, desk, lumbar support, furniture",
    descriptionPlaceholder: "Describe materials, room placement, durability, and dimensions...",
  },
  Books: {
    icon: "bi-book",
    namePlaceholder: "e.g. Atomic Habits, Designing Data-Intensive Applications",
    brandPlaceholder: "e.g. Penguin, O'Reilly, HarperCollins, Simon & Schuster",
    highlightsPlaceholder: "Comprehensive in-depth practical case studies\nHigh-quality hardcover with ribbon bookmark\nIncludes downloadable exercise files",
    tagsPlaceholder: "habits, psychology, personal growth, productivity, hardcover",
    descriptionPlaceholder: "Synopsis of key themes, author credentials, target audience...",
  },
  Sports: {
    icon: "bi-trophy",
    namePlaceholder: "e.g. Pro Non-Slip Yoga Mat, Carbon Fiber Tennis Racket, Adjustable Dumbbell Set",
    brandPlaceholder: "e.g. Wilson, Decathlon, Under Armour, Nike, Puma",
    highlightsPlaceholder: "High-density non-slip eco-friendly rubber\nShock-absorbing joint protection\nIncludes durable carrying strap",
    tagsPlaceholder: "yoga, fitness, workout, non-slip, exercise mat, gym",
    descriptionPlaceholder: "Performance specs, training suitability, grip, and durability...",
  },
  Beauty: {
    icon: "bi-sparkles",
    namePlaceholder: "e.g. Hydrating Hyaluronic Acid Serum, Matte Longwear Lipstick, Vitamin C Cream",
    brandPlaceholder: "e.g. L'Oréal, Sephora, CeraVe, Fenty Beauty, The Ordinary",
    highlightsPlaceholder: "Deep 24-hour hydration with pure hyaluronic acid\nDermatologist tested, non-comedogenic\n100% cruelty-free and vegan formula",
    tagsPlaceholder: "skincare, serum, hyaluronic acid, hydration, vegan",
    descriptionPlaceholder: "Application routine, skin benefits, clinical results, and formula texture...",
  },
  Toys: {
    icon: "bi-controller",
    namePlaceholder: "e.g. STEM Robotics Building Kit, 1000-Piece Panoramic Puzzle",
    brandPlaceholder: "e.g. LEGO, Hasbro, Mattel, Fisher-Price, Bandai",
    highlightsPlaceholder: "Develops hands-on STEM and coding skills\nBPA-free non-toxic durable ABS plastic\nStep-by-step illustrated manual included",
    tagsPlaceholder: "stem, robot, coding, building kit, educational, kids",
    descriptionPlaceholder: "Age suitability, gameplay mechanics, educational goals, and safety certifications...",
  },
  Others: {
    icon: "bi-box-seam",
    namePlaceholder: "e.g. Premium Multi-Compartment Tool Organizer, Stainless Steel Travel Flask",
    brandPlaceholder: "e.g. Craftsman, Stanley, Yeti, Hydro Flask, Generic",
    highlightsPlaceholder: "Premium heavy-duty rust-resistant construction\nMulti-purpose versatile utility\nIncludes all accessories and user manual",
    tagsPlaceholder: "organizer, heavy duty, utility, storage, premium",
    descriptionPlaceholder: "Item overview, utility, materials, and package contents...",
  },
};

const ELECTRONICS_SUBTYPES = [
  { id: "general", label: "General Electronics & Gadgets", icon: "bi-cpu" },
  { id: "audio", label: "Headphones & Audio", icon: "bi-headphones" },
  { id: "tvs", label: "TVs & Displays", icon: "bi-tv" },
  { id: "laptops", label: "Laptops & Computers", icon: "bi-laptop" },
  { id: "mobiles", label: "Phones & Tablets", icon: "bi-phone" },
];

const SellerPortal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");

  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);

  const role = (currentUser?.accountType || currentUser?.role || "").toLowerCase();

  const [activeTab, setActiveTab] = useState(urlTab || "dashboard"); // "dashboard" | "inventory" | "orders" | "settings"

  useEffect(() => {
    if (urlTab && ["dashboard", "inventory", "orders", "settings"].includes(urlTab)) {
      setActiveTab(urlTab);
      if (urlTab === "orders" && token) {
        fetchSellerOrders();
      }
    }
  }, [urlTab, token]);

  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const [loading, setLoading] = useState(role === "seller" || role === "admin");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isEditingDocs, setIsEditingDocs] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all"); // "all" | "Pending" | "Shipped" | "Delivered"

  // Catalog Filter State
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("all");
  const [catalogStockFilter, setCatalogStockFilter] = useState("all");

  // Store Profile State
  const [storeForm, setStoreForm] = useState({
    storeName: currentUser?.storeName || "",
    storeDescription: currentUser?.storeDescription || "",
    phone: currentUser?.phone || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setStoreForm({
        storeName: currentUser.storeName || "",
        storeDescription: currentUser.storeDescription || "",
        phone: currentUser.phone || "",
      });
    }
  }, [currentUser]);

  // Form State for Adding Product with Deep Specs
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "Electronics",
    electronicsSubType: "general", // "general" | "audio" | "tvs" | "laptops" | "mobiles"
    price: "",
    originalPrice: "",
    discountPercent: "15",
    stock: "20",
    description: "",
    highlightsText: "",
    tagsText: "",
    warranty: "1 Year Manufacturer Warranty",
    // Computing / Laptops
    processor: "",
    ram: "",
    storage: "",
    display: "",
    battery: "",
    graphics: "",
    os: "Windows 11 / macOS",
    // TVs / Audio / General Electronics
    soundOutput: "",
    screenSize: "",
    resolution: "",
    refreshRate: "",
    smartFeatures: "",
    connectivity: "",
    ports: "",
    noiseCancellation: "",
    camera: "",
    // Clothing
    material: "",
    fit: "",
    gender: "Unisex",
    occasion: "",
    season: "",
    // Books
    author: "",
    publisher: "",
    pages: "",
    genre: "",
    bookFormat: "Paperback",
    language: "English",
    // Home / Furniture / General
    dimensions: "",
    weight: "",
    color: "",
    assemblyRequired: "No",
    roomPlacement: "",
    // Sports
    sportType: "",
    resistance: "",
    capacity: "",
    // Beauty
    skinType: "",
    volume: "",
    scent: "",
    formulation: "",
    // Toys
    recommendedAge: "",
    piecesCount: "",
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchSellerOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get(`${config.apiUrl}/seller/orders`, { headers });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load seller orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodsRes] = await Promise.all([
        axios.get(`${config.apiUrl}/seller/dashboard`, { headers }),
        axios.get(`${config.apiUrl}/seller/products`, { headers }),
      ]);
      setDashboard(dashRes.data);
      setProducts(prodsRes.data);
      window.dispatchEvent(new CustomEvent("refresh-seller-nav-stats"));
      // Also fetch orders in background
      fetchSellerOrders();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load seller hub");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.patch(
        `${config.apiUrl}/seller/orders/${orderId}/status`,
        { status: newStatus },
        { headers }
      );
      setMessage(res.data.message || `Order status updated to ${newStatus}`);
      setMessageType("success");
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      window.dispatchEvent(new CustomEvent("refresh-seller-nav-stats"));
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update order status");
      setMessageType("error");
    }
  };

  const handleSaveStoreProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await axios.put(`${config.apiUrl}/seller/profile`, storeForm, { headers });
      setMessage(res.data.message || "Store profile updated successfully!");
      setMessageType("success");
      if (res.data.user) {
        dispatch(updateAuthUser(res.data.user));
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update store settings");
      setMessageType("error");
    } finally {
      setSavingProfile(false);
    }
  };

  const [sellerAuthInput, setSellerAuthInput] = useState({
    username: "apextech@thestore.com",
    password: "seller123",
  });
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleSellerDirectLogin = async (creds) => {
    setAuthSubmitting(true);
    setAuthError("");
    try {
      await dispatch(loginUser(creds || sellerAuthInput)).unwrap();
      setMessage("Welcome to Seller Hub!");
      setMessageType("success");
    } catch (err) {
      setAuthError(typeof err === "string" ? err : "Seller authentication failed");
    } finally {
      setAuthSubmitting(false);
    }
  };

  useEffect(() => {
    if (token && (role === "seller" || role === "admin")) {
      fetchSellerData();
    }
  }, [token, role]);

  useEffect(() => {
    const handleAddEvent = () => setShowAddModal(true);
    window.addEventListener("open-seller-add-product", handleAddEvent);
    return () => window.removeEventListener("open-seller-add-product", handleAddEvent);
  }, []);

  // 1. If not logged in at all: Redirect directly to dedicated Seller Login page
  if (!token) {
    return <Navigate to="/seller/login" replace />;
  }

  // 2. If logged in as customer: Unauthorized switcher
  if (role !== "seller" && role !== "admin") {
    return (
      <div className="seller-portal-wrapper">
        <div className="admin-unauthorized-card">
          <div className="unauth-icon" style={{ background: "#ecfdf5", color: "#047857" }}>
            <i className="bi bi-shop"></i>
          </div>
          <h2>Merchant & Seller Hub Restricted</h2>
          <p>
            You are currently signed in as <strong>{currentUser?.email || currentUser?.username || "a customer"}</strong> ({role ? role.toUpperCase() : "CUSTOMER"}). Merchant seller privileges are required to manage store inventory and add products.
          </p>
          <div className="unauth-actions">
            <Button
              variant="primary"
              onClick={() => {
                navigate("/seller/login");
              }}
            >
              <i className="bi bi-box-arrow-in-right"></i> Sign In to Seller Hub
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <i className="bi bi-shop"></i> Back to Storefront
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.price || !formData.type) {
      setMessage("Please fill in the product name, price, and category.");
      setMessageType("warning");
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setMessage("Product price must be a valid positive number greater than 0.");
      setMessageType("warning");
      return;
    }

    if (formData.stock !== "" && formData.stock !== undefined) {
      const stockNum = parseInt(formData.stock, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        setMessage("Stock quantity must be a non-negative number.");
        setMessageType("warning");
        return;
      }
    }

    setCreating(true);
    try {
      // Build specs object based on category and attributes
      const specs = {};
      if (formData.type === "Electronics") {
        if (formData.electronicsSubType === "laptops") {
          if (formData.processor) specs.processor = formData.processor;
          if (formData.ram) specs.ram = formData.ram;
          if (formData.storage) specs.storage = formData.storage;
          if (formData.display) specs.display = formData.display;
          if (formData.battery) specs.battery = formData.battery;
          if (formData.graphics) specs.graphics = formData.graphics;
          if (formData.os) specs.os = formData.os;
        } else if (formData.electronicsSubType === "audio") {
          if (formData.soundOutput) specs.soundOutput = formData.soundOutput;
          if (formData.connectivity) specs.connectivity = formData.connectivity;
          if (formData.battery) specs.battery = formData.battery;
          if (formData.noiseCancellation) specs.smartFeatures = formData.noiseCancellation;
          if (formData.color) specs.color = formData.color;
        } else if (formData.electronicsSubType === "tvs") {
          if (formData.screenSize) specs.screenSize = formData.screenSize;
          if (formData.resolution) specs.resolution = formData.resolution;
          if (formData.refreshRate) specs.refreshRate = formData.refreshRate;
          if (formData.smartFeatures) specs.smartFeatures = formData.smartFeatures;
          if (formData.soundOutput) specs.soundOutput = formData.soundOutput;
          if (formData.ports) specs.ports = formData.ports;
        } else if (formData.electronicsSubType === "mobiles") {
          if (formData.display) specs.display = formData.display;
          if (formData.processor) specs.processor = formData.processor;
          if (formData.storage) specs.storage = formData.storage;
          if (formData.battery) specs.battery = formData.battery;
          if (formData.camera) specs.resolution = formData.camera;
          if (formData.os) specs.os = formData.os;
        } else {
          // General Electronics & Gadgets
          if (formData.connectivity) specs.connectivity = formData.connectivity;
          if (formData.battery) specs.battery = formData.battery;
          if (formData.ports) specs.ports = formData.ports;
          if (formData.color) specs.color = formData.color;
          if (formData.dimensions) specs.dimensions = formData.dimensions;
          if (formData.weight) specs.weight = formData.weight;
        }
      } else if (formData.type === "Clothing") {
        if (formData.material) specs.material = formData.material;
        if (formData.fit) specs.fit = formData.fit;
        if (formData.gender) specs.gender = formData.gender;
        if (formData.occasion) specs.occasion = formData.occasion;
        if (formData.color) specs.color = formData.color;
      } else if (formData.type === "Home") {
        if (formData.material) specs.material = formData.material;
        if (formData.dimensions) specs.dimensions = formData.dimensions;
        if (formData.weight) specs.weight = formData.weight;
        if (formData.color) specs.color = formData.color;
        if (formData.roomPlacement) specs.occasion = formData.roomPlacement;
      } else if (formData.type === "Books") {
        if (formData.author) specs.author = formData.author;
        if (formData.publisher) specs.publisher = formData.publisher;
        if (formData.pages) specs.pages = parseInt(formData.pages) || 300;
        if (formData.genre) specs.genre = formData.genre;
        if (formData.language) specs.language = formData.language;
      } else if (formData.type === "Sports") {
        if (formData.sportType) specs.sportType = formData.sportType;
        if (formData.material) specs.material = formData.material;
        if (formData.resistance) specs.resistance = formData.resistance;
        if (formData.dimensions) specs.dimensions = formData.dimensions;
        if (formData.color) specs.color = formData.color;
      } else if (formData.type === "Beauty") {
        if (formData.skinType) specs.skinType = formData.skinType;
        if (formData.volume) specs.volume = formData.volume;
        if (formData.scent) specs.scent = formData.scent;
        if (formData.formulation) specs.material = formData.formulation;
      } else if (formData.type === "Toys") {
        if (formData.recommendedAge) specs.season = formData.recommendedAge;
        if (formData.material) specs.material = formData.material;
        if (formData.piecesCount) specs.capacity = formData.piecesCount;
      } else {
        // Others
        if (formData.material) specs.material = formData.material;
        if (formData.dimensions) specs.dimensions = formData.dimensions;
        if (formData.weight) specs.weight = formData.weight;
        if (formData.color) specs.color = formData.color;
      }

      const highlights = formData.highlightsText
        ? formData.highlightsText.split("\n").filter((h) => h.trim())
        : [];

      const tags = formData.tagsText
        ? formData.tagsText.split(",").map((t) => t.trim().toLowerCase())
        : [];

      const payload = {
        name: formData.name,
        brand: formData.brand || "TheStore Brand",
        type: formData.type,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : parseFloat(formData.price) * 1.15,
        discountPercent: parseInt(formData.discountPercent) || 10,
        stock: parseInt(formData.stock) || 15,
        description: formData.description || `${formData.brand} ${formData.name}`,
        warranty: formData.warranty,
        specs,
        highlights,
        tags,
      };

      const res = await axios.post(`${config.apiUrl}/seller/products`, payload, { headers });
      setMessage("Product added successfully with rich specifications!");
      setMessageType("success");
      setShowAddModal(false);
      // Refresh seller products & main catalog
      fetchSellerData();
      dispatch(fetchProducts());
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create product");
      setMessageType("error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product listing?")) return;
    try {
      await axios.delete(`${config.apiUrl}/seller/products/${id}`, { headers });
      setMessage("Product listing removed");
      setMessageType("info");
      setProducts((prev) => prev.filter((p) => p._id !== id));
      window.dispatchEvent(new CustomEvent("refresh-seller-nav-stats"));
      dispatch(fetchProducts());
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete product");
      setMessageType("error");
    }
  };

  if (loading) {
    return <GoodLoader message="Loading Merchant Hub & Inventory..." />;
  }

  const isApproved = dashboard?.sellerStatus === "approved";
  const isPending = dashboard?.sellerStatus === "pending";
  const isRejected = dashboard?.sellerStatus === "rejected";
  const hasSubmittedDocs = Boolean(dashboard?.sellerDocuments?.businessName);

  // 1. If user is filling/editing documents or has no docs submitted yet:
  if (
    isEditingDocs ||
    (!isApproved && !isPending && !isRejected) ||
    (!isApproved && !hasSubmittedDocs && !isPending && !isRejected)
  ) {
    return (
      <SellerDocumentSubmission
        initialDocs={dashboard?.sellerDocuments}
        onSubmitted={(updatedUser) => {
          setDashboard((prev) => ({
            ...prev,
            sellerStatus: "pending",
            sellerDocuments: updatedUser?.sellerDocuments || prev?.sellerDocuments,
            rejectionReason: "",
            rejectionMessage: "",
          }));
          setIsEditingDocs(false);
          setMessage(
            "Verification documents submitted successfully! Your application is now under administrative review."
          );
          setMessageType("success");
        }}
        onCancel={isApproved ? () => setIsEditingDocs(false) : undefined}
      />
    );
  }

  // 2. If application is Pending Review / Waiting for Admin Approval:
  if (isPending) {
    return (
      <SellerApprovalPending
        dashboard={dashboard}
        onEditDocs={() => setIsEditingDocs(true)}
      />
    );
  }

  // 3. If application was Rejected by Admin (displays specific & custom message):
  if (isRejected) {
    return (
      <SellerRejectedView
        dashboard={dashboard}
        onResubmitDocs={() => setIsEditingDocs(true)}
      />
    );
  }

  return (
    <div className="seller-portal-wrapper">
      {/* ===== MERCHANT STATUS BANNER ===== */}
      <div className={`seller-status-banner banner-${dashboard?.sellerStatus || "approved"}`}>
        <div className="status-banner-content">
          <div className="status-banner-icon">
            {isApproved && <i className="bi bi-patch-check-fill"></i>}
            {isPending && <i className="bi bi-hourglass-split"></i>}
            {isRejected && <i className="bi bi-x-octagon-fill"></i>}
          </div>
          <div>
            <h3>
              {isApproved && "Verified Merchant — Store is Live & Authorized"}
              {isPending && "Merchant Application Under Review"}
              {isRejected && "Merchant Application Rejected"}
            </h3>
            <p>
              {isApproved &&
                "Your account is authorized to list products with detailed technical specs and manage store inventory."}
              {isPending &&
                "Our administrative team is reviewing your merchant credentials. You can view your portal while verification completes."}
              {isRejected &&
                "Your seller status has been declined by administration. Please reach out to platform support."}
            </p>
          </div>
        </div>

        {isApproved && (
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="action-btn docs-btn"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "0.85rem",
              }}
              onClick={() => setIsEditingDocs(true)}
            >
              <i className="bi bi-file-earmark-check-fill"></i> View Verified Docs
            </button>

            <Button
              variant="primary"
              size="md"
              icon={<i className="bi bi-plus-circle"></i>}
              onClick={() => setShowAddModal(true)}
            >
              Add New Product
            </Button>
          </div>
        )}
      </div>

      {/* ================= TAB 0: DASHBOARD & ANALYTICS ================= */}
      {activeTab === "dashboard" && (
        <div className="seller-dashboard-tab">
          {/* Top 5 KPI Metrics */}
          <div className="seller-metrics-grid kpi-5-col">
            <div className="seller-metric-card kpi-card-highlight">
              <div className="metric-icon-wrap text-emerald" style={{ background: "#ecfdf5", color: "#059669" }}>
                <i className="bi bi-currency-dollar"></i>
              </div>
              <div className="metric-content">
                <span className="metric-value">
                  ${(dashboard?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="metric-label">Gross Merchandise Value</span>
                <span className="kpi-trend-pill positive">
                  <i className="bi bi-arrow-up-right"></i> +14.8% MoM
                </span>
              </div>
            </div>

            <div className="seller-metric-card">
              <div className="metric-icon-wrap text-blue" style={{ background: "#eff6ff", color: "#2563eb" }}>
                <i className="bi bi-bag-check-fill"></i>
              </div>
              <div className="metric-content">
                <span className="metric-value">{dashboard?.totalOrders || orders.length || 0}</span>
                <span className="metric-label">Total Orders</span>
                {dashboard?.pendingOrders > 0 ? (
                  <span className="kpi-trend-pill warning">
                    <i className="bi bi-clock-history"></i> {dashboard.pendingOrders} pending
                  </span>
                ) : (
                  <span className="kpi-trend-pill neutral">All orders processed</span>
                )}
              </div>
            </div>

            <div className="seller-metric-card">
              <div className="metric-icon-wrap text-purple" style={{ background: "#faf5ff", color: "#7c3aed" }}>
                <i className="bi bi-box-seam-fill"></i>
              </div>
              <div className="metric-content">
                <span className="metric-value">{dashboard?.totalUnitsSold || 0}</span>
                <span className="metric-label">Units Sold</span>
                <span className="kpi-trend-pill neutral">Across all products</span>
              </div>
            </div>

            <div className="seller-metric-card">
              <div className="metric-icon-wrap text-amber" style={{ background: "#fffbeb", color: "#d97706" }}>
                <i className="bi bi-receipt-cutoff"></i>
              </div>
              <div className="metric-content">
                <span className="metric-value">
                  ${(dashboard?.averageOrderValue || 0).toFixed(2)}
                </span>
                <span className="metric-label">Average Order Value</span>
                <span className="kpi-trend-pill neutral">Per checkout transaction</span>
              </div>
            </div>

            <div className="seller-metric-card">
              <div className="metric-icon-wrap text-indigo" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <div className="metric-content">
                <span className="metric-value">{dashboard?.fulfillmentRate || "99.4%"}</span>
                <span className="metric-label">Fulfillment Health</span>
                <span className="kpi-trend-pill positive">
                  <i className="bi bi-star-fill"></i> 4.9 Rating
                </span>
              </div>
            </div>
          </div>

          {/* Middle Section: Visual Revenue Chart & Fulfillment Stage Breakdown */}
          <div className="dashboard-charts-grid">
            {/* Chart Card */}
            <div className="seller-dash-card revenue-chart-card">
              <div className="dash-card-header">
                <div>
                  <h3 className="dash-card-title">
                    <i className="bi bi-bar-chart-line-fill" style={{ color: "#059669" }}></i>
                    Revenue & Sales Volume (Last 6 Months)
                  </h3>
                  <p className="dash-card-subtitle">
                    Estimated gross sales trends and monthly transaction volumes
                  </p>
                </div>
                <div className="chart-badge-pill">
                  <span>Gross Sales:</span>
                  <strong>${(dashboard?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="chart-visual-wrapper">
                {(() => {
                  const trends = dashboard?.monthlyTrends && dashboard.monthlyTrends.length > 0
                    ? dashboard.monthlyTrends
                    : [
                        { month: "May", revenue: 10400, orders: 8 },
                        { month: "Jun", revenue: 12200, orders: 11 },
                        { month: "Jul", revenue: 11800, orders: 10 },
                        { month: "Aug", revenue: 14900, orders: 13 },
                        { month: "Sep", revenue: 16500, orders: 15 },
                        { month: "Oct", revenue: 19800, orders: 18 },
                      ];
                  const maxRev = Math.max(...trends.map((t) => t.revenue), 1);

                  return (
                    <div className="monthly-chart-bars">
                      {trends.map((item, idx) => {
                        const heightPct = Math.max(16, Math.round((item.revenue / maxRev) * 100));
                        const isLatest = idx === trends.length - 1;
                        return (
                          <div key={item.month} className="chart-bar-col">
                            <div className="bar-tooltip">
                              <strong>${item.revenue.toLocaleString()}</strong>
                              <span>{item.orders} orders</span>
                            </div>
                            <div className="bar-track">
                              <div
                                className={`bar-fill ${isLatest ? "current-month" : ""}`}
                                style={{ height: `${heightPct}%` }}
                              >
                                <span className="bar-value-label">
                                  ${(item.revenue / 1000).toFixed(1)}k
                                </span>
                              </div>
                            </div>
                            <span className={`bar-month-label ${isLatest ? "active-month" : ""}`}>
                              {item.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="chart-footer-metrics">
                <div className="chart-footer-item">
                  <span className="cf-label">Peak Performance</span>
                  <span className="cf-val">October (Current)</span>
                </div>
                <div className="chart-footer-item">
                  <span className="cf-label">Avg. Monthly Run-Rate</span>
                  <span className="cf-val">
                    ${Math.round(
                      ((dashboard?.monthlyTrends || []).reduce((acc, c) => acc + c.revenue, 0) || 85600) / 6
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="chart-footer-item">
                  <span className="cf-label">Fulfillment Pace</span>
                  <span className="cf-val text-emerald">24h Dispatch</span>
                </div>
              </div>
            </div>

            {/* Fulfillment Status Breakdown Card */}
            <div className="seller-dash-card fulfillment-card">
              <div className="dash-card-header">
                <div>
                  <h3 className="dash-card-title">
                    <i className="bi bi-pie-chart-fill" style={{ color: "#3b82f6" }}></i>
                    Order Fulfillment Pipeline
                  </h3>
                  <p className="dash-card-subtitle">
                    Tracking orders across all lifecycle stages
                  </p>
                </div>
                <button
                  type="button"
                  className="dash-link-btn"
                  onClick={() => handleTabSwitch("orders")}
                >
                  View Orders <i className="bi bi-arrow-right"></i>
                </button>
              </div>

              <div className="fulfillment-breakdown-body">
                {(() => {
                  const total = Math.max(dashboard?.totalOrders || orders.length, 1);
                  const pending = dashboard?.pendingOrders ?? orders.filter((o) => o.status === "Pending").length;
                  const shipped = dashboard?.shippedOrders ?? orders.filter((o) => o.status === "Shipped").length;
                  const delivered = dashboard?.deliveredOrders ?? orders.filter((o) => o.status === "Delivered").length;
                  const cancelled = dashboard?.cancelledOrders ?? orders.filter((o) => o.status === "Cancelled").length;

                  const stages = [
                    { label: "Pending Fulfillment", count: pending, color: "#f59e0b", icon: "bi-hourglass-split" },
                    { label: "Shipped & In-Transit", count: shipped, color: "#3b82f6", icon: "bi-truck" },
                    { label: "Delivered to Customer", count: delivered, color: "#10b981", icon: "bi-check2-circle" },
                    { label: "Cancelled / Returned", count: cancelled, color: "#ef4444", icon: "bi-x-circle" },
                  ];

                  return (
                    <div className="stages-list">
                      {stages.map((stg) => {
                        const pct = Math.round((stg.count / total) * 100);
                        return (
                          <div key={stg.label} className="stage-row">
                            <div className="stage-info-row">
                              <span className="stage-name">
                                <i className={`bi ${stg.icon}`} style={{ color: stg.color, marginRight: "0.4rem" }}></i>
                                {stg.label}
                              </span>
                              <span className="stage-count">
                                <strong>{stg.count}</strong> orders ({pct}%)
                              </span>
                            </div>
                            <div className="stage-progress-track">
                              <div
                                className="stage-progress-fill"
                                style={{ width: `${Math.max(pct, stg.count > 0 ? 8 : 0)}%`, backgroundColor: stg.color }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                <div className="fulfillment-quick-alert">
                  <div className="fqa-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div className="fqa-text">
                    <strong>Merchant Quality Score: 99.4%</strong>
                    <p>Maintaining high fulfillment speed qualifies your products for Prime Merchant badges.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Low Stock Warnings & Top Selling Products */}
          <div className="dashboard-bottom-grid">
            {/* Low Stock Alerts */}
            <div className="seller-dash-card">
              <div className="dash-card-header">
                <div>
                  <h3 className="dash-card-title">
                    <i className="bi bi-exclamation-triangle-fill" style={{ color: "#d97706" }}></i>
                    Inventory & Stock Alerts
                  </h3>
                  <p className="dash-card-subtitle">
                    Products with low or depleted stock requiring restock
                  </p>
                </div>
                <button
                  type="button"
                  className="dash-link-btn"
                  onClick={() => handleTabSwitch("inventory")}
                >
                  Manage Stock <i className="bi bi-arrow-right"></i>
                </button>
              </div>

              {(() => {
                const lowItems = (dashboard?.lowStockItems && dashboard.lowStockItems.length > 0)
                  ? dashboard.lowStockItems
                  : products.filter((p) => (p.stock || 0) <= 5).slice(0, 5);

                if (lowItems.length === 0) {
                  return (
                    <div className="inventory-healthy-box">
                      <i className="bi bi-check-circle-fill text-emerald" style={{ fontSize: "2rem", color: "#10b981" }}></i>
                      <h4 style={{ margin: "0.5rem 0 0.25rem", color: "#0f172a" }}>All Stock Levels Are Optimal</h4>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>None of your listings are out of stock or below low stock thresholds.</p>
                    </div>
                  );
                }

                return (
                  <div className="low-stock-list">
                    {lowItems.map((item) => (
                      <div key={item._id} className="low-stock-item-row">
                        <div className="item-details">
                          <strong>{item.name}</strong>
                          <span className="item-meta">
                            {item.type} • ${(item.price || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="item-stock-action">
                          <span className={`stock-badge ${item.stock === 0 ? "depleted" : "critical"}`}>
                            {item.stock === 0 ? "Sold Out (0)" : `Only ${item.stock} left`}
                          </span>
                          <button
                            type="button"
                            className="restock-shortcut-btn"
                            onClick={() => handleTabSwitch("inventory")}
                          >
                            Restock
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Top Selling Products Leaderboard */}
            <div className="seller-dash-card">
              <div className="dash-card-header">
                <div>
                  <h3 className="dash-card-title">
                    <i className="bi bi-trophy-fill" style={{ color: "#eab308" }}></i>
                    Top Performing Products
                  </h3>
                  <p className="dash-card-subtitle">
                    Leading catalog items ranked by units sold and gross earnings
                  </p>
                </div>
                <button
                  type="button"
                  className="dash-link-btn"
                  onClick={() => handleTabSwitch("inventory")}
                >
                  All Products <i className="bi bi-arrow-right"></i>
                </button>
              </div>

              {(() => {
                const topItems = (dashboard?.topSellingProducts && dashboard.topSellingProducts.length > 0)
                  ? dashboard.topSellingProducts
                  : products.slice(0, 5);

                if (topItems.length === 0) {
                  return (
                    <div className="inventory-healthy-box">
                      <i className="bi bi-box-seam" style={{ fontSize: "2rem", color: "#94a3b8" }}></i>
                      <h4 style={{ margin: "0.5rem 0 0.25rem", color: "#0f172a" }}>No Sales Recorded Yet</h4>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>As customer orders arrive for your products, top revenue drivers will appear here.</p>
                    </div>
                  );
                }

                return (
                  <div className="top-products-list">
                    {topItems.map((prod, rank) => (
                      <div key={prod._id} className="top-product-row">
                        <div className="rank-badge">#{rank + 1}</div>
                        <div className="product-summary-col">
                          <strong>{prod.name}</strong>
                          <span className="prod-sub">{prod.type || prod.brand || "Catalog Item"}</span>
                        </div>
                        <div className="product-perf-col">
                          <strong className="perf-rev">
                            ${((prod.revenue || (prod.unitsSold || 0) * (prod.price || 0)) || (prod.price || 0) * 2).toFixed(2)}
                          </strong>
                          <span className="perf-units">
                            {prod.unitsSold || Math.max(1, 4 - rank)} units sold
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Recent Orders Stream Preview */}
          <div className="seller-dash-card recent-orders-card">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">
                  <i className="bi bi-clock-history" style={{ color: "#6366f1" }}></i>
                  Recent Customer Orders
                </h3>
                <p className="dash-card-subtitle">
                  Latest order activity across your storefront
                </p>
              </div>
              <button
                type="button"
                className="dash-link-btn"
                onClick={() => handleTabSwitch("orders")}
              >
                Go to Fulfillment Console <i className="bi bi-arrow-right"></i>
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="inventory-healthy-box">
                <i className="bi bi-inbox" style={{ fontSize: "2rem", color: "#94a3b8" }}></i>
                <h4 style={{ margin: "0.5rem 0 0.25rem", color: "#0f172a" }}>No Orders Placed Yet</h4>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>New orders will appear here immediately with quick status controls.</p>
              </div>
            ) : (
              <div className="seller-table-container">
                <table className="seller-data-table">
                  <thead>
                    <tr>
                      <th>Order ID & Date</th>
                      <th>Customer</th>
                      <th>Items Ordered</th>
                      <th>Amount</th>
                      <th>Fulfillment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 4).map((ord) => {
                      const status = ord.status || "Pending";
                      return (
                        <tr key={ord._id}>
                          <td>
                            <strong style={{ color: "#4f46e5", fontFamily: "monospace", fontSize: "0.85rem" }}>
                              #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                            </strong>
                            <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                              {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : "Recent"}
                            </div>
                          </td>
                          <td>
                            <strong>
                              {ord.userId ? `${ord.userId.firstName || ""} ${ord.userId.lastName || ""}` : "Customer"}
                            </strong>
                            <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                              {ord.userId?.email || ""}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>
                              {ord.items?.length || 1} {ord.items?.length === 1 ? "item" : "items"}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: "#0f172a" }}>${(ord.totalPrice || 0).toFixed(2)}</strong>
                          </td>
                          <td>
                            <span className={`status-pill status-${status.toLowerCase()}`}>
                              {status === "Pending" && "⏳ Pending"}
                              {status === "Shipped" && "🚚 Shipped"}
                              {status === "Delivered" && "✅ Delivered"}
                              {status === "Cancelled" && "❌ Cancelled"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="view-live-btn"
                              style={{
                                padding: "0.35rem 0.65rem",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                background: "#f8fafc",
                                fontSize: "0.76rem",
                                fontWeight: "700",
                                color: "#0284c7",
                                cursor: "pointer",
                              }}
                              onClick={() => handleTabSwitch("orders")}
                            >
                              Manage Order
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 1: INVENTORY & CATALOG ================= */}
      {activeTab === "inventory" && (
        <>
          {/* ===== METRIC STATS ROW ===== */}
          <div className="seller-metrics-grid">
            <div className="seller-metric-card">
              <div className="metric-icon-wrap text-purple">
                <i className="bi bi-box-seam"></i>
              </div>
              <div className="metric-content">
                <span className="metric-value">{products.length}</span>
                <span className="metric-label">Listed Products</span>
              </div>
            </div>

            <div className="seller-metric-card">
              <div className="metric-icon-wrap text-emerald">
                <i className="bi bi-layers-fill"></i>
              </div>
              <div className="metric-content">
                <span className="metric-value">{dashboard?.totalUnitsInStock || 0}</span>
                <span className="metric-label">Units in Stock</span>
              </div>
            </div>

            <div className="seller-metric-card">
              <div className="metric-icon-wrap text-amber">
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="metric-content">
                <span className="metric-value">4.9 ★</span>
                <span className="metric-label">Store Rating</span>
              </div>
            </div>

            <div className="seller-metric-card">
              <div className="metric-icon-wrap text-blue">
                <i className="bi bi-truck"></i>
              </div>
              <div className="metric-content">
                <span className="metric-value">{dashboard?.fulfillmentRate || "99.4%"}</span>
                <span className="metric-label">On-Time Fulfillment</span>
              </div>
            </div>
          </div>

          {/* ===== MY PRODUCTS INVENTORY TABLE ===== */}
          <section className="seller-inventory-section">
            <div className="inventory-header-row">
              <div>
                <h2>My Store Catalog & Listings</h2>
                <p>Manage pricing, stock levels, and specifications for your products.</p>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<i className="bi bi-arrow-repeat"></i>}
                  onClick={fetchSellerData}
                >
                  Refresh Catalog
                </Button>
                {isApproved && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<i className="bi bi-plus-circle-fill"></i>}
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Product
                  </Button>
                )}
              </div>
            </div>

            {/* Catalog Search & Category Filter Toolbar */}
            <div className="catalog-toolbar">
              <div className="catalog-search-wrap">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Filter by product name, brand, or specs..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="catalog-search-input"
                />
                {catalogSearch && (
                  <button
                    type="button"
                    className="catalog-search-clear"
                    onClick={() => setCatalogSearch("")}
                    aria-label="Clear filter"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>

              <div className="catalog-filter-chips">
                <button
                  type="button"
                  className={`catalog-chip ${catalogCategory === "all" ? "active" : ""}`}
                  onClick={() => setCatalogCategory("all")}
                >
                  All ({products.length})
                </button>
                {CATEGORIES.filter((cat) => products.some((p) => p.type === cat)).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`catalog-chip ${catalogCategory === cat ? "active" : ""}`}
                    onClick={() => setCatalogCategory(cat)}
                  >
                    <i className={`bi ${CATEGORY_CONFIG[cat]?.icon || "bi-tag"}`}></i>
                    {cat} ({products.filter((p) => p.type === cat).length})
                  </button>
                ))}
              </div>
            </div>

            {products.length === 0 ? (
              <div className="seller-empty-inventory">
                <i className="bi bi-bag-plus"></i>
                <h3>No products listed in your store yet</h3>
                <p>Create your first listing with technical specs to start selling on TheStore.</p>
                {isApproved && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setShowAddModal(true)}
                  >
                    Create First Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="seller-table-container">
                <table className="seller-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "26%" }}>Product Details</th>
                      <th style={{ width: "12%" }}>Category</th>
                      <th style={{ width: "14%" }}>Price</th>
                      <th style={{ width: "14%" }}>Stock Status</th>
                      <th style={{ width: "20%" }}>Specs & Highlights</th>
                      <th style={{ width: "14%", textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => {
                        if (catalogCategory !== "all" && p.type !== catalogCategory) return false;
                        if (catalogSearch.trim()) {
                          const q = catalogSearch.toLowerCase().trim();
                          return (
                            p.name?.toLowerCase().includes(q) ||
                            p.brand?.toLowerCase().includes(q) ||
                            p.type?.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div className="seller-product-item-cell">
                              <img
                                src={getProductImage(item)}
                                alt={item.name}
                                className="seller-product-thumb"
                                loading="lazy"
                              />
                              <div className="seller-product-meta">
                                <strong className="seller-product-title">{item.name}</strong>
                                <span className="seller-product-brand-badge">{item.brand || "TheStore"}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="seller-category-tag">
                              <i className={`bi ${CATEGORY_CONFIG[item.type]?.icon || "bi-tag"}`}></i>
                              {item.type}
                            </span>
                          </td>

                          <td>
                            <div className="seller-price-cell">
                              <span className="seller-price-val">${(item.price || 0).toFixed(2)}</span>
                              {item.discountPercent > 0 && (
                                <span className="seller-discount-pill">-{item.discountPercent}%</span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`seller-stock-pill ${
                                item.stock > 5 ? "in-stock" : item.stock > 0 ? "low-stock" : "out-stock"
                              }`}
                            >
                              <i
                                className={`bi ${
                                  item.stock > 5
                                    ? "bi-check-circle-fill"
                                    : item.stock > 0
                                    ? "bi-exclamation-triangle-fill"
                                    : "bi-x-circle-fill"
                                }`}
                              ></i>
                              {item.stock > 0 ? `${item.stock} in stock` : "Sold Out"}
                            </span>
                          </td>

                          <td>
                            <div className="seller-specs-cell">
                              {item.specs?.processor && (
                                <span className="seller-spec-pill" title="Processor">
                                  <i className="bi bi-cpu"></i> {item.specs.processor}
                                </span>
                              )}
                              {item.specs?.ram && (
                                <span className="seller-spec-pill" title="RAM">
                                  <i className="bi bi-memory"></i> {item.specs.ram}
                                </span>
                              )}
                              {item.specs?.storage && (
                                <span className="seller-spec-pill" title="Storage">
                                  <i className="bi bi-hdd"></i> {item.specs.storage}
                                </span>
                              )}
                              {item.specs?.screenSize && (
                                <span className="seller-spec-pill" title="Screen">
                                  <i className="bi bi-tv"></i> {item.specs.screenSize}
                                </span>
                              )}
                              {item.specs?.material && (
                                <span className="seller-spec-pill" title="Material">
                                  {item.specs.material}
                                </span>
                              )}
                              {item.specs?.author && (
                                <span className="seller-spec-pill" title="Author">
                                  by {item.specs.author}
                                </span>
                              )}
                              {item.warranty && (
                                <span className="seller-spec-pill warranty" title="Warranty">
                                  <i className="bi bi-shield-check"></i> {item.warranty}
                                </span>
                              )}
                              {!item.specs?.processor &&
                                !item.specs?.ram &&
                                !item.specs?.storage &&
                                !item.specs?.screenSize &&
                                !item.specs?.material &&
                                !item.specs?.author &&
                                !item.warranty && (
                                  <span className="seller-spec-pill default">
                                    <i className="bi bi-check2"></i> Standard Specs
                                  </span>
                                )}
                            </div>
                          </td>

                          <td>
                            <div className="seller-actions-cluster" style={{ justifyContent: "center" }}>
                              <button
                                type="button"
                                className="seller-view-live-btn"
                                onClick={() =>
                                  navigate(
                                    `/?search=${encodeURIComponent(item.name)}&productId=${item._id}`
                                  )
                                }
                                title="View live on customer storefront"
                              >
                                <i className="bi bi-eye"></i> View Live
                              </button>
                              <button
                                type="button"
                                className="seller-delete-btn"
                                onClick={() => handleDeleteProduct(item._id)}
                                title="Delete product listing"
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* ================= TAB 2: CUSTOMER ORDERS & FULFILLMENT ================= */}
      {activeTab === "orders" && (
        <section className="seller-inventory-section">
          <div className="inventory-header-row">
            <div>
              <h2>Customer Orders & Fulfillment</h2>
              <p>Track orders received from customers, inspect purchased items, and manage shipping updates.</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<i className="bi bi-arrow-repeat"></i>}
              onClick={fetchSellerOrders}
            >
              Refresh Orders
            </Button>
          </div>

          {/* Filter chips with clean count badges */}
          <div className="order-filter-chip-group">
            <button
              type="button"
              className={`order-filter-chip ${orderFilter === "all" ? "active" : ""}`}
              onClick={() => setOrderFilter("all")}
            >
              All Orders <span className="chip-count">{orders.length}</span>
            </button>
            <button
              type="button"
              className={`order-filter-chip pending ${orderFilter === "Pending" ? "active" : ""}`}
              onClick={() => setOrderFilter("Pending")}
            >
              <i className="bi bi-hourglass-split"></i> Pending{" "}
              <span className="chip-count">{orders.filter((o) => o.status === "Pending").length}</span>
            </button>
            <button
              type="button"
              className={`order-filter-chip shipped ${orderFilter === "Shipped" ? "active" : ""}`}
              onClick={() => setOrderFilter("Shipped")}
            >
              <i className="bi bi-truck"></i> Shipped{" "}
              <span className="chip-count">{orders.filter((o) => o.status === "Shipped").length}</span>
            </button>
            <button
              type="button"
              className={`order-filter-chip delivered ${orderFilter === "Delivered" ? "active" : ""}`}
              onClick={() => setOrderFilter("Delivered")}
            >
              <i className="bi bi-check2-circle"></i> Delivered{" "}
              <span className="chip-count">{orders.filter((o) => o.status === "Delivered").length}</span>
            </button>
            <button
              type="button"
              className={`order-filter-chip cancelled ${orderFilter === "Cancelled" ? "active" : ""}`}
              onClick={() => setOrderFilter("Cancelled")}
            >
              <i className="bi bi-x-circle"></i> Cancelled{" "}
              <span className="chip-count">{orders.filter((o) => o.status === "Cancelled").length}</span>
            </button>
          </div>

          {ordersLoading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <GoodLoader message="Loading customer orders..." />
            </div>
          ) : orders.filter((o) => (orderFilter === "all" ? true : o.status === orderFilter)).length === 0 ? (
            <div className="seller-empty-inventory">
              <i className="bi bi-inbox-fill" style={{ fontSize: "2.5rem", color: "#94a3b8" }}></i>
              <h3>No Customer Orders in this Category</h3>
              <p>When customers purchase your listed items, they will appear here for fulfillment and dispatch.</p>
            </div>
          ) : (
            <div className="seller-table-container">
              <table className="seller-data-table">
                <thead>
                  <tr>
                    <th>Order & Date</th>
                    <th>Customer Details</th>
                    <th style={{ width: "30%" }}>Items Purchased</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter((o) => (orderFilter === "all" ? true : o.status === orderFilter))
                    .map((ord) => {
                      const status = ord.status || "Pending";
                      return (
                        <tr key={ord._id}>
                          <td>
                            <div className="seller-order-id-cell">
                              <span className="seller-order-ref">
                                #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                              </span>
                              <span className="seller-order-date">
                                <i className="bi bi-calendar3"></i>{" "}
                                {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : "Recent"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="seller-customer-cell">
                              <div className="seller-customer-avatar">
                                {(ord.userId?.firstName?.[0] || "C").toUpperCase()}
                                {(ord.userId?.lastName?.[0] || "").toUpperCase()}
                              </div>
                              <div className="seller-customer-info">
                                <strong className="seller-customer-name">
                                  {ord.userId
                                    ? `${ord.userId.firstName || ""} ${ord.userId.lastName || ""}`
                                    : "Customer"}
                                </strong>
                                <span className="seller-customer-meta">
                                  <i className="bi bi-envelope"></i> {ord.userId?.email || "No email"}
                                </span>
                                {ord.userId?.phone && (
                                  <span className="seller-customer-meta">
                                    <i className="bi bi-telephone"></i> {ord.userId.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="seller-items-list">
                              {ord.items?.map((it, idx) => (
                                <div key={idx} className="seller-item-row">
                                  <span className="seller-item-name">
                                    {it.productId?.name || "Product"}
                                  </span>
                                  <span className="seller-item-qty">
                                    x{it.quantity} (${(it.price || 0).toFixed(2)})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td>
                            <span className="seller-total-price">
                              ${(ord.totalPrice || 0).toFixed(2)}
                            </span>
                          </td>

                          <td>
                            <span className={`seller-status-badge status-${status.toLowerCase()}`}>
                              <i
                                className={`bi ${
                                  status === "Pending"
                                    ? "bi-hourglass-split"
                                    : status === "Shipped"
                                    ? "bi-truck"
                                    : status === "Delivered"
                                    ? "bi-check2-circle"
                                    : "bi-x-circle"
                                }`}
                              ></i>
                              {status}
                            </span>
                          </td>

                          <td>
                            <div className="seller-fulfillment-action" style={{ justifyContent: "center" }}>
                              {status === "Pending" && (
                                <button
                                  type="button"
                                  className="seller-fulfill-btn ship"
                                  onClick={() => handleUpdateOrderStatus(ord._id, "Shipped")}
                                  title="Mark order as dispatched & shipped"
                                >
                                  <i className="bi bi-truck"></i> Ship Order
                                </button>
                              )}

                              {status === "Shipped" && (
                                <button
                                  type="button"
                                  className="seller-fulfill-btn deliver"
                                  onClick={() => handleUpdateOrderStatus(ord._id, "Delivered")}
                                  title="Confirm delivery to customer"
                                >
                                  <i className="bi bi-check2-circle"></i> Deliver
                                </button>
                              )}

                              {status === "Delivered" && (
                                <span className="seller-fulfill-done">
                                  <i className="bi bi-check2-all"></i> Completed
                                </span>
                              )}

                              {status === "Cancelled" && (
                                <span className="seller-fulfill-cancelled">
                                  <i className="bi bi-x-circle"></i> Cancelled
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 3: STORE PROFILE & SETTINGS ================= */}
      {activeTab === "settings" && (
        <section className="seller-inventory-section">
          <div className="inventory-header-row">
            <div>
              <h2>Storefront Branding & Merchant Profile</h2>
              <p>Configure how your store appears across product cards, customer search results, and receipts.</p>
            </div>
          </div>

          <div
            className="seller-settings-card"
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              background: "#f8fafc",
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.8rem",
                paddingBottom: "1.2rem",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "#ecfdf5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                }}
              >
                <i className="bi bi-patch-check-fill"></i>
              </div>
              <div>
                <h3 style={{ margin: "0 0 0.25rem", color: "#0f172a", fontSize: "1.2rem" }}>
                  {storeForm.storeName || `${currentUser?.firstName}'s Store`}
                </h3>
                <span className="status-pill status-approved" style={{ display: "inline-flex" }}>
                  ✅ Verified Merchant Partner
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveStoreProfile} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <div className="form-field">
                <label
                  style={{
                    display: "block",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#334155",
                    marginBottom: "0.4rem",
                  }}
                >
                  Storefront Display Name *
                </label>
                <input
                  type="text"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.95rem",
                  }}
                  placeholder="e.g. Apex Tech Supplies"
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm((prev) => ({ ...prev, storeName: e.target.value }))}
                />
                <span style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                  This name is displayed prominently on all your product listings ("Sold by ...")
                </span>
              </div>

              <div className="form-field">
                <label
                  style={{
                    display: "block",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#334155",
                    marginBottom: "0.4rem",
                  }}
                >
                  Storefront Description / Bio
                </label>
                <textarea
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.95rem",
                    resize: "vertical",
                  }}
                  placeholder="Official distributor for certified computing hardware, gaming peripherals, and consumer tech..."
                  value={storeForm.storeDescription}
                  onChange={(e) => setStoreForm((prev) => ({ ...prev, storeDescription: e.target.value }))}
                ></textarea>
              </div>

              <div className="form-field">
                <label
                  style={{
                    display: "block",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#334155",
                    marginBottom: "0.4rem",
                  }}
                >
                  Merchant Support Phone
                </label>
                <input
                  type="text"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.95rem",
                  }}
                  placeholder="+1 (555) 987-6543"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  background: "#ffffff",
                  padding: "1rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Account Email
                  </span>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "#1e293b" }}>
                    {currentUser?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Merchant Handle
                  </span>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "#1e293b" }}>
                    @{currentUser?.username || "merchant"}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <Button
                  type="submit"
                  variant="primary"
                  loading={savingProfile}
                  icon={<i className="bi bi-save2"></i>}
                >
                  Save Store Profile
                </Button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ===== ADD PRODUCT MODAL WITH IN-DEPTH SPECS ===== */}
      {showAddModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <i className="bi bi-plus-square-fill"></i>
                <div>
                  <h3>Add New Product to Store</h3>
                  <p>Provide in-depth technical specifications for accurate AI recommendations</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="add-product-form">
              {/* Section 1: Core Details */}
              <div className="form-section-title">
                <i className="bi bi-info-circle"></i> Basic Product Information
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={CATEGORY_CONFIG[formData.type]?.namePlaceholder || "e.g. Product Name"}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Brand / Manufacturer *</label>
                  <input
                    type="text"
                    name="brand"
                    required
                    placeholder={CATEGORY_CONFIG[formData.type]?.brandPlaceholder || "e.g. Brand Name"}
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid-4">
                <div className="form-field">
                  <label>Category *</label>
                  <select name="type" value={formData.type} onChange={handleChange}>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    placeholder="79.99"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="originalPrice"
                    placeholder="99.99"
                    value={formData.originalPrice}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Initial Stock Units</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="2"
                  placeholder={CATEGORY_CONFIG[formData.type]?.descriptionPlaceholder || "Summary of product features, use-case, and build quality..."}
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Section 2: Technical Specifications & Product Attributes */}
              <div className="form-section-title">
                <i className={`bi ${CATEGORY_CONFIG[formData.type]?.icon || "bi-sliders2"}`}></i>
                <span style={{ marginLeft: "0.4rem" }}>Specifications & Attributes ({formData.type})</span>
              </div>

              {/* ===== ELECTRONICS SECTION ===== */}
              {formData.type === "Electronics" && (
                <div className="specs-fields-box">
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: "0.4rem" }}>
                    Select Electronics Device Type:
                  </label>
                  <div className="sub-type-selector-row">
                    {ELECTRONICS_SUBTYPES.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        className={`sub-type-chip-btn ${formData.electronicsSubType === sub.id ? "active" : ""}`}
                        onClick={() => setFormData((prev) => ({ ...prev, electronicsSubType: sub.id }))}
                      >
                        <i className={`bi ${sub.icon}`}></i> {sub.label}
                      </button>
                    ))}
                  </div>

                  {formData.electronicsSubType === "laptops" && (
                    <>
                      <div className="form-grid-3">
                        <div className="form-field">
                          <label>Processor (CPU)</label>
                          <input
                            type="text"
                            name="processor"
                            placeholder="e.g. Intel Core i7-13700H or Apple M3"
                            value={formData.processor}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>RAM Memory</label>
                          <input
                            type="text"
                            name="ram"
                            placeholder="e.g. 16GB LPDDR5 6400MHz"
                            value={formData.ram}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Internal Storage</label>
                          <input
                            type="text"
                            name="storage"
                            placeholder="e.g. 1TB NVMe PCIe 4.0 SSD"
                            value={formData.storage}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-grid-3">
                        <div className="form-field">
                          <label>Display & Screen</label>
                          <input
                            type="text"
                            name="display"
                            placeholder="e.g. 15.6 Inch 120Hz OLED 400 nits"
                            value={formData.display}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Battery Life / Capacity</label>
                          <input
                            type="text"
                            name="battery"
                            placeholder="e.g. 86Wh (Up to 12 Hours)"
                            value={formData.battery}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Dedicated Graphics (GPU)</label>
                          <input
                            type="text"
                            name="graphics"
                            placeholder="e.g. NVIDIA RTX 4070 8GB GDDR6"
                            value={formData.graphics}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.electronicsSubType === "audio" && (
                    <>
                      <div className="form-grid-3">
                        <div className="form-field">
                          <label>Sound Output / Drivers</label>
                          <input
                            type="text"
                            name="soundOutput"
                            placeholder="e.g. 40mm Neodymium Drivers, Hi-Res Audio"
                            value={formData.soundOutput}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Wireless Connectivity</label>
                          <input
                            type="text"
                            name="connectivity"
                            placeholder="e.g. Bluetooth 5.3 Multipoint, 3.5mm Aux"
                            value={formData.connectivity}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Battery Playback Time</label>
                          <input
                            type="text"
                            name="battery"
                            placeholder="e.g. Up to 30 Hours (ANC On)"
                            value={formData.battery}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-field">
                          <label>Noise Cancellation & Features</label>
                          <input
                            type="text"
                            name="noiseCancellation"
                            placeholder="e.g. Active Noise Cancellation (ANC), Transparency Mode"
                            value={formData.noiseCancellation}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Color Variant</label>
                          <input
                            type="text"
                            name="color"
                            placeholder="e.g. Midnight Black, Platinum Silver"
                            value={formData.color}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.electronicsSubType === "tvs" && (
                    <>
                      <div className="form-grid-3">
                        <div className="form-field">
                          <label>Screen Size</label>
                          <input
                            type="text"
                            name="screenSize"
                            placeholder="e.g. 65 Inch"
                            value={formData.screenSize}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Display Resolution</label>
                          <input
                            type="text"
                            name="resolution"
                            placeholder="e.g. 4K Ultra HD (3840 x 2160) OLED"
                            value={formData.resolution}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Refresh Rate</label>
                          <input
                            type="text"
                            name="refreshRate"
                            placeholder="e.g. 120Hz Native, VRR / ALLM"
                            value={formData.refreshRate}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-grid-3">
                        <div className="form-field">
                          <label>Smart TV Platform</label>
                          <input
                            type="text"
                            name="smartFeatures"
                            placeholder="e.g. Google TV, Apple AirPlay 2, Alexa"
                            value={formData.smartFeatures}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Sound Output</label>
                          <input
                            type="text"
                            name="soundOutput"
                            placeholder="e.g. 40W Dolby Atmos 2.1 Channel"
                            value={formData.soundOutput}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Ports & Inputs</label>
                          <input
                            type="text"
                            name="ports"
                            placeholder="e.g. 4x HDMI 2.1 (eARC), 2x USB, Optical"
                            value={formData.ports}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.electronicsSubType === "mobiles" && (
                    <>
                      <div className="form-grid-3">
                        <div className="form-field">
                          <label>Screen & Display</label>
                          <input
                            type="text"
                            name="display"
                            placeholder="e.g. 6.7 Inch Super AMOLED 120Hz"
                            value={formData.display}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Processor / Chipset</label>
                          <input
                            type="text"
                            name="processor"
                            placeholder="e.g. Snapdragon 8 Gen 3, A17 Pro"
                            value={formData.processor}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Storage & RAM</label>
                          <input
                            type="text"
                            name="storage"
                            placeholder="e.g. 256GB Storage, 12GB RAM"
                            value={formData.storage}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-grid-3">
                        <div className="form-field">
                          <label>Battery Capacity</label>
                          <input
                            type="text"
                            name="battery"
                            placeholder="e.g. 5000mAh with 45W Fast Charging"
                            value={formData.battery}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Camera Setup</label>
                          <input
                            type="text"
                            name="camera"
                            placeholder="e.g. 50MP Main + 12MP Ultra-Wide"
                            value={formData.camera}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Operating System</label>
                          <input
                            type="text"
                            name="os"
                            placeholder="e.g. Android 14 / iOS 17"
                            value={formData.os}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.electronicsSubType === "general" && (
                    <>
                      <div className="form-grid-3">
                        <div className="form-field">
                          <label>Connectivity / Wireless</label>
                          <input
                            type="text"
                            name="connectivity"
                            placeholder="e.g. Bluetooth 5.3, Wi-Fi 6E, USB-C"
                            value={formData.connectivity}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Power & Battery</label>
                          <input
                            type="text"
                            name="battery"
                            placeholder="e.g. Rechargeable 5000mAh, AC Powered"
                            value={formData.battery}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Input / Output Ports</label>
                          <input
                            type="text"
                            name="ports"
                            placeholder="e.g. USB-C PD, USB-A 3.0, MicroSD"
                            value={formData.ports}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-grid-3">
                        <div className="form-field">
                          <label>Color Variant</label>
                          <input
                            type="text"
                            name="color"
                            placeholder="e.g. Space Gray, Matte Black, White"
                            value={formData.color}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Dimensions</label>
                          <input
                            type="text"
                            name="dimensions"
                            placeholder="e.g. 5.5 x 2.8 x 0.4 inches"
                            value={formData.dimensions}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label>Weight</label>
                          <input
                            type="text"
                            name="weight"
                            placeholder="e.g. 195 grams"
                            value={formData.weight}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ===== CLOTHING SECTION ===== */}
              {formData.type === "Clothing" && (
                <div className="specs-fields-box">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Fabric / Material</label>
                      <input
                        type="text"
                        name="material"
                        placeholder="e.g. 100% Egyptian Cotton, Merino Wool"
                        value={formData.material}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Fit Type</label>
                      <input
                        type="text"
                        name="fit"
                        placeholder="e.g. Slim Fit, Regular Fit, Relaxed"
                        value={formData.fit}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Gender / Department</label>
                      <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Occasion / Season</label>
                      <input
                        type="text"
                        name="occasion"
                        placeholder="e.g. Casual Daily, Formal, All-Season"
                        value={formData.occasion}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Color Variant</label>
                      <input
                        type="text"
                        name="color"
                        placeholder="e.g. Navy Blue, Heather Grey, White"
                        value={formData.color}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== HOME SECTION ===== */}
              {formData.type === "Home" && (
                <div className="specs-fields-box">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Material & Construction</label>
                      <input
                        type="text"
                        name="material"
                        placeholder="e.g. Solid Oak Wood, Brushed Stainless Steel, Ceramic"
                        value={formData.material}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Dimensions (L x W x H)</label>
                      <input
                        type="text"
                        name="dimensions"
                        placeholder={'e.g. 36" L x 24" W x 30" H'}
                        value={formData.dimensions}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Weight / Load Capacity</label>
                      <input
                        type="text"
                        name="weight"
                        placeholder="e.g. 25 lbs / Supports up to 300 lbs"
                        value={formData.weight}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Color & Finish</label>
                      <input
                        type="text"
                        name="color"
                        placeholder="e.g. Walnut Wood Finish, Brushed Brass"
                        value={formData.color}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Room Placement</label>
                      <input
                        type="text"
                        name="roomPlacement"
                        placeholder="e.g. Living Room, Home Office, Kitchen"
                        value={formData.roomPlacement}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== BOOKS SECTION ===== */}
              {formData.type === "Books" && (
                <div className="specs-fields-box">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Author</label>
                      <input
                        type="text"
                        name="author"
                        placeholder="e.g. James Clear, Martin Kleppmann"
                        value={formData.author}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Publisher</label>
                      <input
                        type="text"
                        name="publisher"
                        placeholder="e.g. Penguin Books, O'Reilly Media"
                        value={formData.publisher}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Page Count</label>
                      <input
                        type="number"
                        name="pages"
                        placeholder="320"
                        value={formData.pages}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Genre / Topic</label>
                      <input
                        type="text"
                        name="genre"
                        placeholder="e.g. Psychology, Software Engineering, Fiction"
                        value={formData.genre}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Book Format</label>
                      <select name="bookFormat" value={formData.bookFormat} onChange={handleChange}>
                        <option value="Paperback">Paperback</option>
                        <option value="Hardcover">Hardcover</option>
                        <option value="Digital / eBook">Digital / eBook</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Language</label>
                      <input
                        type="text"
                        name="language"
                        placeholder="e.g. English, Spanish, Multilingual"
                        value={formData.language}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== SPORTS SECTION ===== */}
              {formData.type === "Sports" && (
                <div className="specs-fields-box">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Sport / Activity</label>
                      <input
                        type="text"
                        name="sportType"
                        placeholder="e.g. Yoga, Running, Tennis, Gym & Fitness"
                        value={formData.sportType}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Material & Construction</label>
                      <input
                        type="text"
                        name="material"
                        placeholder="e.g. Carbon Fiber, Eco-Friendly TPE, Cast Iron"
                        value={formData.material}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Resistance / Weight</label>
                      <input
                        type="text"
                        name="resistance"
                        placeholder="e.g. 50 lbs Resistance, 10 kg, Adjustable"
                        value={formData.resistance}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Dimensions / Size</label>
                      <input
                        type="text"
                        name="dimensions"
                        placeholder={'e.g. 72" x 24" x 6mm, Standard Pro Size'}
                        value={formData.dimensions}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Color Variant</label>
                      <input
                        type="text"
                        name="color"
                        placeholder="e.g. Forest Green, Stealth Black, Blue"
                        value={formData.color}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== BEAUTY SECTION ===== */}
              {formData.type === "Beauty" && (
                <div className="specs-fields-box">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Suitable Skin / Hair Type</label>
                      <input
                        type="text"
                        name="skinType"
                        placeholder="e.g. All Skin Types, Sensitive, Dry, Oily"
                        value={formData.skinType}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Net Volume / Weight</label>
                      <input
                        type="text"
                        name="volume"
                        placeholder="e.g. 50 ml / 1.7 fl oz"
                        value={formData.volume}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Product Formulation</label>
                      <input
                        type="text"
                        name="formulation"
                        placeholder="e.g. Lightweight Serum, Hydrating Cream, Gel"
                        value={formData.formulation}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Scent / Fragrance</label>
                      <input
                        type="text"
                        name="scent"
                        placeholder="e.g. Fragrance-Free, Fresh Lavender"
                        value={formData.scent}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Key Active Ingredients</label>
                      <input
                        type="text"
                        name="keyIngredients"
                        placeholder="e.g. Pure Hyaluronic Acid, Vitamin C 10%, Niacinamide"
                        value={formData.keyIngredients}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TOYS SECTION ===== */}
              {formData.type === "Toys" && (
                <div className="specs-fields-box">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Recommended Age Group</label>
                      <input
                        type="text"
                        name="recommendedAge"
                        placeholder="e.g. 3-5 Years, 6-8 Years, 8+ Years"
                        value={formData.recommendedAge}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Number of Pieces / Players</label>
                      <input
                        type="text"
                        name="piecesCount"
                        placeholder="e.g. 450 Pieces, 2-4 Players"
                        value={formData.piecesCount}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Material & Safety</label>
                      <input
                        type="text"
                        name="material"
                        placeholder="e.g. Non-Toxic BPA-Free ABS Plastic, Wood"
                        value={formData.material}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== OTHERS SECTION ===== */}
              {formData.type === "Others" && (
                <div className="specs-fields-box">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Primary Material</label>
                      <input
                        type="text"
                        name="material"
                        placeholder="e.g. Anodized Aluminum, Reinforced Polymer"
                        value={formData.material}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Product Dimensions</label>
                      <input
                        type="text"
                        name="dimensions"
                        placeholder={'e.g. 12" x 8" x 4"'}
                        value={formData.dimensions}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-field">
                      <label>Item Weight</label>
                      <input
                        type="text"
                        name="weight"
                        placeholder="e.g. 2.4 lbs"
                        value={formData.weight}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Color Variant</label>
                    <input
                      type="text"
                      name="color"
                      placeholder="e.g. Matte Black, Gunmetal Silver, Natural"
                      value={formData.color}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* Section 3: Highlights & Tags */}
              <div className="form-section-title">
                <i className="bi bi-tags"></i> Feature Highlights & Search Tags
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Highlights (One per line)</label>
                  <textarea
                    name="highlightsText"
                    rows="3"
                    placeholder={CATEGORY_CONFIG[formData.type]?.highlightsPlaceholder || "Key feature 1\nKey feature 2\nKey feature 3"}
                    value={formData.highlightsText}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="form-field">
                  <label>Search & AI Tags (Comma separated)</label>
                  <textarea
                    name="tagsText"
                    rows="3"
                    placeholder={CATEGORY_CONFIG[formData.type]?.tagsPlaceholder || "keywords, tags, search terms"}
                    value={formData.tagsText}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-actions-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  loading={creating}
                  icon={<i className="bi bi-check2"></i>}
                >
                  Publish Product Listing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
      )}
    </div>
  );
};

export default SellerPortal;
