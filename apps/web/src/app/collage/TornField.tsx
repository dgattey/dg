import styles from './TornField.module.css';

function classNames(...values: Array<string | undefined>): string {
  return values.filter((value) => value !== undefined && value.length > 0).join(' ');
}

export function TornField({ className }: { className?: string }) {
  return <div aria-hidden="true" className={classNames(styles.field, className)} />;
}
