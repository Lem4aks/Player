import React, { FC, InputHTMLAttributes, ReactNode } from "react";
import './styles.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    containerClassName?: string;
}

const Input: FC<Props> = ({
                              label,
                              error,
                              leftIcon,
                              rightIcon,
                              id,
                              className,
                              containerClassName,
                              ...rest
                          }) => {

    const containerClasses = [
        'input-container',
        containerClassName,
    ].filter(Boolean).join(' ');

    const inputWrapperClasses = [
        'input-wrapper',
        leftIcon ? 'has-left-icon' : '',
        rightIcon ? 'has-right-icon' : '',
    ].filter(Boolean).join(' ');

    const inputClasses = [
        'custom-input',
        error ? 'is-error' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}

            <div className={inputWrapperClasses}>
                {leftIcon && <span className="icon left-icon">{leftIcon}</span>}

                <input
                    id={id}
                    className={inputClasses}
                    {...rest}
                />

                {rightIcon && <span className="icon right-icon">{rightIcon}</span>}
            </div>

            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default Input;