# project (Shader Module)

The `project` shader module is part of the core of deck.gl. It makes it easy to write shaders that support all of deck.gl's projection modes and it supports some advanced rendering techniques such as pixel space rendering etc.

Note that the `project` module has a `project64` counterpart that enables 64 bit projections, providing a dramatic increase in precision, at the cost of some performance.


## Usage

Projects worldspace coordinates to clipspace coordinates.

```glsl
// instanced geometry
attribute vec3 positions;
// instance attributes
attribute vec3 instanceCenter;
attribute float instanceSize;

void main(void) {
  vec3 center = project_position(instanceCenter);
  vec3 vertex = positions * project_scale(instanceSize);
  gl_Position = project_to_clipspace(center + vertex);
}
```

## getUniforms

The JavaScript uniforms are extracted mainly from the viewport with a few additional parameters (which deck.gl supplies from `LayerManager` state or `Layer` props of course).

Provided by `LayerManager`:
* `viewport`
* `devicePixelRatio`

Provided by `Layer` props:
* `coordinateSystem`
* `coordinateOrigin`
* `modelMatrix`


## GLSL Uniforms

The GLSL uniforms of the `project` module are quite central to shader code and are often needed by other shader modules (in particular for lighting calculations, or screen space type calculations), so to avoid having duplicate uniforms, some `project` uniforms are considered documented and stable and can be used directly in other modules.

| Uniform | Type | Description |
| --- | --- | --- |
| project_uModelMatrix | mat4 | model matrix (identity if not supplied) |
| project_uViewProjectionMatrix | mat4 | combined view projection matrix |
| project_uViewportSize | vec2 | size of viewport in pixels |
| project_uDevicePixelRatio | float | device pixel ratio of current viewport (value depends on `useDevicePixels` prop) |
| project_uFocalDistance | float | distance where "pixel sizes" are display in 1:1 ratio (modulo `devicePixelRatio`) |
| project_uCameraPosition | float | position of camera in world space |


## GLSL Functions

The projection module makes it easy to write vertex shaders that follow deck.gl's projection methods, enabling your layer to accept coordinates in both [longitude,latitude,altitude] or [metersX,metersY,metersZ] format. To support the basic features expected of a deck.gl layer, such as various viewport types and coordinate systems, your own shaders should always use the built-in projection functions.

### project_position

`vec2 project_position(vec2 position)`
`vec3 project_position(vec3 position)`
`vec4 project_position(vec4 position)`

Projects positions (coordinates) to worldspace coordinates. The coordinates are interpreted according to `coordinateSystem` and `modelMatrix` is applied.


### project_scale

`float project_scale(float meters)`
`vec2 project_scale(vec2 meters)`
`vec3 project_scale(vec3 meters)`
`vec4 project_scale(vec4 meters)`

Projects sizes in meters to worldspace offsets. These offsets can be added directly to values returned by `project_position`.


### project_normal

`vec3 project_normal(vec3 vector)`

Projects position deltas in the current coordinate system to worldspace normals.


### project_to_clipspace

Projects world space coordinates to clipspace, which can be assigned to `gl_Position` as the "return value" from the vertex shader.

`vec4 project_to_clipspace(vec4 position)`


### project_pixels_to_clipspace

Converts the given number of pixels to a clipspace offset that can be added to a clipspace position (typically added to values returned by `project_to_clipspace`).

`vec4 project_pixels_to_clipspace(vec2 pixels)`

* `pixels` (`vec2`) - adjustment in logical pixels
Returns values in clip space offsets that can be added directly to `gl_Position`


## Remarks

* For consistent results, pixels are logical pixels, not device pixels, i.e. this method multiplies `pixels` with `project_uDevicePixelRatio`.
* The pixels offsets will be divided by the `w` coordinate of `gl_Position`. This is simply the GPUs standard treatment of any coordinate. This means that there will be more pixels closer to the camera and less pixels further away from the camer. Setting the `focalDistance` uniform controls this.
* To avoid pixel sizes scaling with distance from camera, simply set `focalDistance` to 1 and multiply clipspace offset with `gl_Position.w`
