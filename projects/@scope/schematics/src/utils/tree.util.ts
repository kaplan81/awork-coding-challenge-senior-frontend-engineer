import { PathFragment } from '@angular-devkit/core';
import { DirEntry, Tree } from '@angular-devkit/schematics';

/**
 * Check if a directory exists in the tree
 * This function uses multiple strategies to detect directories,
 * including empty ones.
 */
export function directoryExists(tree: Tree, dirPath: string): boolean {
  const dir: DirEntry = tree.getDir(dirPath);
  const hasContent: boolean = dir.subdirs.length > 0 || dir.subfiles.length > 0;
  if (hasContent) {
    return true;
  }
  const pathParts: string[] = dirPath.split('/').filter(Boolean);
  if (pathParts.length > 1) {
    const parentPath: string = pathParts.slice(0, -1).join('/');
    const dirName: string = pathParts[pathParts.length - 1];
    const parentDir: DirEntry = tree.getDir(parentPath);
    if (parentDir.subdirs.some((subdir: PathFragment) => subdir === dirName)) {
      return true;
    }
  }

  return false;
}
