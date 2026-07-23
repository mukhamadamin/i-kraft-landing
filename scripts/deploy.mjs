#!/usr/bin/env node
/**
 * Локальный деплой: собирает проект и публикует dist/ в ветку gh-pages.
 *
 * Дублирует то, что делает .github/workflows/deploy.yml — нужен, пока
 * GitHub Actions недоступны. Работает на любой ОС: всё через git и fs,
 * без shell-специфики.
 *
 *   npm run deploy
 */

import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BRANCH = "gh-pages";
const REMOTE = "origin";

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: "pipe", ...opts }).trim();

const step = (text) => console.log(`\n→ ${text}`);

/* Каталог репозитория, а не текущий — скрипт можно звать откуда угодно */
const repoRoot = run("git", ["rev-parse", "--show-toplevel"]);
const dist = join(repoRoot, "dist");

let worktree = null;

try {
  step("Сборка");
  execFileSync("npm", ["run", "build"], { cwd: repoRoot, stdio: "inherit", shell: process.platform === "win32" });

  if (!readdirSync(dist).length) {
    throw new Error("После сборки dist/ пуст — публиковать нечего");
  }

  step(`Готовим рабочее дерево ветки ${BRANCH}`);
  /* Явный refspec обязателен: если репозиторий клонирован с --single-branch,
     обычный fetch запишет только FETCH_HEAD и ссылки origin/gh-pages не будет. */
  run("git", [
    "fetch",
    REMOTE,
    `+refs/heads/${BRANCH}:refs/remotes/${REMOTE}/${BRANCH}`,
    "--depth=1",
  ], { cwd: repoRoot });

  worktree = mkdtempSync(join(tmpdir(), "gh-pages-"));
  rmSync(worktree, { recursive: true, force: true }); // git worktree add требует отсутствующий путь
  run("git", ["worktree", "add", worktree, `${REMOTE}/${BRANCH}`], { cwd: repoRoot });

  step("Заменяем содержимое ветки сборкой");
  for (const entry of readdirSync(worktree)) {
    if (entry === ".git") continue;
    rmSync(join(worktree, entry), { recursive: true, force: true });
  }
  cpSync(dist, worktree, { recursive: true });

  run("git", ["add", "-A"], { cwd: worktree });

  const changed = run("git", ["status", "--porcelain"], { cwd: worktree });

  /* Через process.exit() выходить нельзя: он обрывает процесс мимо finally,
     и временное рабочее дерево остаётся висеть в списке git worktree. */
  if (!changed) {
    console.log("\nСборка совпадает с опубликованной — публиковать нечего.");
  } else {
    step("Публикуем");
    const sha = run("git", ["rev-parse", "--short", "HEAD"], { cwd: repoRoot });
    run("git", ["commit", "-m", `Deploy ${sha}`], { cwd: worktree });
    run("git", ["push", REMOTE, `HEAD:${BRANCH}`], { cwd: worktree });

    const url = run("git", ["remote", "get-url", REMOTE], { cwd: repoRoot });
    const match = url.match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?$/);
    console.log(
      "\nОпубликовано" +
        (match ? ` → https://${match[1]}.github.io/${match[2]}/` : ""),
    );
  }
} catch (error) {
  const detail = error.stderr?.toString().trim() || error.message;
  console.error(`\nДеплой не удался\n${detail}`);
  process.exitCode = 1;
} finally {
  if (worktree) {
    try {
      run("git", ["worktree", "remove", worktree, "--force"], { cwd: repoRoot });
    } catch {
      /* каталог мог не создаться — чистить нечего */
    }
  }
}
