import { useLang } from '../context/LanguageContext';

const STATUS_CLS = {
  pending:          'badge-yellow',
  confirmed:        'badge-blue',
  preparing:        'badge-blue',
  out_for_delivery: 'badge-blue',
  delivered:        'badge-green',
  cancelled:        'badge-red',
};

export default function OrderStatusBadge({ status }) {
  const { t } = useLang();
  const cls = STATUS_CLS[status] || 'badge-yellow';
  const label = t(`status_${status}`) || status?.replace(/_/g, ' ');
  return <span className={cls}>{label}</span>;
}
