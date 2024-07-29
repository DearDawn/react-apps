import { ETagColor } from 'sweet-me';

export interface ImageCreateInfo {
  src?: string;
  source?: string;
  tag?: string;
}

export interface ImageInfo {
  src?: string;
  uploader?: string;
  source?: string;
  tags?: string[];
  uploadTime?: string;
  http_src?: string;
}

export const PriorityMap: Record<number, { color: ETagColor; text: string }> = {
  0: { color: 'red', text: '紧急' },
  5: { color: 'orange', text: '略急' },
  10: { color: 'yellow', text: '佛系' },
  15: { color: 'green', text: '不急' },
  20: { color: 'gray', text: '待定' },
};

export const LevelMap: Record<number, { color: ETagColor; text: string }> = {
  0: { color: 'red', text: '挺难' },
  5: { color: 'orange', text: '麻烦' },
  10: { color: 'yellow', text: '轻松' },
  15: { color: 'green', text: '不屑' },
  20: { color: 'gray', text: '未知' },
};
