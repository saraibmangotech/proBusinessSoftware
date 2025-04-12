import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Function to show a success toast
const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#4CAF50',
      color: '#fff',
    },
    icon: '✅',
  });
};

// Function to show an error toast
const showErrorToast = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#f44336',
      color: '#fff',
    },
    icon: '❌',
  });
};

// Function to show an info toast
const showInfoToast = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#2196F3',
      color: '#fff',
    },
    icon: 'ℹ️',
  });
};

// Function to show a promise-based toast
const showPromiseToast = (promise, loadingMessage, errorMessage) => {
    toast.promise(
      promise,
      {
        loading: loadingMessage,
        success: (response) => {
            console.log(response);
          // Assuming the success message is part of the response
          return response?.message || 'Operation successful!';
        },
        error: (error) => {
          // Handle error messages from the API
          console.log(error);
          const apiErrorMessage = error || errorMessage;
          return apiErrorMessage;
        },
      },
      {
        position: 'top-center',
        style: {
          background: '#fff',
          color: '#000',
          fontSize:'15px'
        },
        success: {
          duration: 4000,
          icon: '✅',
        },
        error: {
          duration: 4000,
          icon: '❌',
        },
      }
    );
  };

const ToasterComponent = () => {
  return (
    <div>
      <Toaster />
    </div>
  );
};

export { ToasterComponent, showSuccessToast, showErrorToast, showInfoToast, showPromiseToast };
