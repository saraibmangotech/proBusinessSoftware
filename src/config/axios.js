import axios from 'axios';


export const baseUrl = process.env.REACT_APP_BASE_URL

const instance = axios.create({
  baseURL: baseUrl ,
  withCredentials:true
});

instance.interceptors.request.use((request) => {


  let user = JSON.parse(localStorage.getItem('user'))
  const sessionID = JSON.parse(localStorage.getItem('sessionId'))
 

  request.headers = {
    'Accept': "application/json, text/plain, */*",
    'Authorization': `Bearer ${user?.token}`,
    'sessionId': sessionID,
    'timezone': new Date().getTimezoneOffset(),
    'route': window.location.pathname
  }
  return request
});

instance.interceptors.response.use((response) => {
  if (response) {
    return response
  }
}, (error) =>
  Promise.reject(
    error
  )
);

export default instance;