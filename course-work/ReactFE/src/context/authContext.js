import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.userid;
  
    return {
      fName: localStorage.getItem("fName"),
      roleId: localStorage.getItem("userRoleId"),
      userId: userId, 
      token
    };
  });
  

  const login = (data) => {
    
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("fName", data.fName);
    localStorage.setItem("userRoleId", data.userRoleId);
    localStorage.setItem("userId", data.userID); 

    setUser({
      fName: data.fName,
      roleId: data.userRoleId,
      userId: data.userId,
      token: data.accessToken
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
