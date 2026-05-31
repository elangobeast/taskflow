import React from 'react';

const Spinner = ({ fullPage = false, size = 'md' }) => {
  const sizeMap = { sm: '20px', md: '32px', lg: '48px' };
  return (
    <div className={`spinner-wrapper ${fullPage ? 'full-page' : ''}`}>
      <div className="spinner" style={{ width: sizeMap[size], height: sizeMap[size] }} />
    </div>
  );
};

export default Spinner;
