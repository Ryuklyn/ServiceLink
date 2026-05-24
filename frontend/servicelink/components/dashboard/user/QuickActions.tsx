"use client";

import { Zap, Calendar, MapPin, Phone } from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
    {
      id: "1",
      title: "Book a Service",
      description: "Find trusted providers",
      icon: <Zap className="w-6 h-6" />,
      color: "text-[#1e3a8a]",
    },
    {
      id: "2",
      title: "My Bookings",
      description: "1 active, 1 upcoming",
      icon: <Calendar className="w-6 h-6" />,
      color: "text-[#e8683f]",
    },
    {
      id: "3",
      title: "Find on Map",
      description: "Providers near you",
      icon: <MapPin className="w-6 h-6" />,
      color: "text-[#1e3a8a]",
    },
    {
      id: "4",
      title: "Emergency Help",
      description: "24/7 urgent support",
      icon: <Phone className="w-6 h-6" />,
      color: "text-[#e8683f]",
    },
  ];

  const displayActions = actions || defaultActions;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-6">
        {displayActions.map((action) => (
          <button
            key={action.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center hover:scale-105 cursor-pointer"
          >
            <div className={`${action.color} mb-4 flex justify-center`}>
              {action.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
