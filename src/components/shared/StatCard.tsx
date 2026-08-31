type StatCardProps = {
    title: string;
    value: string | number;
    description?: string;
    className?: string;
}

export const StatCard = ({ title, value, description, className }: StatCardProps) => {
    return (
        <div className={` shadow-md rounded-lg p-4 ${className}`}>
            <h3 className="text-xs font-semibold">{title}</h3>
            <p className="text-xl font-bold">{value}</p>
            {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
    )
}  