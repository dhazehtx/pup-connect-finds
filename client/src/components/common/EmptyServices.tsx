import { Search } from 'lucide-react';

const EmptyServices = () => {
  return (
    <div className="col-span-full text-center py-16">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E5EEFF' }}>
        <Search className="w-10 h-10" style={{ color: '#2363FF' }} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
      <p className="text-gray-600 mb-8">Be the first to list a service!</p>
    </div>
  );
};

export default EmptyServices;