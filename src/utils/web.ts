export function changeMetaTag(name, content, key = 'property') {
  let metaTag = document.querySelector(`meta[${key}="${name}"]`);

  if (metaTag) {
    metaTag.setAttribute('content', content);
  } else {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(key, name);
    metaTag.setAttribute('content', content);
    document.head.appendChild(metaTag);
  }
}

export function getFaviconUrl() {
  const faviconElement =
    document.querySelector('link[rel="shortcut icon"]') ||
    document.querySelector('link[rel="icon shortcut"]') ||
    document.querySelector('link[rel="icon"]') ||
    document.querySelector('link[href*="favicon.ico"]');

  if (faviconElement) {
    const faviconHref = faviconElement.getAttribute('href');
    if (faviconHref) {
      const faviconUrl = new URL(faviconHref, document.location.href);
      return faviconUrl.href;
    }
  }

  return 'https://www.dododawn.com/siteinfo/favicon.ico';
}

export const changeShareInfo = ({
  title = document.title,
  description = document.title,
  url = location.href,
  image = getFaviconUrl(),
}) => {
  changeMetaTag('og:description', title);
  changeMetaTag('og:image', image);
  changeMetaTag('og:url', url);
  changeMetaTag('description', description, 'name');
};
