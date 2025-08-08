import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1 style={{ color: "red" }}>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: "#007bff", textDecoration: "none" }}>
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
