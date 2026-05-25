"use client";

import { Zap, Calendar, MapPin, Phone } from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
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
      icon: <Zap className="w-5 h-5" />,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      id: "2",
      title: "My Bookings",
      description: "1 active, 1 upcoming",
      icon: <Calendar className="w-5 h-5" />,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      id: "3",
      title: "Find on Map",
      description: "Providers near you",
      icon: <MapPin className="w-5 h-5" />,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      id: "4",
      title: "Emergency Help",
      description: "24/7 urgent support",
      icon: <Phone className="w-5 h-5" />,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  const displayActions = actions || defaultActions;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>

      <div className="grid grid-cols-4 gap-5">
        {displayActions.map((action) => (
          <button
            key={action.id}
            className="
              group text-left bg-white
              border border-gray-100
              rounded-2xl p-5
              shadow-sm hover:shadow-md
              transition-all duration-200
              cursor-pointer
            "
          >
            {/* icon box */}
            <div
              className={`
                w-10 h-10 rounded-xl
                flex items-center justify-center
                mb-4
                ${action.bg}
              `}
            >
              <span className={action.color}>{action.icon}</span>
            </div>

            {/* text */}
            <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
