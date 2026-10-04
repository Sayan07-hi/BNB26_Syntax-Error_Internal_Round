import './Badge.css';

const Badge = ({ children, variant = 'primary', dot = false, size = 'md', className = '', style = {} }) => {
  const sizeClass = size === 'sm' ? 'badge-sm' : '';
  const dotClass = dot ? 'badge-with-dot' : '';
  const finalClass = `badge badge-${variant} ${sizeClass} ${dotClass} ${className}`.trim();

  return (
    <span className={finalClass} style={style}>
      {dot && <span className="badge-dot" aria-hidden="true"></span>}
      <span className="badge-label">{children}</span>
    </span>
  );
};

export default Badge;
