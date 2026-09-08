import pg from 'pg';
import { env } from '../config/env.js';

// The single pg connection pool. Infrastructure, not a layer.
// ONLY repository modules (Layer 3) are allowed to import this.
export const pool = new pg.Pool({ connectionString: env.databaseUrl });

// Thin helper so repositories can stay one-liners.
export const query = async <Row extends pg.QueryResultRow>(
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<pg.QueryResult<Row>> => pool.query<Row>(text, params as unknown[]);
