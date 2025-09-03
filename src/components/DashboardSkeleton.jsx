import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-3"
          >
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-7 w-20 bg-gray-300 rounded"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Recent Quotations + Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="h-5 w-40 bg-gray-300 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex space-x-2 items-center">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                    <div className="h-4 w-12 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-5 w-24 bg-gray-300 rounded ml-auto"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="h-5 w-40 bg-gray-300 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                    <div className="h-4 w-14 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                  <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                  <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
