import Icon from './Icon';
import './Timeline.css';

export const Timeline = ({ children, className = '', orientation = 'horizontal' }) => {
  return (
    <div className={`timeline timeline-${orientation} ${className}`.trim()}>
      {children}
    </div>
  );
};

export const TimelineItem = ({ 
  step, 
  title, 
  description, 
  status = 'pending', // 'completed', 'active', 'pending'
  isActive = false, 
  isCompleted = false,
  isLast = false 
}) => {
  const currentStatus = isCompleted || step === '✓' ? 'completed' : isActive ? 'active' : status;
  
  return (
    <div className={`timeline-item status-${currentStatus} ${isLast ? 'timeline-last' : ''}`.trim()}>
      <div className="timeline-marker-wrapper">
        <div className="timeline-marker">
          {currentStatus === 'completed' ? (
            <Icon name="check" size={14} />
          ) : (
            <span>{step}</span>
          )}
        </div>
        {!isLast && <div className="timeline-connector" aria-hidden="true"></div>}
      </div>
      <div className="timeline-content">
        <div className="timeline-title-row">
          <h4>{title}</h4>
        </div>
        {description && <p className="timeline-desc">{description}</p>}
      </div>
    </div>
  );
};
