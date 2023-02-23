import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { components } from 'types/schema';
import { SwayamApiResponse } from 'types/SwayamApiResponse';
import { selectItemMapper, swayamCatalogGenerator } from 'utils/generator';

// getting course data
import * as fs from 'fs';
const file = fs.readFileSync('./course.json', 'utf8');
const courseData = JSON.parse(file);

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getCoursesFromSwayam(body: {
    context: components['schemas']['Context'];
    message: { intent: components['schemas']['Intent'] };
  }) {
    const intent: any = body.message.intent;
    console.log('intent: ', intent);

    // destructuring the intent
    const provider = intent?.provider?.descriptor?.name;
    const query = intent?.item?.descriptor?.name;
    const tagGroup = intent?.item?.tags;
    console.log('tag group: ', tagGroup);
    const flattenedTags: any = {};
    if (tagGroup) {
      (tagGroup[0].list as any[])?.forEach((tag) => {
        flattenedTags[tag.name] = tag.value;
      });
    }
    console.log('flattened tags: ', flattenedTags);
    const courseMode = flattenedTags?.course_mode
      ? flattenedTags?.course_mode
      : '';
    const courseDuration = flattenedTags?.course_duration
      ? flattenedTags?.course_duration
      : '';
    const courseCredits = flattenedTags?.course_credits
      ? flattenedTags?.course_credits
      : '';
    const courseCategory = intent?.category?.descriptor?.name;

    const gql = `{
      courseList(
        args: {
          includeClosed: false
          filterText: ${query ? '"' + query + '"' : '""'}
          category: ${courseCategory ? '"' + courseCategory + '"' : '""'}
          status: "Upcoming"
          tags: ""
          duration: ${courseDuration ? '"' + courseDuration + '"' : '"all"'}
          examDate: "all"
          credits: ${courseCredits === 'N'
        ? '"false"'
        : courseCredits === 'Y'
          ? '"true"'
          : '"all"'
      }
          ncCode: ${provider ? '"' + provider + '"' : '"all"'}
          courseType: ${courseMode ? '"' + courseMode + '"' : '"all"'}
        }
        first: 10
      ) {
        edges {
          node {
            id
            title
            url
            explorerSummary
            explorerInstructorName
            enrollment {
              enrolled
            }
            openForRegistration
            showInExplorer
            startDate
            endDate
            examDate
            enrollmentEndDate
            estimatedWorkload
            category {
              name
              category
              parentId
            }
            tags {
              name
            }
            featured
            coursePictureUrl
            credits
            weeks
            nodeCode
            instructorInstitute
            ncCode
            semester
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
      examDates {
        date
      }
    }
    `;
    console.log('gql', gql);
    try {
      const resp = await lastValueFrom(
        this.httpService
          .get('https://swayam.gov.in/modules/gql/query', {
            params: {
              q: gql,
              expanded_gcb_tags: 'gcb-markdown',
            },
          })
          .pipe(map((item) => item.data)),
      );

      const swayamResponse: SwayamApiResponse = JSON.parse(resp.substr(4));
      const catalog = swayamCatalogGenerator(swayamResponse, query);

      const courseData: any = {
        context: body.context,
        message: {
          catalog: catalog,
        },
      };

      return courseData;
    } catch (err) {
      console.log('err: ', err);
      throw new InternalServerErrorException(err);
    }
  }

  async handleSelect(selectDto: any) {
    // fine tune the order here

    // order['id'] = selectDto.context.transaction_id + Date.now();

    const itemId = selectDto.message.order.items[0].id;
    const order: any = selectItemMapper(courseData[itemId]);


    // order?.items.map((item) => {
    //   item['descriptor']['long_desc'] = longDes;
    //   item['tags'] = [...item['tags'],]
    // });

    selectDto.message.order = order;
    selectDto.context.action = 'on_select';
    const resp = selectDto;
    return resp;
  }

  async handleInit(selectDto: any) {
    // fine tune the order here
    const itemId = selectDto.message.order.items[0].id;
    const order: any = selectItemMapper(courseData[itemId]);
    order['fulfillments'] = selectDto.message.order.fulfillments;
    selectDto.message.order = order;
    selectDto.context.action = 'on_init';
    const resp = selectDto;
    return resp;
  }

  async handleConfirm(confirmDto: any) {
    // fine tune the order here
    const itemId = confirmDto.message.order.items[0].id;
    const order: any = selectItemMapper(courseData[itemId]);
    order['fulfillments'] = confirmDto.message.order.fulfillments;
    order['id'] = confirmDto.context.transaction_id + Date.now();
    order['state'] = 'COMPLETE';
    order['type'] = 'DEFAULT';
    order['created_at'] = new Date(Date.now());
    order['updated_at'] = new Date(Date.now());
    confirmDto.message.order = order;
    // storing draft order in database
    const createOrderGQL = `mutation insertDraftOrder($order: dsep_orders_insert_input!) {
  insert_dsep_orders_one (
    object: $order
  ) {
    order_id
  }
}`;

    await lastValueFrom(
      this.httpService
        .post(
          process.env.HASURA_URI,
          {
            query: createOrderGQL,
            variables: {
              order: {
                order_id: confirmDto.message.order.id,
                user_id:
                  confirmDto.message?.order?.fulfillments[0]?.customer?.person
                    ?.name,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                status: confirmDto.message.order.state,
                order_details: confirmDto.message.order,
              },
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': process.env.SECRET,
            },
          },
        )
        .pipe(map((item) => item.data)),
    );

    confirmDto.message.order = order;

    // update order as confirmed in database
    const updateOrderGQL = `mutation updateDSEPOrder($order_id: String, $changes: dsep_orders_set_input) {
      update_dsep_orders (
        where: {order_id: {_eq: $order_id}},
        _set: $changes
      ) {
        affected_rows
        returning {
          order_id
          status
          order_details
        }
      }
    }`;

    try {
      const res = await lastValueFrom(
        this.httpService
          .post(
            process.env.HASURA_URI,
            {
              query: updateOrderGQL,
              variables: {
                order_id: order.id,
                changes: {
                  order_details: order,
                  status: order.state,
                },
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': process.env.SECRET,
              },
            },
          )
          .pipe(map((item) => item.data)),
      );
      console.log('res in test api update: ', res.data);

      confirmDto.message.order = order;
      confirmDto.context.action = 'on_confirm';
      console.log('action: ', confirmDto.context.action);
      return confirmDto;
    } catch (err) {
      console.log('err: ', err);
      throw new InternalServerErrorException(err);
    }
  }
}
