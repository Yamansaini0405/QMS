import { Plus, Search } from "lucide-react";
import {Link} from "react-router-dom"

export default function QuickActionsSidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Link to="/products/create">
          <button className="mt-2 w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          </Link>
          <Link to="/customers/create">
          <button className="mt-2 w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
          </Link>
          <Link to="/leads/create">
          <button className="mt-2 w-full flex items-center justify-start space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
}