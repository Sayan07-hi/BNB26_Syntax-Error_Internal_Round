import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  type = 'button',
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full' : '';
  const loadingClass = loading ? 'btn-loading' : '';
  const finalClass = [baseClass, variantClass, sizeClass, widthClass, loadingClass, className].filter(Boolean).join(' ');

  return (
    <button 
      type={type} 
      className={finalClass} 
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true"></span>
      ) : icon ? (
        <span className="btn-icon-slot">{icon}</span>
      ) : null}
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default Button;
