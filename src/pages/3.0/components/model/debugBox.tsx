import { useRef, useEffect, useState } from 'react';
import { useThree, extend } from '@react-three/fiber';
import { Box3, Box3Helper, Color } from 'three';
import { isDev, isTest } from '@/utils/dev';

extend({ Box3Helper }); // 扩展 Box3Helper 到 React Three Fiber

const DebugBoundingBox = ({ targetRef }) => {
  const helperRef = useRef<Box3Helper>();
  const { scene } = useThree();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !targetRef.current || !(isDev || isTest)) return;

    // 计算包围盒
    const box = new Box3().setFromObject(targetRef.current);

    // 创建 Box3Helper
    const helper = new Box3Helper(box, new Color('red')); // 红色线框
    helperRef.current = helper;

    // 调整渲染顺序，确保线框在最前面
    // helper.renderOrder = 1; // 设置一个较大的值

    // 或者禁用深度测试
    (helper.material as any).depthTest = false;

    // 将 helper 添加到场景中
    scene.add(helper);

    // 清理时移除 helper
    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current);
      }
    };
  }, [targetRef, scene, ready]);

  return null; // 不需要返回 JSX，因为 Box3Helper 是 Three.js 对象
};

export default DebugBoundingBox;
