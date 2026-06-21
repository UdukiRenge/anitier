type ReleaseItem = {
  date: string;
  version: string;
  changes: string[];
};

export const releaseNotes: ReleaseItem[] = [
  {
    date: '2025-06-24',
    version: 'v1.0.0',
    changes: [
      'リリースしました。',
    ],
  },
];