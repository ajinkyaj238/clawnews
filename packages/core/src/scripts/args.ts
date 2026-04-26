export function parseCliArgs(argv: string[]) {
  const args = new Map<string, string | boolean>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token?.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args.set(key, true);
      continue;
    }

    args.set(key, next);
    index += 1;
  }

  return {
    get(name: string, fallback?: string) {
      const value = args.get(name);
      return typeof value === "string" ? value : fallback;
    },
    has(name: string) {
      return args.has(name);
    }
  };
}

export function requireArg(
  args: ReturnType<typeof parseCliArgs>,
  name: string
) {
  const value = args.get(name);

  if (!value) {
    throw new Error(`Missing required --${name} argument`);
  }

  return value;
}
