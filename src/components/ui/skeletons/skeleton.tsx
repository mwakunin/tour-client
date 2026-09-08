export const Skeleton = ({ className ="" }: { className?: string }) => {
 return (
 <div className={`animate-pulse rounded bg-surface-container-high ${className}`} aria-label="Loading..." />
 );
};
