export default function KPICard({ label, value, unit = '', color = 'text-gray-900', bgColor = 'bg-blue-50', icon = null, subtext = null }) {
  return (
    <div className={`${bgColor} p-6 rounded-lg shadow border border-gray-100`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-600 font-medium mb-2">{label}</div>
          <div className={`text-3xl font-bold ${color} flex items-baseline`}>
            {value}
            {unit && <span className="text-lg ml-1 text-gray-500">{unit}</span>}
          </div>
          {subtext && <div className="text-xs text-gray-500 mt-2">{subtext}</div>}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  );
}
