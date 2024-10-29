type Order = 'asc' | 'desc'


/**
 *
 * @description Configures the cursor for pagination
 */
export function configCursorBasedPagination(limit: number, cursor: number, order: Order = 'desc'): object {
  return (
    {
      orderBy: { id: order }, // change this to createdAt if you want to order by createdAt
      take: limit, // only adds 1 when limit is greater than 0
      cursor: cursor <= 0 ? undefined : { id: cursor }, // makes pagination
      skip: cursor <= 0 ? undefined : 1,
    }
  );
}
