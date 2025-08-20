import React from 'react';

const DashboardCard = ({ title, description, icon }) => {
  return (
    <div className="group flex flex-col items-center text-center p-6 rounded-xl border border-gray-700
      bg-gray-800 shadow-lg cursor-pointer transition-all duration-300
      hover:bg-gray-700 hover:border-green-400 transform hover:scale-105">

      {/* Icon container */}
      <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>

      {/* Card title */}
      <h3 className="text-xl font-semibold mb-2 text-gray-200 group-hover:text-green-400">
        {title}
      </h3>

      {/* Card description */}
      <p className="text-sm text-gray-400">
        {description}
      </p>
    </div>
  );
};

export default DashboardCard;
