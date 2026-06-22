export default function MonthlyBudget() {
    const total = 100000;
    const paid = 49946;
    const pending = 14803;
    const remaining = 15800;
    const used = 84200;
    const usedPct = (used / total) * 100;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-800">Monthly Budget</h2>
            <p className="text-sm text-gray-400 mb-4">Rs. 1,00,000</p>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                <div
                    className="bg-[#1a2340] h-3 rounded-full"
                    style={{ width: `${usedPct}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>{usedPct.toFixed(1)}% used</span>
                <span>{used.toLocaleString()} / {total.toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0"></span>
                    <span className="text-gray-600">Paid: <span className="font-semibold text-gray-800">Rs. {paid.toLocaleString()}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0"></span>
                    <span className="text-gray-600">Pending: <span className="font-semibold text-gray-800">Rs. {pending.toLocaleString()}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0"></span>
                    <span className="text-gray-600">Remaining: <span className="font-semibold text-gray-800">Rs. {remaining.toLocaleString()}</span></span>
                </div>
            </div>
        </div>
    );
}