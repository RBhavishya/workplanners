import React from 'react';
import SmallCard from '../core/StatusCard';

const CustomCenter = ({ cards }) => {
  return (
    <div className="flex items-center mb-1 w-full bg-white p-4 rounded justify-end gap-8">
      <div className="flex gap-4">
        <SmallCard cards={cards || [
          { title: "TODAY", value: 0 },
          { title: "OVERDUE", value: 0 },
          { title: "CLOSED", value: 0 },
        ]} />
      </div>
    </div>
  );
};

export default CustomCenter;