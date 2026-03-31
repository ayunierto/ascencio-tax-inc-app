import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Company } from '@ascencio/shared';
import { CompanyForm } from '@/core/accounting/companies/components';
import { theme } from '@/components/ui';

const CreateCompanyScreen = () => {

  const newCompany: Company = {
    id: 'new',
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    email: '',
    phone: '',
    businessNumber: '',
    legalName: '',
    logoUrl: '',
    users: [],
    deletedAt: '',
    payrollAccountNumber: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <CompanyForm company={newCompany} />
    </View>
  );
};

export default CreateCompanyScreen;
