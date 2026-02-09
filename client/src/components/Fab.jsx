import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Fab = () => {
  const location = useLocation();

  // Hide FAB on entry page
  if (location.pathname === '/entry') return null;

  return (
    <Link to="/entry" className="fab">
      <Plus size={22} color="white" strokeWidth={2.5} />
      <span className="fab-label">Log Walk</span>
    </Link>
  );
};

export default Fab;
