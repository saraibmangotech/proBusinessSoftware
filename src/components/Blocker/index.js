import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useNavigationBlocker = (condition) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (condition) {
      const unblock = navigate.block((tx) => {
        if (condition) {
          // Prompt user or handle condition-specific logic here
          if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
            unblock(); // Allow navigation
            tx.retry(); // Retry navigation
          }
        } else {
          tx.retry(); // Allow navigation if condition is not met
        }
      });

      // Cleanup on unmount
      return () => {
        unblock();
      };
    }
  }, [condition, navigate, location]);
};

export default useNavigationBlocker;
