
export const ErrorHandler = (error) => {
  if (error.response) {
    if (error.response.status === 401) {
      localStorage.clear()
      window.location.href = '/'; 
     
    }
    return error.response.data.message;
  } else if (error.request) {
    return error.message;
  } else {
    return 'Something went wrong';
  }
};
