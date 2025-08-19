import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <Link to="/">Dashboard</Link>
    <Link to="/yield">Yield</Link>
    <Link to="/disease">Disease</Link>
    <Link to="/fertilizer">Fertilizer</Link>
    <Link to="/insights">Insights</Link>
    <Link to="/chatbot">Chatbot</Link>
  </nav>
);

export default Navbar;
