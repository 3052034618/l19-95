import { createHashRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import InspectionPage from '@/pages/InspectionPage';
import RiskDisposalPage from '@/pages/RiskDisposalPage';
import HandoverPage from '@/pages/HandoverPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/inspection" replace /> },
      { path: 'inspection', element: <InspectionPage /> },
      { path: 'risk', element: <RiskDisposalPage /> },
      { path: 'handover', element: <HandoverPage /> },
    ],
  },
]);
