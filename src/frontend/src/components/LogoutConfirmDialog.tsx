import { LogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface LogoutConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: LogoutConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="bg-white rounded-2xl shadow-2xl px-8 py-7 w-[90%] max-w-sm mx-4 flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
              <LogOut className="w-7 h-7 text-orange-500" />
            </div>

            {/* Text */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Logout?</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to logout?
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                data-ocid="logout.cancel_button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                No, Cancel
              </button>
              <button
                type="button"
                data-ocid="logout.confirm_button"
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors shadow-md shadow-orange-200"
              >
                Yes, Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
