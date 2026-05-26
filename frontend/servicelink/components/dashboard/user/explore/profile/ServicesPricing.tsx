"use client";

import { ProviderData } from "./types";

interface ServicesPricingProps {
  provider: ProviderData;
  onBookService?: (serviceName: string) => void;
}

export default function ServicesPricing({
  provider,
  onBookService,
}: ServicesPricingProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="font-bold text-gray-900 text-lg mb-5">
        Services &amp; Pricing
      </h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-sm font-normal text-gray-400 pb-3 w-full">
              Service
            </th>
            <th className="text-left text-sm font-normal text-gray-400 pb-3 pr-8 whitespace-nowrap">
              Duration
            </th>
            <th className="text-left text-sm font-normal text-gray-400 pb-3 pr-8 whitespace-nowrap">
              Price
            </th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {provider.services.map((service) => (
            <tr key={service.name}>
              <td className="py-4 pr-4 text-sm font-semibold text-gray-900">
                {service.name}
              </td>
              <td className="py-4 pr-8 text-sm text-gray-400 whitespace-nowrap">
                {service.duration}
              </td>
              <td className="py-4 pr-8 text-sm font-semibold text-[#1e3a8a] whitespace-nowrap">
                Rs. {service.priceMin.toLocaleString()} –{" "}
                {service.priceMax.toLocaleString()}
              </td>
              <td className="py-4">
                <button
                  onClick={() => onBookService?.(service.name)}
                  className="bg-[#e8683f] hover:bg-[#d75930] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  Book This
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
