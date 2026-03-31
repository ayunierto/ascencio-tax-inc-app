import React from 'react';
import { useTranslation } from 'react-i18next';

import { Client } from '@ascencio/shared';
import { ClientForm } from '@/core/accounting/clients/components';

const CreateClientScreen = () => {
  const newClient: Client = {
    id: 'new',
    fullName: '',
    email: '',
    phone: '',
    address: undefined,
    city: undefined,
    province: undefined,
    postalCode: undefined,
    country: 'Canada',
    dateOfBirth: undefined,
    sin: undefined,
    businessNumber: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return <ClientForm client={newClient} />;
};

export default CreateClientScreen;
