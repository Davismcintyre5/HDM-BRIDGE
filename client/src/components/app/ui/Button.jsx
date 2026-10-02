export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  size,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  const variantClass =
    variant === 'secondary' ? 'btn-secondary' :
    variant === 'danger' ? 'btn-danger' :
    'btn-primary';
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}