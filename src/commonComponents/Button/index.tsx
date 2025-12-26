import { forwardRef, } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonOptions {
  href?: string;
  buttonType?: 'primary' | 'secondary' | 'black';
  variant?: 'outline' | 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type ButtonRef = HTMLButtonElement;

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<ButtonRef>,
  ButtonRef
> &
  ButtonOptions;

const Button = forwardRef<ButtonRef, ButtonProps>((props, ref) => {
  const {
    children,
    type = 'button',
    buttonType = 'primary',
    className = '',
    variant = 'filled',
    size = 'md',
    disabled = false,
    href = '',
    ...rest
  } = props;

  return (
    <button
      ref={ref}
      type={type}
      className={twMerge(
        clsx(
          {
            "cursor-not-allowed btn-text font-Gordita-Medium btn-text ": disabled,
          }),
        className
      )}
      disabled={disabled}
      {...rest}
    >
      {href ? <Link href={href}>{children}</Link> : children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
