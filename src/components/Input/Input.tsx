    import classes from './styles.module.scss';
import { FC, InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

const Input: FC<Props> = forwardRef<HTMLInputElement, Props>(
  ({ label, error, rightIcon, onRightIconClick, className, disabled, ...props }, ref) => {
    const inputClasses = [
      classes.input,
      error && classes.error,
      disabled && classes.disabled,
      rightIcon && classes.hasRightIcon,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classes.inputWrapper}>
        {label && <label className={classes.label}>{label}</label>}

        <div className={classes.inputContainer}>
          <input ref={ref} className={inputClasses} disabled={disabled} {...props} />

          {rightIcon && (
            <div className={classes.rightIcon} onClick={onRightIconClick}>
              {rightIcon}
            </div>
          )}
        </div>
        <div className={classes.errorText}>{error || ''}</div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
