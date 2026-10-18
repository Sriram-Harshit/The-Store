import Button from "../common/ui/buttons/button";
import "./SellerRejectedView.css";

const SellerRejectedView = ({ dashboard, onResubmitDocs }) => {
  const reason = dashboard?.rejectionReason || "Application did not meet compliance verification standards.";
  const customMessage = dashboard?.rejectionMessage || "";
  const docs = dashboard?.sellerDocuments || {};

  const rejectedDate = dashboard?.rejectedAt
    ? new Date(dashboard.rejectedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Reviewed";

  return (
    <div className="seller-rejected-page">
      <div className="rejected-card">
        {/* Emblem */}
        <div className="rejected-icon-wrap">
          <i className="bi bi-x-octagon-fill rejected-icon"></i>
        </div>

        {/* Status Tag */}
        <div className="rejected-tag">
          <i className="bi bi-shield-x"></i> APPLICATION STATUS: REJECTED
        </div>

        <h1>Merchant Application Declined</h1>
        <p className="rejected-lead">
          TheStore platform compliance committee reviewed your merchant verification documents and has currently declined authorization.
        </p>

        {/* Official Rejection Findings Box */}
        <div className="rejection-findings-box">
          <div className="findings-header">
            <span className="findings-title">
              <i className="bi bi-exclamation-diamond-fill"></i> Primary Verification Finding:
            </span>
            <span className="findings-date">{rejectedDate}</span>
          </div>

          <div className="rejection-reason-pill">
            <i className="bi bi-x-circle-fill"></i> {reason}
          </div>

          {/* Custom Admin Directive Message */}
          {customMessage ? (
            <div className="custom-admin-message-container">
              <div className="custom-msg-header">
                <i className="bi bi-chat-quote-fill"></i>
                <strong>Administrator Corrective Directive & Remarks:</strong>
              </div>
              <div className="custom-msg-body">
                &ldquo;{customMessage}&rdquo;
              </div>
              <span className="custom-msg-footer">
                Please review the directive above and submit updated documents addressing the administrator&apos;s feedback.
              </span>
            </div>
          ) : (
            <div className="default-corrective-hint">
              <i className="bi bi-info-circle"></i>
              <span>
                Please verify that your registered business name, tax identification (GSTIN/EIN), government identity documentation, and banking details are clearly readable and match official registration records.
              </span>
            </div>
          )}
        </div>

        {/* Previous Submission Snapshot */}
        {docs.businessName && (
          <div className="rejected-summary-accordion">
            <h4>Snapshot of Declined Submission</h4>
            <div className="summary-fields-row">
              <div>
                <span>Business Name:</span>
                <strong>{docs.businessName}</strong>
              </div>
              <div>
                <span>Tax ID:</span>
                <strong>{docs.taxId}</strong>
              </div>
              <div>
                <span>ID Serial:</span>
                <strong>{docs.idNumber}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="rejected-actions-row">
          <Button
            variant="primary"
            size="lg"
            icon={<i className="bi bi-arrow-repeat"></i>}
            onClick={onResubmitDocs}
          >
            Update Documents & Re-submit for Approval
          </Button>

          <a
            href="mailto:compliance@thestore.com"
            className="contact-compliance-btn"
          >
            <i className="bi bi-envelope"></i> Contact Compliance Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default SellerRejectedView;
