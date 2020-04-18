import * as pathUtil from "path";

export interface File {
  path: string;
  name: string;
}

export function init(): File {
  return { path: undefined, name: "untitled" };
}

export function setPath(file: File, path: string): File {
  file.path = path;
  file.name = pathUtil.parse(path).base;
  return file;
}
