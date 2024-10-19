
type Order = 'asc' | 'desc'
/**
 *
 * @description Configures the cursor for pagination
 */
export function configCursor(limit: number, cursor: number, order: Order = 'desc'): object {
  return (
    {
      orderBy: { id: order }, // change this to createdAt if you want to order by createdAt
      // orderBy: { createdAt: order },
      take: cursor > 0 ? limit + 1 : limit, // only adds 1 when limit is greater than 0
      cursor: cursor > 0 ? { id: cursor } : undefined, // makes pagination
    }
  );
}
