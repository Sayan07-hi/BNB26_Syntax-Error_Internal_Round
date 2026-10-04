import './Card.css';

const Card = ({ children, className = '', noPadding = false, hover = true, style = {} }) => {
  const hoverClass = hover ? 'card-hover' : '';
  const paddingClass = noPadding ? 'card-no-padding' : '';
  const finalClass = `card ${hoverClass} ${paddingClass} ${className}`.trim();
  
  return (
    <div className={finalClass} style={style}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '', style = {} }) => (
  <div className={`card-header ${className}`.trim()} style={style}>
    <div>
      {title && <h3 className="card-title">{title}</h3>}
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
    {action && <div className="card-action">{action}</div>}
  </div>
);

export const CardContent = ({ children, className = '', style = {} }) => (
  <div className={`card-content ${className}`.trim()} style={style}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', style = {} }) => (
  <div className={`card-footer ${className}`.trim()} style={style}>
    {children}
  </div>
);

export default Card;
