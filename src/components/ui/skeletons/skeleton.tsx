export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`bg-surface-container-high animate-pulse rounded ${className}`}
      aria-label="Loading..."
    />
  );
};
