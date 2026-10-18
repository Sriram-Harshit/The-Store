import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import config from "../../config/config";
import Button from "../common/ui/buttons/button";
import "./SellerDocumentSubmission.css";

const SellerDocumentSubmission = ({ initialDocs, onSubmitted, onCancel }) => {
  const reduxToken = useSelector((state) => state.auth?.token);
  const token = reduxToken || localStorage.getItem("token");

  const [formData, setFormData] = useState({
    businessName: initialDocs?.businessName || "",
    businessType: initialDocs?.businessType || "Sole Proprietorship",
    storeCategory: initialDocs?.storeCategory || "Electronics & Gadgets",
    taxId: initialDocs?.taxId || "",
    idType: initialDocs?.idType || "Government National ID",
    idNumber: initialDocs?.idNumber || "",
    documentUrl: initialDocs?.documentUrl || "",
    bankName: initialDocs?.bankName || "",
    accountHolderName: initialDocs?.accountHolderName || "",
    accountNumber: initialDocs?.accountNumber || "",
    ifscOrRouting: initialDocs?.ifscOrRouting || "",
    businessAddress: initialDocs?.businessAddress || "",
    storeDescription: initialDocs?.storeDescription || "",
    declarationAgreed: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFillDemoDocs = () => {
    setFormData({
      businessName: "Aura Prime Merchants Ltd.",
      businessType: "Private Limited / LLC",
      storeCategory: "Electronics & Smart Devices",
      taxId: "GSTIN-27AAACG0123M1Z8",
      idType: "Passport / National Passport",
      idNumber: "P-88492019-X",
      documentUrl: "https://thestore-assets.s3.amazonaws.com/verifications/tax_cert_demo.pdf",
      bankName: "JPMorgan Chase Commercial",
      accountHolderName: "Aura Prime Merchants Ltd.",
      accountNumber: "987654321098",
      ifscOrRouting: "CHASUS33XXX",
      businessAddress: "450 Enterprise Parkway, Suite 800, San Francisco, CA 94105",
      storeDescription: "Authorized retailer specializing in authentic audio gear, accessories, and certified electronics.",
      declarationAgreed: true,
    });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.businessName.trim()) {
      setErrorMsg("Please provide your Registered Business Legal Name.");
      return;
    }
    if (!formData.taxId.trim()) {
      setErrorMsg("Please provide your Tax Identification Number (GSTIN/EIN/VAT/PAN).");
      return;
    }
    if (!formData.idNumber.trim()) {
      setErrorMsg("Please provide your Government ID / Passport Number.");
      return;
    }
    if (!formData.declarationAgreed) {
      setErrorMsg("You must confirm the legal accuracy declaration before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${config.apiUrl}/seller/documents`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onSubmitted) {
        onSubmitted(res.data.seller);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit verification documents. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="seller-docs-page">
      <div className="seller-docs-container">
        {/* Header */}
        <div className="docs-header">
          <div className="docs-header-badge">
            <i className="bi bi-shield-check"></i> OFFICIAL MERCHANT ONBOARDING
          </div>
          <h1>Submit Seller Verification Documents</h1>
          <p>
            To activate your storefront, list products, and receive settlements on TheStore, please provide your verified business registration, tax credentials, and banking details.
          </p>

          <button
            type="button"
            className="demo-docs-autofill-btn"
            onClick={handleFillDemoDocs}
            title="Auto-fill with sample verified business credentials"
          >
            <i className="bi bi-lightning-charge-fill"></i> Auto-Fill Sample Verified Documents
          </button>
        </div>

        {errorMsg && (
          <div className="docs-error-callout">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="docs-form" onSubmit={handleSubmit}>
          {/* SECTION 1: BUSINESS & ENTITY */}
          <div className="docs-form-section">
            <div className="section-title-row">
              <span className="step-num">1</span>
              <div>
                <h3>Business Registration & Entity</h3>
                <p>Official legal details as registered with local commercial authorities</p>
              </div>
            </div>

            <div className="docs-grid-2">
              <div className="docs-field">
                <label>
                  Legal Business / Company Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  placeholder="e.g. Apex Global Retailers LLC"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="docs-field">
                <label>Legal Entity Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                >
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Private Limited / LLC">Private Limited / LLC</option>
                  <option value="Partnership Firm">Partnership Firm</option>
                  <option value="Public Corporation">Public Corporation</option>
                  <option value="Individual / Sole Merchant">Individual / Sole Merchant</option>
                </select>
              </div>
            </div>

            <div className="docs-grid-2">
              <div className="docs-field">
                <label>Primary Store Category</label>
                <select
                  name="storeCategory"
                  value={formData.storeCategory}
                  onChange={handleChange}
                >
                  <option value="Electronics & Smart Devices">Electronics & Smart Devices</option>
                  <option value="Fashion, Apparel & Footwear">Fashion, Apparel & Footwear</option>
                  <option value="Home, Kitchen & Living">Home, Kitchen & Living</option>
                  <option value="Books, Media & Stationery">Books, Media & Stationery</option>
                  <option value="Sports, Fitness & Outdoor">Sports, Fitness & Outdoor</option>
                  <option value="Beauty, Skincare & Personal Care">Beauty, Skincare & Personal Care</option>
                  <option value="Toys, Gaming & Collectibles">Toys, Gaming & Collectibles</option>
                  <option value="General Multi-Category Retail">General Multi-Category Retail</option>
                </select>
              </div>

              <div className="docs-field">
                <label>Registered Business Address</label>
                <input
                  type="text"
                  name="businessAddress"
                  placeholder="Street, City, State, Postal Code"
                  value={formData.businessAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: TAX & REGULATORY CREDENTIALS */}
          <div className="docs-form-section">
            <div className="section-title-row">
              <span className="step-num">2</span>
              <div>
                <h3>Tax & Commercial Identifiers</h3>
                <p>Tax clearance credentials for invoice generation and regulatory compliance</p>
              </div>
            </div>

            <div className="docs-grid-2">
              <div className="docs-field">
                <label>
                  Tax Identification Number (GSTIN / EIN / VAT / PAN) <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="taxId"
                  placeholder="e.g. GSTIN-27AAACG0123M1Z8 or 12-3456789"
                  value={formData.taxId}
                  onChange={handleChange}
                  required
                />
                <span className="field-hint">Used for official customer tax receipts and automated GST reporting.</span>
              </div>

              <div className="docs-field">
                <label>Tax Certificate / Registration URL or File Reference</label>
                <input
                  type="text"
                  name="documentUrl"
                  placeholder="e.g. https://domain.com/docs/tax_registration.pdf"
                  value={formData.documentUrl}
                  onChange={handleChange}
                />
                <span className="field-hint">Upload or provide a secure link to your certificate of incorporation.</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: IDENTITY PROOF */}
          <div className="docs-form-section">
            <div className="section-title-row">
              <span className="step-num">3</span>
              <div>
                <h3>Proof of Identity (Authorized Officer)</h3>
                <p>Government identification of the primary merchant representative</p>
              </div>
            </div>

            <div className="docs-grid-2">
              <div className="docs-field">
                <label>Government Identification Type</label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                >
                  <option value="Government National ID">Government National ID</option>
                  <option value="Passport / National Passport">Passport / National Passport</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="State Resident Identity Card">State Resident Identity Card</option>
                </select>
              </div>

              <div className="docs-field">
                <label>
                  ID / Passport Serial Number <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="idNumber"
                  placeholder="e.g. NID-908234-A or Passport Serial"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: SETTLEMENT & BANKING */}
          <div className="docs-form-section">
            <div className="section-title-row">
              <span className="step-num">4</span>
              <div>
                <h3>Payout Settlement & Bank Details</h3>
                <p>Bank account where sales revenues and order payments will be settled</p>
              </div>
            </div>

            <div className="docs-grid-2">
              <div className="docs-field">
                <label>Financial Institution / Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="e.g. JPMorgan Chase / Wells Fargo / HDFC"
                  value={formData.bankName}
                  onChange={handleChange}
                />
              </div>

              <div className="docs-field">
                <label>Beneficiary Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolderName"
                  placeholder="Name matching official bank account"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="docs-grid-2">
              <div className="docs-field">
                <label>Account Number / IBAN</label>
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="e.g. 987654321098"
                  value={formData.accountNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="docs-field">
                <label>Routing Transit Number / IFSC / SWIFT</label>
                <input
                  type="text"
                  name="ifscOrRouting"
                  placeholder="e.g. 021000021 or HDFC0001234"
                  value={formData.ifscOrRouting}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: STORE PROFILE */}
          <div className="docs-form-section">
            <div className="section-title-row">
              <span className="step-num">5</span>
              <div>
                <h3>Store Profile & Merchant Statement</h3>
                <p>Public-facing credentials displayed on your authorized store badge</p>
              </div>
            </div>

            <div className="docs-field">
              <label>Merchant Bio & Store Description</label>
              <textarea
                name="storeDescription"
                rows="3"
                placeholder="Briefly describe your products, brand mission, and fulfillment guarantees..."
                value={formData.storeDescription}
                onChange={handleChange}
              />
            </div>

            <div className="declaration-checkbox-box">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="declarationAgreed"
                  checked={formData.declarationAgreed}
                  onChange={handleChange}
                  required
                />
                <span className="checkbox-text">
                  I solemnly declare that the registered business name, tax identification (GSTIN/EIN), government identification credentials, and banking details provided above are true, active, and legally accurate. I understand that administrative approval is required prior to catalog listing.
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="docs-actions-bar">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onCancel}
              >
                Back to Dashboard
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              icon={<i className="bi bi-send-check-fill"></i>}
            >
              Submit Documents for Administrative Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerDocumentSubmission;
