import "./buttons.css";

const Button = ({
  children,
  variant = "primary", // primary | secondary | danger | outline | text
  size = "md", // sm | md | lg
  loading = false,
  disabled = false,
  icon = null,
  onClick,
  type = "button",
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="btn-spinner"></span>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
