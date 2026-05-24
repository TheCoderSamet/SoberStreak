export type SupportResource = {
  name: string;
  phone: string;
  description: string;
  url: string;
};

export const AU_SUPPORT_RESOURCES: SupportResource[] = [
  {
    name: 'Lifeline',
    phone: '13 11 14',
    description: '24/7 crisis support',
    url: 'https://www.lifeline.org.au',
  },
  {
    name: 'Beyond Blue',
    phone: '1300 22 4636',
    description: 'Mental health support',
    url: 'https://www.beyondblue.org.au',
  },
  {
    name: 'Alcohol & Drug Information Service',
    phone: '1800 250 015',
    description: 'Free confidential alcohol and drug support',
    url: 'https://adf.org.au',
  },
  {
    name: 'Quitline',
    phone: '13 78 48',
    description: 'Help quitting smoking',
    url: 'https://www.quit.org.au',
  },
];
