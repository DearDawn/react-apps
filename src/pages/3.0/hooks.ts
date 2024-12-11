import { useGLTF } from '@react-three/drei';

useGLTF.setDecoderPath(
  'https://dododawn-1300422826.cos.ap-shanghai.myqcloud.com/public/files/draco/'
);

export const useGltfLoader = <T>(inputPath: string) =>
  useGLTF(inputPath, true) as T;
