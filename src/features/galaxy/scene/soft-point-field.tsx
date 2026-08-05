import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { AdditiveBlending, Color } from 'three'

export interface SoftPointData {
  positions: Float32Array
  sizes: Float32Array
  brightness: Float32Array
  colors?: Float32Array
}

interface SoftPointFieldProps {
  color: string
  data: SoftPointData
  maxPointSize?: number
  opacity: number
}

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aBrightness;
  attribute vec3 aColor;

  uniform float uPixelRatio;
  uniform float uMaxPointSize;

  varying float vBrightness;
  varying vec3 vColor;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float perspective = 220.0 / max(1.0, -viewPosition.z);
    gl_PointSize = clamp(aSize * uPixelRatio * perspective, 1.0, uMaxPointSize);
    gl_Position = projectionMatrix * viewPosition;
    vBrightness = aBrightness;
    vColor = aColor;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vBrightness;
  varying vec3 vColor;

  void main() {
    vec2 point = gl_PointCoord * 2.0 - 1.0;
    float radius = dot(point, point);
    if (radius > 1.0) discard;

    float softDisc = 1.0 - smoothstep(0.16, 1.0, radius);
    float stellarCore = exp(-4.2 * radius);
    float alpha = (softDisc * 0.46 + stellarCore * 0.72) * uOpacity * vBrightness;
    gl_FragColor = vec4(uColor * vColor * (0.72 + vBrightness * 0.38), alpha);
  }
`

export function SoftPointField({
  color,
  data,
  maxPointSize = 7,
  opacity,
}: SoftPointFieldProps) {
  const pixelRatio = useThree((state) => state.gl.getPixelRatio())
  const colors = useMemo(() => {
    if (data.colors) return data.colors
    const fallback = new Float32Array(data.sizes.length * 3)
    fallback.fill(1)
    return fallback
  }, [data])
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uOpacity: { value: opacity },
      uPixelRatio: { value: pixelRatio },
      uMaxPointSize: { value: maxPointSize },
    }),
    [color, maxPointSize, opacity, pixelRatio],
  )

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
        <bufferAttribute
          attach="attributes-aBrightness"
          args={[data.brightness, 1]}
        />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </points>
  )
}
