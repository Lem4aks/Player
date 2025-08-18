    import classes from './styles.module.scss';
import { FC, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode, ChangeEvent } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  label?: string;
  error?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

const Input: FC<Props> = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
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

    const isTextarea = 'rows' in props;
  const Component = isTextarea ? 'textarea' : 'input';

  return (
    <div className={classes.inputWrapper}>
      {label && <label className={classes.label}>{label}</label>}

      <div className={classes.inputContainer}>
        <Component ref={ref as any} className={inputClasses} disabled={disabled} {...props} />

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
