import Button from "../common/ui/buttons/button";
import "./SellerApprovalPending.css";

const SellerApprovalPending = ({ dashboard, onEditDocs }) => {
  const docs = dashboard?.sellerDocuments || {};
  const submittedDate = docs.submittedAt
    ? new Date(docs.submittedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently Submitted";

  return (
    <div className="seller-pending-page">
      <div className="pending-card">
        {/* Animated Badge Icon */}
        <div className="pending-icon-wrap">
          <div className="pending-ping"></div>
          <i className="bi bi-hourglass-split pending-icon"></i>
        </div>

        {/* Status Tag */}
        <div className="pending-status-tag">
          <i className="bi bi-clock-history"></i> VERIFICATION IN PROGRESS
        </div>

        <h1>Merchant Application Under Review</h1>
        <p className="pending-lead">
          Thank you for submitting your merchant credentials! Your application has been received and is currently undergoing compliance and tax credential auditing by TheStore administration.
        </p>

        {/* Verification Stepper */}
        <div className="pending-stepper">
          <div className="step-item step-completed">
            <div className="step-circle">
              <i className="bi bi-check-lg"></i>
            </div>
            <div className="step-info">
              <span className="step-label">Step 1: Submitted</span>
              <span className="step-sub">Documents Received</span>
            </div>
          </div>

          <div className="stepper-connector active"></div>

          <div className="step-item step-active">
            <div className="step-circle">
              <i className="bi bi-search"></i>
            </div>
            <div className="step-info">
              <span className="step-label">Step 2: Verification</span>
              <span className="step-sub">Tax & ID Audit</span>
            </div>
          </div>

          <div className="stepper-connector"></div>

          <div className="step-item step-waiting">
            <div className="step-circle">
              <i className="bi bi-shield-check"></i>
            </div>
            <div className="step-info">
              <span className="step-label">Step 3: Approval</span>
              <span className="step-sub">Storefront Activated</span>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="pending-info-panel">
          <div className="info-panel-header">
            <h4>
              <i className="bi bi-folder-check"></i> Submitted Business Summary
            </h4>
            <span className="submission-timestamp">
              <i className="bi bi-calendar-event"></i> {submittedDate}
            </span>
          </div>

          <div className="submitted-grid">
            <div className="submitted-item">
              <span className="item-label">Legal Business Name</span>
              <strong className="item-value">
                {docs.businessName || dashboard?.storeName || "Merchant Store"}
              </strong>
            </div>

            <div className="submitted-item">
              <span className="item-label">Entity Classification</span>
              <strong className="item-value">
                {docs.businessType || "Sole Proprietorship"}
              </strong>
            </div>

            <div className="submitted-item">
              <span className="item-label">Tax ID (GSTIN/EIN/VAT)</span>
              <strong className="item-value">
                {docs.taxId ? `${docs.taxId.substring(0, 4)}••••${docs.taxId.slice(-4)}` : "Verified On File"}
              </strong>
            </div>

            <div className="submitted-item">
              <span className="item-label">Primary Category</span>
              <strong className="item-value">
                {docs.storeCategory || "General Catalog"}
              </strong>
            </div>

            <div className="submitted-item">
              <span className="item-label">Authorized ID Number</span>
              <strong className="item-value">
                {docs.idNumber ? `••••${docs.idNumber.slice(-4)}` : "Verified ID"}
              </strong>
            </div>

            <div className="submitted-item">
              <span className="item-label">Settlement Bank</span>
              <strong className="item-value">
                {docs.bankName || "Bank Account Linked"}
              </strong>
            </div>
          </div>
        </div>

        {/* Review Timeline Alert */}
        <div className="pending-timeline-notice">
          <i className="bi bi-info-circle-fill"></i>
          <div>
            <strong>Estimated Review Turnaround: 24 to 48 Hours</strong>
            <p>
              Product listing tools and sales analytics will automatically unlock once approved by platform compliance. You do not need to resubmit unless requested by administration.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pending-actions-row">
          {onEditDocs && (
            <Button
              variant="outline"
              size="md"
              icon={<i className="bi bi-pencil-square"></i>}
              onClick={onEditDocs}
            >
              Update / Revise Submitted Documents
            </Button>
          )}

          <button
            type="button"
            className="refresh-status-btn"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise"></i> Check Approval Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerApprovalPending;
