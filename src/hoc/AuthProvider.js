import { AuthContext } from "context/CreateContext";
import UseProvideAuth from "hooks/UseProvideAuth";

function AuthProvider({ children }) {

  const auth = UseProvideAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;