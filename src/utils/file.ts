export const getFileExt = (file: File) => {
  const [, ext] = file.type.split('/');

  return file.name.split('.').pop() || ext;
};
