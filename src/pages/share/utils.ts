export const getBlob = (imgPath: string): Promise<Blob> => {

  return new Promise((resolve, reject) => {
    const image = new Image();
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');

    image.onload = function () {
      c.width = image.naturalWidth;
      c.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0);
      c.toBlob(resolve, 'image/png');
    };

    image.onerror = reject;
    image.src = imgPath;
  });
};