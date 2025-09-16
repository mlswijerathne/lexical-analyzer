import { XMarkIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import Button from './Button';

interface AboutUsProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AboutUs({ isVisible, onClose }: AboutUsProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <UserGroupIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">About Us</h3>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="secondary"
              size="sm"
              iconLeft={<XMarkIcon className="h-4 w-4" />}
              aria-label="Close about us"
            />
          </div>
          
          {/* Empty content area */}
          <div className="py-8 text-center">
            <p className="text-gray-400">...</p>
          </div>
        </div>
      </div>
    </div>
  );
}