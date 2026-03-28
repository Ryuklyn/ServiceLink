import StarRating from "./StarRating";

export default function ServiceCard({ service }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
      {/* Top Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img 
          src={service.img} 
          alt={service.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
          {service.category}
        </div>
        {service.featured && (
          <div className="absolute top-3 right-3 bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Featured
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-lg mb-2">{service.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {service.description}
        </p>

        {/* Rating and Price Box */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <StarRating rating={service.rating} />
            <span className="text-xs font-semibold text-gray-700">{service.rating}</span>
            <span className="text-xs text-gray-400">({service.reviews})</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900 text-lg leading-none">NPR {service.price}</div>
            <div className="text-xs text-gray-500 font-medium">per hour</div>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-[#1e293b] hover:bg-[#1e40af] text-white font-medium py-3 rounded-xl transition-colors">
          Book Now
        </button>
      </div>
    </div>
  );
}
