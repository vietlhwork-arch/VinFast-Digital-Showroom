import React from 'react';
import StaffPortalPage from '@/pages/StaffPortalPage';

interface StaffDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function StaffDrawer({ open, onClose }: StaffDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
      <StaffPortalPage onBackToHome={onClose} />
    </div>
  );
}
