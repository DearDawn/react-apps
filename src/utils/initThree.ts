import * as THREE from 'three';

// 扩展 THREE.Vector3 的类型定义
declare module 'three' {
  interface Vector3 {
    /** 实现二次贝塞尔曲线方法 */
    quadraticBezier(
      p0: THREE.Vector3Like,
      p1: THREE.Vector3Like,
      p2: THREE.Vector3Like,
      t: number
    ): this;
    /** 实现三次贝塞尔曲线方法 */
    cubicBezier(
      p0: THREE.Vector3Like,
      p1: THREE.Vector3Like,
      p2: THREE.Vector3Like,
      p3: THREE.Vector3Like,
      t: number
    ): this;
  }
}

// 实现二次贝塞尔曲线方法
THREE.Vector3.prototype.quadraticBezier = function (
  p0: THREE.Vector3Like,
  p1: THREE.Vector3Like,
  p2: THREE.Vector3Like,
  t: number
): THREE.Vector3 {
  const x = lerp(lerp(p0.x, p1.x, t), lerp(p1.x, p2.x, t), t);
  const y = lerp(lerp(p0.y, p1.y, t), lerp(p1.y, p2.y, t), t);
  const z = lerp(lerp(p0.z, p1.z, t), lerp(p1.z, p2.z, t), t);
  this.set(x, y, z); // 更新当前向量
  return this; // 返回当前向量以便链式调用
};

// 实现三次贝塞尔曲线方法
THREE.Vector3.prototype.cubicBezier = function (
  p0: THREE.Vector3Like,
  p1: THREE.Vector3Like,
  p2: THREE.Vector3Like,
  p3: THREE.Vector3Like,
  t: number
): THREE.Vector3 {
  const x = lerp(
    lerp(lerp(p0.x, p1.x, t), lerp(p1.x, p2.x, t), t),
    lerp(lerp(p1.x, p2.x, t), lerp(p2.x, p3.x, t), t),
    t
  );
  const y = lerp(
    lerp(lerp(p0.y, p1.y, t), lerp(p1.y, p2.y, t), t),
    lerp(lerp(p1.y, p2.y, t), lerp(p2.y, p3.y, t), t),
    t
  );
  const z = lerp(
    lerp(lerp(p0.z, p1.z, t), lerp(p1.z, p2.z, t), t),
    lerp(lerp(p1.z, p2.z, t), lerp(p2.z, p3.z, t), t),
    t
  );
  this.set(x, y, z); // 更新当前向量
  return this; // 返回当前向量以便链式调用
};

// 线性插值函数
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
