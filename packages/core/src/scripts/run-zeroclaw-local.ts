import { readJsonFile, writeJsonFile } from "../io.js";
import { ZeroClawJobSchema } from "../zeroclaw/contracts.js";
import { LocalZeroClawAdapter } from "../zeroclaw/localAdapter.js";
import { runMockZeroClawJob } from "../zeroclaw/mockRunner.js";
import { parseCliArgs, requireArg } from "./args.js";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const jobPath = requireArg(args, "job");
  const baseDir = args.get("base-dir", process.cwd());
  const resultOutPath = args.get("result-out");
  const job = await readJsonFile(jobPath, ZeroClawJobSchema);
  const result = await runMockZeroClawJob(
    job,
    new LocalZeroClawAdapter(baseDir)
  );

  if (resultOutPath) {
    await writeJsonFile(resultOutPath, result);
  }

  console.log(
    `ZeroClaw mock job ${result.jobId} ${result.status} with ${result.artifacts.length} artifact(s).`
  );

  if (result.status === "failed") {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
