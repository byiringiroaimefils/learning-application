import { motion } from "framer-motion";
import { AwardIcon, CheckIcon, TriangleRight, CrossIcon } from "lucide-react";
type NotificationType = "message" | "deadline" | "achievement";

interface NotificationCardProps {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  isRead: boolean;
  onDismiss: (id: string) => void;
}

const icons = {
  message: <CheckIcon />,
  deadline: <TriangleRight />,
  achievement: <AwardIcon />,
};

export default function NotificationCard({
  id,
  title,
  message,
  timestamp,
  type,
  isRead,
  onDismiss,
}: NotificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 50 }}
      layout
      className={`p-4 mb-3 relative rounded-xl overflow-hidden border border-gray-900 dark:border-gray-100`}
    >
      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(id)}
        className="absolute top-2 right-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>

      <div className="flex items-start gap-3">
        <div className="mt-1">{icons[type]}</div>
        <div className="flex-1">
          <h3 className={`font-semibold`}>
            {title}
          </h3>
          <p className="text-sm">{message}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs ">{timestamp}</span>
            {!isRead && (
              <span className="text-xs px-2 py-1 rounded-full">
                New
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}