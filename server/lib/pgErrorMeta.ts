/** Postgres / driver error fields (e.g. 42P01 undefined_table, 42703 undefined_column). */
export type PostgresErrorMeta = {
  code?: string;
  message?: string;
  detail?: string;
  hint?: string;
  table?: string;
  column?: string;
  constraint?: string;
  schema?: string;
  severity?: string;
  where?: string;
};

function readPgFields(obj: Record<string, unknown>): PostgresErrorMeta {
  const str = (k: string) => (typeof obj[k] === 'string' ? (obj[k] as string) : undefined);
  return {
    code: str('code'),
    message: str('message'),
    detail: str('detail'),
    hint: str('hint'),
    table: str('table'),
    column: str('column'),
    constraint: str('constraint'),
    schema: str('schema'),
    severity: str('severity'),
    where: str('where'),
  };
}

function mergePg(a: PostgresErrorMeta, b: PostgresErrorMeta): PostgresErrorMeta {
  return {
    code: a.code ?? b.code,
    message: a.message ?? b.message,
    detail: a.detail ?? b.detail,
    hint: a.hint ?? b.hint,
    table: a.table ?? b.table,
    column: a.column ?? b.column,
    constraint: a.constraint ?? b.constraint,
    schema: a.schema ?? b.schema,
    severity: a.severity ?? b.severity,
    where: a.where ?? b.where,
  };
}

/** Walk err and err.cause for Postgres driver fields. */
export function postgresErrorMeta(err: unknown): PostgresErrorMeta {
  if (!err || typeof err !== 'object') {
    return err instanceof Error ? { message: err.message } : {};
  }

  let meta = readPgFields(err as Record<string, unknown>);
  const cause = (err as { cause?: unknown }).cause;
  if (cause && typeof cause === 'object') {
    meta = mergePg(meta, readPgFields(cause as Record<string, unknown>));
  }
  if (!meta.message && err instanceof Error) {
    meta.message = err.message;
  }
  return meta;
}
