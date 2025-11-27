import { writeFile } from "node:fs/promises";
import { getConfig } from "./utils/get-config";

const { outputDir } = await getConfig();

/**
 * Wraps the interfaces provided in `content[]` inside a namespace to avoid conflicts with other global types
 *
 * @example
 *
 * content: [...]
 * nsName -> "Strapi"
 *
 * writeFile "./<config.outputDir>/Strapi.d.ts"
 *
 * declare namespace Strapi {
 *.  // ...content
 * }
 */
export const createNamespace = async (content: string[], nsName: string) => {
  let ns = `declare namespace ${nsName} { ${content.join("\n")} }`;
  await writeFile(`${outputDir}/${nsName}.d.ts`, ns);
};
