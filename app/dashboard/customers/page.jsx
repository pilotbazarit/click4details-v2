'use client';

import React, { Suspense } from 'react';
import CustomersDataTable from '@/components/dashboard/CustomersDataTable';

const CustomersPage = () => {
  return (
    <Suspense fallback={<div>Loading customers...</div>}>
      <CustomersDataTable />
    </Suspense>
  );
};

export default CustomersPage;
