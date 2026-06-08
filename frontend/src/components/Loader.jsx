import React from 'react';

const Loader = ({ size = 'medium', color = 'primary' }) => {
  return (
    <div className="loader-container">
      <div className={`spinner spinner-${size} spinner-${color}`}></div>
    </div>
  );
};

export default Loader;
