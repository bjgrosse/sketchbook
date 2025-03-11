# Camera System Documentation

## Overview

The Camera System in Sketchbook provides a flexible framework for camera control and manipulation. It handles third-person following, first-person view, camera collision, transitions, and various specialized camera modes. The system is tightly integrated with character and vehicle systems to provide appropriate views for different gameplay situations.

## Core Components

### 1. Camera Operator

The `CameraOperator` class is the central component of the camera system:

```typescript
export class CameraOperator implements IInputReceiver {
    public cameraTarget: THREE.Vector3;
    public followMode: boolean = false;
    public rotationSpeed: number = 0.25;
    public actions: { [action: string]: KeyBinding };
    
    private camera: THREE.PerspectiveCamera;
    private target: THREE.Object3D;
    private azimuthAngle: number = 0;
    private polarAngle: number = 0;
    private radius: number = 2;
    // ...
}
```

Key responsibilities:
- Camera positioning and orientation
- Target following
- Camera smoothing
- Input handling for camera control
- Collision detection and avoidance

### 2. Camera Modes

The system supports multiple camera modes:

#### Third-Person Follow Camera

- Follows a target at a variable distance
- Rotates around the target
- Adjustable height and angle
- Collision detection with environment

```typescript
// Following target
this.followMode = true;
this.target = target;
```

#### First-Person Camera

- Camera positioned at character's head
- Direct view through character or vehicle
- Special handling for vehicle cockpits
- Optional head bobbing

```typescript
// First-person mode
this.setRadius(0, true);
```

#### Free Camera

- Detached from any target
- Free movement and rotation
- Useful for debugging and exploration
- Can be toggled during gameplay

```typescript
// Free camera mode
this.followMode = false;
```

#### Cinematic Camera

- Predefined camera paths and positions
- Smooth transitions between viewpoints
- Special effects for dramatic scenes
- Letterboxing and DOF effects

### 3. Camera Physics and Collision

The camera implements collision detection to avoid clipping through objects:

```typescript
// Camera collision check
this.world.physicsWorld.raycastAny(rayOrigin, rayTarget, ray_options, result);
if (result.hasHit) {
    // Adjust camera position to prevent clipping
    this.radius = Math.min(this.desiredRadius, result.distance - 0.1);
}
```

Features:
- Raycast-based collision detection
- Smooth camera adjustment
- Transparency handling for occluded objects
- Minimum distance enforcement

### 4. Camera Transitions

The system provides smooth transitions between different camera states:

```typescript
// Smooth camera movement
this.radius = THREE.MathUtils.lerp(this.radius, this.desiredRadius, delta * 10);
```

Types of transitions:
- Distance transitions (zoom in/out)
- View angle transitions
- Target transitions
- Mode transitions (e.g., third-person to first-person)

### 5. Input Handling

The CameraOperator implements the IInputReceiver interface to handle user input:

```typescript
public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
    if (!this.followMode && this.target === undefined) {
        // Free rotation
        this.azimuthAngle -= deltaX * this.rotationSpeed;
        this.polarAngle = THREE.MathUtils.clamp(
            this.polarAngle += deltaY * this.rotationSpeed,
            0.1,
            Math.PI - 0.1
        );
    }
}
```

Input handling features:
- Mouse look control
- Camera zoom with mouse wheel
- Key bindings for camera modes
- Touch controls for mobile

### 6. Advanced Features

#### Camera Shake

- Procedural camera shake for impacts and explosions
- Configurable intensity and duration
- Direction-based shake

```typescript
// Camera shake example
this.shake(intensity, duration);
```

#### Field of View Control

- Dynamic field of view adjustments
- Speed-based FOV changes
- Effect-based FOV manipulation

```typescript
// FOV control
this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, delta * 5);
this.camera.updateProjectionMatrix();
```

#### Look-At Target Control

- Ability to focus on specific points of interest
- Automatic target selection
- Blended targeting for smooth transitions

## Key Integration Points

### 1. Character Integration

The camera system works closely with the character system:

```typescript
// Attaching camera to character
world.cameraOperator.target = character;
world.cameraOperator.followMode = true;
```

Features:
- Character-relative positioning
- State-aware camera behavior (e.g., different for swimming)
- Character visibility handling in first-person

### 2. Vehicle Integration

Special handling for different vehicle types:

```typescript
// Vehicle-specific camera positioning
if (character.occupyingSeat?.vehicle instanceof Car) {
    world.cameraOperator.setCameraPositionForCar();
}
```

Features:
- Vehicle-appropriate view angles
- Special positions for different vehicle types
- Cockpit views and transitions
- Chase camera for vehicles

### 3. World Integration

The camera interacts with the world for environmental awareness:

- Scene bounds detection
- Environment-based camera adjustments
- Special camera handling for indoor/outdoor areas

## Debug Features

The Camera System includes debugging capabilities:

- Camera position and target visualization
- FOV and distance display
- Collision ray visualization
- Camera path visualization

## Customization

The Camera System can be customized in several ways:

1. **Distance Settings**: Adjustable camera distance and limits
2. **Angle Settings**: Customizable default angles and constraints
3. **Smoothing Parameters**: Different interpolation speeds
4. **Collision Settings**: Raycast distances and layers
5. **Special Effects**: Custom camera effects and behaviors

## Usage Example

```javascript
// Basic camera setup
const cameraOperator = world.cameraOperator;

// Follow a character
cameraOperator.target = character;
cameraOperator.followMode = true;

// Set default view
cameraOperator.setDefaultCameraPosition();
cameraOperator.setRadius(5);

// First-person view
cameraOperator.setRadius(0, true);
character.modelContainer.visible = false;

// Camera collision settings
cameraOperator.collisionEnabled = true;
```

## Performance Considerations

The Camera System is optimized for performance:

- Efficient raycasting for collisions
- LOD management based on camera distance
- Culling optimization
- Selective updates for stationary camera

## Advanced Camera Effects

The system supports integration with post-processing effects:

- Depth of field based on focus target
- Motion blur based on camera movement
- Chromatic aberration for dramatic effects
- Vignetting and film grain 