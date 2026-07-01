const STATUS = {
  pending:          { label: 'Pending',          cls: 'badge-yellow' },
  confirmed:        { label: 'Confirmed',        cls: 'badge-blue' },
  preparing:        { label: 'Preparing',        cls: 'badge-blue' },
  out_for_delivery: { label: 'Out for Delivery', cls: 'badge-blue' },
  delivered:        { label: 'Delivered',        cls: 'badge-green' },
  cancelled:        { label: 'Cancelled',        cls: 'badge-red' },
};

export default function OrderStatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: 'badge-yellow' };
  return <span className={s.cls}>{s.label}</span>;
}
