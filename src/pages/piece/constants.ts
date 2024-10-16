export interface PieceInfo {
  _id?: string;
  title: string;
  content: string;
  link?: string;
  image?: string;
  tag?: string;
}

export interface FormPieceInfo extends Omit<PieceInfo, 'image' | 'link'> {
  image?: { file?: File; url?: string };
  link?: string[];
}
