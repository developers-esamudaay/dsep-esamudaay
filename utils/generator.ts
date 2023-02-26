import { components } from 'types/schema';
import { SwayamApiResponse } from 'types/SwayamApiResponse';
import { SwayamCourse } from 'types/SwayamCourese';

export const swayamCatalogGenerator = (
  apiData: SwayamApiResponse,
  query: string,
) => {
  const courses: ReadonlyArray<{ node: SwayamCourse }> =
    apiData.data.courseList.edges;
  const providerWise = {};
  let categories: any = new Set();

  courses.forEach((course) => {
    const item = course.node;
    const provider = item.ncCode;
    // creating the provider wise map
    if (providerWise[provider]) {
      providerWise[provider].push(item);
    } else {
      providerWise[provider] = [item];
    }

    // getting categories
    categories.add(
      item.category[0].name
        ? {
            id: item.category[0].name,
            parent_category_id: item.category[0].name,
            descriptor: {
              name: item.category[0].name,
            },
          }
        : {
            id: 'OTHERS',
            parent_category_id: 'OTHERS',
            descriptor: {
              name: 'OTHERS',
            },
          },
    );
  });

  categories = Array.from(categories);

  const catalog = {};
  catalog['descriptor'] = { name: `Catalog for ${query}` };

  // adding providers
  catalog['providers'] = Object.keys(providerWise).map((provider: string) => {
    const providerObj: components['schemas']['Provider'] = {
      id: provider,
      descriptor: {
        name: provider,
      },
      categories: [...new Set(categories)],

      items: providerWise[provider].map((course: SwayamCourse) => {
        const providerItem = {
          id: course.id,
          parent_item_id: course.id,
          descriptor: {
            name: course.title,
            long_desc: course.explorerSummary ? course.explorerSummary : '',
            images: [
              {
                url:
                  encodeURI(course.coursePictureUrl) === ''
                    ? encodeURI(
                        'https://thumbs.dreamstime.com/b/set-colored-pencils-placed-random-order-16759556.jpg',
                      )
                    : encodeURI(course.coursePictureUrl),
              },
            ],
          },
          price: {
            currency: 'INR',
            value: 0 + '', // map it to an actual response
          },
          category_id: course.category[0].name,
          recommended: course.featured ? true : false,
          time: {
            label: 'Course Schedule',
            duration: `P${course.weeks ?? 10}W`, // ISO 8601 duration format
            range: {
              start: course.startDate.toString(),
              end:
                course.endDate.toString() === ''
                  ? course.startDate.toString()
                  : course.endDate.toString(),
            },
          },
          rating: Math.floor(Math.random() * 6).toString(), // map it to an actual response
          tags: [
            {
              name: 'courseInfo',
              list: [
                {
                  name: 'credits',
                  value: course.credits + '',
                },
                {
                  name: 'instructors',
                  value: course.explorerInstructorName,
                },
                {
                  name: 'offeringInstitue',
                  value: course.instructorInstitute,
                },
                {
                  name: 'url',
                  value: encodeURI(course.url),
                },
                {
                  name: 'enrollmentEndDate',
                  value: course.enrollmentEndDate.toString(),
                },
              ],
            },
          ],
          rateable: false,
        };
        return providerItem;
      }),
    };
    return providerObj;
  });

  return catalog;
};

export const generateOrder = (
  action: string,
  message_id: string,
  item: any,
  providerId: string,
  providerDescriptor: any,
  categoryId: string,
) => {
  const order = {
    id: message_id + Date.now(),
    ref_order_ids: [],
    state: action === 'confirm' ? 'COMPLETE' : 'ACTIVE',
    type: 'DRAFT',
    provider: {
      id: providerId,
      descriptor: providerDescriptor,
      category_id: categoryId,
    },
    items: [item],
    fulfillments: {
      id: '',
      type: 'ONLINE',
      tracking: false,
      customer: {},
      agent: {},
      contact: {},
    },
    created_at: new Date(Date.now()),
    updated_at: new Date(Date.now()),
    tags: [
      {
        display: true,
        name: 'order tags',
        list: [
          {
            name: 'tag_name',
            value: 'value of the key in name',
            display: true,
          },
        ],
      },
    ],
  };

  return order;
};

export const selectItemMapper = (item: any) => {
  const selectItemOrder = {
    provider: {
      id: item.ncCode,
      descriptor: {
        name: item.ncCode,
      },
      category_id: item.category[0].name,
    },
    items: [
      {
        id: item.id,
        parent_item_id: item.id,
        descriptor: {
          name: item.title,
          long_desc:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          images: [{ url: encodeURI(item.coursePictureUrl) }],
        },
        price: {
          currency: 'INR',
          value: '0',
        },
        category_id: item.category[0].name,
        recommended: false,
        time: {
          label: 'Course Schedule',
          duration: `P${item.weeks}W`, // ISO 8601 duration format
          range: {
            start: item.startDate.toString(),
            end:
              item.endDate.toString() === ''
                ? item.startDate.toString()
                : item.endDate.toString(),
          },
        },
        rating: Math.floor(Math.random() * 6).toString(),
        tags: [
          {
            name: 'courseDetails',
            list: [
              {
                name: 'credits',
                value: item.credits + '',
              },
              {
                name: 'instructors',
                value: item.explorerInstructorName ?? '',
              },
              {
                name: 'offeringInstitue',
                value: item.instructorInstitute ?? '',
              },
              {
                name: 'url',
                value: item.url ?? '',
              },
              {
                name: 'enrollmentEndDate',
                value: item.enrollmentEndDate.toString(),
              },
            ],
          },
          {
            name: 'eligibility',
            list: [
              {
                name: 'criterion1',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'criterion2',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'criterion3',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'criterion4',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
            ],
          },
          {
            name: 'courseHighlights',
            list: [
              {
                name: 'highlight1',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'highlight2',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'highlight3',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'highlight4',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
            ],
          },
          {
            name: 'prerequisites',
            list: [
              {
                name: 'prerequisite1',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'prerequisite2',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'prerequisite3',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
              {
                name: 'prerequisite4',
                value:
                  'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
              },
            ],
          },
        ],
        rateable: false,
      },
    ],
  };

  return selectItemOrder;
};

export const generateOndcCoursesCatalogue = () => {
  return {
    descriptor: { name: 'Catalog for Ondc' },
    providers: [
      {
        id: 'ONDC',
        descriptor: {
          name: 'ONDC',
        },
        categories: [
          {
            id: 'Multidisciplinary',
            parent_category_id: 'Multidisciplinary',
            descriptor: {
              name: 'Multidisciplinary',
            },
          },
          {
            id: 'ONDC',
            parent_category_id: 'ONDC',
            descriptor: {
              name: 'ONDC',
            },
          },
        ],
        items: [
          {
            id: 'Q291cnNlTGlzdDovbmQyX2NlYzIzX2NzMDg=',
            parent_item_id: 'Q291cnNlTGlzdDovbmQyX2NlYzIzX2NzMDg=',
            descriptor: {
              name: 'Golden rule of successful selling',
              long_desc: '',
              images: [
                {
                  url: 'https://lh3.googleusercontent.com/u/0/drive-viewer/AAOQEORQt2f7_0OyKFUvN3FrZPEmGfjVTHuU4W7UvPTjXaXPzSTQbXxkRFez-ZTEjBSwyHMU1GGPuDHu86K6A5ApjRBv67LF=w1920-h1080-k-pd',
                },
              ],
            },
            price: {
              currency: 'INR',
              value: '0',
            },
            category_id: 'ONDC',
            recommended: false,
            time: {
              label: 'Course Schedule',
              duration: 'P15W',
              range: {
                start: '2023-01-30T18:30:00.000000Z',
                end: '2023-04-29T18:30:00.000000Z',
              },
            },
            rating: '4',
            tags: [
              {
                descriptor: {
                  name: 'courseInfo',
                },
                list: [
                  {
                    descriptor: {
                      name: 'credits',
                    },
                    value: '4',
                  },
                  {
                    descriptor: {
                      name: 'instructors',
                    },
                    value: 'eSamudaay Academy',
                  },
                  {
                    descriptor: {
                      name: 'offeringInstitue',
                    },
                    value: 'eSamudaay',
                  },
                  {
                    descriptor: {
                      name: 'url',
                    },
                    value: 'https://drive.google.com/file/d/1UrJP9q2UOfDyElhpcW2LRmE47LQSp-2h/view',
                  },
                  {
                    decsriptor: {
                      name: 'enrollmentEndDate',
                    },
                    value: '2023-02-28T18:29:00.000000Z',
                  },
                ],
              },
            ],
            rateable: false,
          },
          {
            id: 'Q291cnNlTGlzdDovbmQyX2NlYzIzX2NzMDg=',
            parent_item_id: 'Q291cnNlTGlzdDovbmQyX2NlYzIzX2NzMDg=',
            descriptor: {
              name: 'Store profile',
              long_desc: '',
              images: [
                {
                  url: 'https://i.ytimg.com/vi/i84yqjPBTF4/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgBwgKAAtAFigIMCAAQARhlIGUoZTAP&rs=AOn4CLAYh8OUJTqNl3SNjUVISKkIHoM3JQ',
                },
              ],
            },
            price: {
              currency: 'INR',
              value: '0',
            },
            category_id: 'ONDC',
            recommended: false,
            time: {
              label: 'Course Schedule',
              duration: 'P15W',
              range: {
                start: '2023-01-30T18:30:00.000000Z',
                end: '2023-04-29T18:30:00.000000Z',
              },
            },
            rating: '4',
            tags: [
              {
                descriptor: {
                  name: 'courseInfo',
                },
                list: [
                  {
                    descriptor: {
                      name: 'credits',
                    },
                    value: '4',
                  },
                  {
                    descriptor: {
                      name: 'instructors',
                    },
                    value: 'eSamudaay Academy',
                  },
                  {
                    descriptor: {
                      name: 'offeringInstitue',
                    },
                    value: 'eSamudaay',
                  },
                  {
                    descriptor: {
                      name: 'url',
                    },
                    value: 'https://youtu.be/DdnPvRp2rZE',
                  },
                  {
                    decsriptor: {
                      name: 'enrollmentEndDate',
                    },
                    value: '2023-02-28T18:29:00.000000Z',
                  },
                ],
              },
            ],
            rateable: false,
          },
        ],
      },
    ],
  };
};
