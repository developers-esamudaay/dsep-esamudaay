import { SwayamCourse } from './SwayamCourese';

export type SwayamApiResponse = {
  data: {
    courseList: {
      edges: ReadonlyArray<{ node: SwayamCourse }>;
      pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
      };
    };
    examDates: ReadonlyArray<{ date: Date }>;
  };
  errors: ReadonlyArray<any>;
};
