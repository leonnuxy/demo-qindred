import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle, XCircle } from 'lucide-react';

export function DeleteMemberDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  memberName,
  processing
}) {
  const handleConfirm = (e) => {
    // Prevent default to avoid form submission or navigation
    e.preventDefault();
    // Call the onConfirm function provided by parent
    onConfirm();
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent 
        onInteractOutside={(e) => processing && e.preventDefault()}
        className="border border-red-200 dark:border-red-800 sm:max-w-[425px]"
        style={{
          backgroundColor: 'white',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: '0.75rem'
        }}
      >
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
          <AlertTriangle className="h-6 w-6" />
          <AlertDialogTitle className="text-xl font-semibold">Are you sure?</AlertDialogTitle>
        </div>
        
        <AlertDialogHeader className="p-0 mb-4">
          <AlertDialogDescription className="mt-3 text-gray-700 dark:text-gray-300 text-base">
            This will permanently remove <span className="font-medium">{memberName}</span> from your family tree.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-4 gap-3 sm:justify-end">
          <AlertDialogCancel 
            onClick={() => {
              onClose();
            }} 
            disabled={processing}
            className="mt-0 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            style={{ minWidth: '100px' }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={processing}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 focus-visible:ring-red-600 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-700 flex items-center justify-center gap-2"
            style={{
              minWidth: '140px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {processing ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Remove Member</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
