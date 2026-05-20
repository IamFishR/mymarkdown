import { GitHubNode } from '../types';

export interface ParsedGitHubRepo {
  owner: string;
  repo: string;
  branch: string;
}

export function parseGitHubUrl(url: string): ParsedGitHubRepo | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const [owner, rawRepo, type, branch] = parts;
    const repo = rawRepo.replace(/\.git$/, '');

    if (!type || (type !== 'tree' && type !== 'blob')) {
      return { owner, repo, branch: 'HEAD' };
    }

    return { owner, repo, branch: branch || 'HEAD' };
  } catch {
    return null;
  }
}

interface GitHubApiItem {
  path: string;
  type: 'blob' | 'tree';
}

export async function fetchRepoMarkdownTree(
  owner: string,
  repo: string,
  branch: string
): Promise<GitHubNode[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: { Accept: 'application/vnd.github.v3+json' } }
  );

  if (response.status === 404) throw new Error('Repository not found');
  if (response.status === 403) throw new Error('GitHub API rate limit exceeded. Try again later.');
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

  const data = await response.json();
  const items: GitHubApiItem[] = data.tree;

  const mdItems = items.filter((item) => item.type === 'blob' && item.path.endsWith('.md'));

  if (mdItems.length === 0) {
    throw new Error('No markdown files found in this repository');
  }

  const roots: GitHubNode[] = [];
  for (const item of mdItems) {
    const downloadUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
    insertNode(roots, item.path.split('/'), item.path, '', downloadUrl);
  }

  return sortNodes(roots);
}

function insertNode(
  nodes: GitHubNode[],
  parts: string[],
  fullPath: string,
  currentDirPath: string,
  downloadUrl: string
) {
  if (parts.length === 1) {
    nodes.push({ kind: 'file', name: parts[0], path: fullPath, downloadUrl });
    return;
  }

  const dirName = parts[0];
  const dirPath = currentDirPath ? `${currentDirPath}/${dirName}` : dirName;

  let dir = nodes.find(
    (n): n is Extract<GitHubNode, { kind: 'directory' }> =>
      n.kind === 'directory' && n.name === dirName
  );

  if (!dir) {
    dir = { kind: 'directory', name: dirName, path: dirPath, children: [], isOpen: false };
    nodes.push(dir);
  }

  insertNode(dir.children, parts.slice(1), fullPath, dirPath, downloadUrl);
}

function sortNodes(nodes: GitHubNode[]): GitHubNode[] {
  return nodes
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((n) => (n.kind === 'directory' ? { ...n, children: sortNodes(n.children) } : n));
}

export function toggleGitHubNodeOpen(tree: GitHubNode[], targetPath: string): GitHubNode[] {
  return tree.map((node) => {
    if (node.kind === 'directory') {
      if (node.path === targetPath) return { ...node, isOpen: !node.isOpen };
      return { ...node, children: toggleGitHubNodeOpen(node.children, targetPath) };
    }
    return node;
  });
}
