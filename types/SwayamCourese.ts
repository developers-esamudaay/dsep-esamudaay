export type SwayamCourse = {
  id: string;
  title: string;
  url: string;
  explorerSummary: string;
  explorerInstructorName: string;
  enrollment: {
    enrolled: boolean;
  };
  openForRegistration: boolean;
  showInExplorer: boolean;
  startDate: Date;
  endDate: Date;
  examDate: Date;
  enrollmentEndDate: Date;
  estimatedWorkload: string;
  category: [
    {
      name: string;
      category: string | null;
      parentId: string | null;
    },
  ];
  tags: ReadonlyArray<any>;
  featured: ReadonlyArray<any>;
  coursePictureUrl: string;
  credits: number;
  weeks: number;
  instructorInstitute: string;
  ncCode: string;
  semester: string;
};
