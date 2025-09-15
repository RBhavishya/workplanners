import React from 'react';
import SmallCard from '../core/StatusCard';
import { EmployeeIcon } from '../icons/EmployeeIcon';
const CustomCenter = ({ cards }) => {
  return (
    <div className="flex items-center mb-1 w-full bg-white p-4 rounded justify-end gap-8">
      <div className="flex gap-4">
        <SmallCard cards={cards || [
          { title: "TODAY", value: 0 },
          { title: "OVERDUE", value: 0 },
          { title: "CLOSED", value: 0 },
        ]} />
        <div className='rounded-md p-1.5 px-3 gap-1 border-none bg-violet-200 flex items-center'>
        <EmployeeIcon />
        <p className='text-xs 3xl:!text-sm font-medium text-violet-700'>Employee</p>
        </div>
      </div>
    </div>
  );
};
export default CustomCenter;