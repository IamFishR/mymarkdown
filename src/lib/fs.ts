import { FolderNode } from '../types';

export async function buildFolderTree(
  dirHandle: FileSystemDirectoryHandle,
  parentPath?: string
): Promise<FolderNode[]> {
  const nodes: FolderNode[] = [];

  const entries = (dirHandle as unknown as { entries(): AsyncIterableIterator<[string, FileSystemHandle]> }).entries();
  for await (const [name, handle] of entries) {
    if (name.startsWith('.')) continue;

    const path = parentPath ? `${parentPath}/${name}` : name;

    if (handle.kind === 'directory') {
      const children = await buildFolderTree(handle as FileSystemDirectoryHandle, path);
      if (children.length > 0) {
        nodes.push({ kind: 'directory', name, path, children, isOpen: false });
      }
    } else if (handle.kind === 'file' && name.endsWith('.md')) {
      nodes.push({ kind: 'file', name, path, handle: handle as FileSystemFileHandle });
    }
  }

  return nodes.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function readFile(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return file.text();
}

export async function writeFile(handle: FileSystemFileHandle, content: string): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function requestPermission(
  handle: FileSystemDirectoryHandle | FileSystemFileHandle
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (handle as any).requestPermission({ mode: 'readwrite' });
  return result === 'granted';
}

export function toggleNodeOpen(tree: FolderNode[], targetPath: string): FolderNode[] {
  return tree.map(node => {
    if (node.kind === 'directory') {
      if (node.path === targetPath) {
        return { ...node, isOpen: !node.isOpen };
      }
      return { ...node, children: toggleNodeOpen(node.children, targetPath) };
    }
    return node;
  });
}
