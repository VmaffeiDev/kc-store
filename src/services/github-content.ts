import "server-only";

const API_BASE = "https://api.github.com";
const DEFAULT_REPO = "VmaffeiDev/kc-store";
const DEFAULT_BRANCH = "main";

type GitHubFile = {
  type: "file";
  sha: string;
  content?: string;
  download_url?: string | null;
};

function getRepo() {
  return process.env.GITHUB_CONTENT_REPO || DEFAULT_REPO;
}

function getBranch() {
  return process.env.GITHUB_CONTENT_BRANCH || DEFAULT_BRANCH;
}

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function getHeaders() {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) throw new Error("GitHub storage nao configurado.");
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export function hasGithubContentConfig() {
  return Boolean(process.env.GITHUB_CONTENT_TOKEN);
}

export function rawGithubUrl(path: string) {
  return `https://raw.githubusercontent.com/${getRepo()}/${getBranch()}/${encodePath(path)}`;
}

async function getGithubFile(path: string) {
  const response = await fetch(
    `${API_BASE}/repos/${getRepo()}/contents/${encodePath(path)}?ref=${encodeURIComponent(getBranch())}`,
    { headers: getHeaders(), cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub storage falhou ao ler arquivo (${response.status}).`);
  }
  const file = (await response.json()) as GitHubFile | GitHubFile[];
  if (Array.isArray(file) || file.type !== "file") return null;
  return file;
}

export async function readGithubJsonFile<T>(path: string, fallback: T) {
  if (!hasGithubContentConfig()) return fallback;
  const file = await getGithubFile(path);
  if (!file?.content) return fallback;
  const json = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString(
    "utf8",
  );
  return JSON.parse(json) as T;
}

export async function writeGithubFile(
  path: string,
  content: Buffer | string,
  message: string,
) {
  if (!hasGithubContentConfig()) {
    throw new Error("GitHub storage nao configurado.");
  }
  const current = await getGithubFile(path);
  const payload: Record<string, string> = {
    branch: getBranch(),
    message,
    content: Buffer.isBuffer(content)
      ? content.toString("base64")
      : Buffer.from(content, "utf8").toString("base64"),
  };
  if (current?.sha) payload.sha = current.sha;

  const response = await fetch(
    `${API_BASE}/repos/${getRepo()}/contents/${encodePath(path)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(`GitHub storage falhou ao salvar arquivo (${response.status}).`);
  }
  return rawGithubUrl(path);
}

export async function writeGithubJsonFile<T>(
  path: string,
  data: T,
  message: string,
) {
  return writeGithubFile(path, JSON.stringify(data, null, 2), message);
}
