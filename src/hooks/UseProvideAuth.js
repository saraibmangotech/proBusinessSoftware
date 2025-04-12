import { useState } from "react";

function UseProvideAuth() {

  // *For User
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  // *For Login
  const userLogin = (data) => {
    localStorage.setItem('user', JSON.stringify(data))
    

    setUser(data)
  };

  // *For Logout
  const userLogout = async () => {
    setUser(null)
    localStorage.clear()
  };

  return {
    user,
    userLogin,
    userLogout
  };
}

export default UseProvideAuth;