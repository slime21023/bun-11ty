#!/usr/bin/env bun
import { argv } from "bun";
import prompts from "prompts";
import { blue, red, green } from "kolorist";
import path from "path";
import { existsSync } from "fs";
import { mkdir, cp } from "fs/promises";


const TEMPLATES = [
  {
    name: "basic",
    display: "Basic",
    description: "Basic 11ty setup with minimal configuration",
  },
  {
    name: "blog",
    display: "Blog",
    description: "Blog setup with posts and tags support",
  },
];

async function init() {
  let targetDir = argv[2] || "";

  // 如果沒有提供專案名稱，詢問使用者
  if (!targetDir) {
    const res = await prompts({
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "my-11ty-site",
    });
    targetDir = res.projectName;
  }

  const root = path.join(process.cwd(), targetDir);

  // 檢查目錄是否存在
  if (existsSync(root)) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `Directory ${targetDir} already exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite) {
      console.log(red("✖") + " Operation cancelled");
      process.exit(1);
    }
  }

  // 選擇模板
  const { template } = await prompts({
    type: "select",
    name: "template",
    message: "Select a template:",
    choices: TEMPLATES.map((t) => ({
      title: t.display,
      value: t.name,
      description: t.description,
    })),
  });

  // 建立專案目錄
  await mkdir(root, { recursive: true });

  // 複製模板檔案
  const templateDir = path.join(import.meta.dir, "../template", template);
  await cp(templateDir, root, { recursive: true });

  // 修改 package.json
  const pkgFile = Bun.file(path.join(root, "package.json"));
  const pkg = JSON.parse(await pkgFile.text());
  pkg.name = targetDir;
  await Bun.write(path.join(root, "package.json"), JSON.stringify(pkg, null, 2));

  console.log(green("\n✔ Project created successfully!"));
  console.log("\nNext steps:");
  console.log(blue(`  cd ${targetDir}`));
  console.log(blue("  bun install"));
  console.log(blue("  bun run dev\n"));
}

init().catch((e) => {
  console.error(red("Error: ") + e.message);
  process.exit(1);
});
