/**
 * Overrides the query and execute to remove anys
 */
declare interface Database {
  query<DataType>(
    data: unknown,
    params: unknown,
  ): Promise<[rows: Array<DataType>, fields: unknown]>;
  execute<DataType>(
    sql: string,
    values:
      | unknown
      | unknown[]
      | {
          [param: string]: unknown;
        },
  ): Promise<[rows: Array<DataType>, fields: unknown]>;
}

export default Database;
