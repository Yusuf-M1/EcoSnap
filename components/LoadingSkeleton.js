export default function LoadingSkeleton({ count = 1, height = "h-24" }) {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
                <div key={i} className={`glass p-4 rounded-xl ${height} skeleton-shimmer`}>
                    <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-3 py-1">
                            <div className="h-4 bg-white/20 rounded w-3/4"></div>
                            <div className="h-3 bg-white/10 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
