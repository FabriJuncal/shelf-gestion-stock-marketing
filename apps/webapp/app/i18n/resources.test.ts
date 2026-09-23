import { describe, expect, it } from "vitest";

import { resources } from "./resources";

function leafPaths(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "object" && child !== null
      ? leafPaths(child, path)
      : [path];
  });
}

describe("i18n resources", () => {
  it("keeps English and Spanish catalogs structurally aligned", () => {
    expect(leafPaths(resources.es).sort()).toEqual(
      leafPaths(resources.en).sort()
    );
  });
});
