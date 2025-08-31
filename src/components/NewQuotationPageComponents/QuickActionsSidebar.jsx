import { Plus, Search } from "lucide-react";

export default function QuickActionsSidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button className="w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
          <button className="w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Search className="w-4 h-4" />
            <span>Browse Templates</span>
          </button>
        </div>
      </div>
    </div>
  );
}