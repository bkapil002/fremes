// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>; // 👈 prevent redirect until check is done
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;

// import { useAuth } from "./AuthContext";

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         Loading...
//       </div>
//     ); wait until localStorage check finishes
//   }

//   if (!isAuthenticated) {
//      redirect to external site
//     window.location.href = "https://community.samzara.in";
//     return null;
//   }

//   return children;
// };

// export default ProtectedRoute;
