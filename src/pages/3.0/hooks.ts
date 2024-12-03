import { useLoader } from '@react-three/fiber';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const useGltfLoader = (inputPath: string) =>
  useLoader(GLTFLoader, inputPath, (loader) => {
    const dracoLoader = new DRACOLoader();
    //解析器路径
    dracoLoader.setDecoderPath('/public/draco/');
    loader.setDRACOLoader(dracoLoader);
  });
