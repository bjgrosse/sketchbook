import * as THREE from "three";
import * as CANNON from "cannon-es";

import * as Utils from "../core/FunctionLibrary";
import { KeyBinding } from "../core/KeyBinding";
import { IControllable } from "../interfaces/IControllable";
import { SpringSimulator } from "../physics/spring_simulation/SpringSimulator";
import { EntityType } from "../enums/EntityType";
import { World } from "../world/World";

import { Vehicle } from "./Vehicle";
import { Wheel } from "./Wheel";

export class Car extends Vehicle implements IControllable {
  public entityType: EntityType = EntityType.Car;
  public position: THREE.Vector3;
  public drive: string = "awd";
  public actions: { [action: string]: KeyBinding } = {
    throttle: new KeyBinding("KeyW"),
    reverse: new KeyBinding("KeyS"),
    left: new KeyBinding("KeyA"),
    right: new KeyBinding("KeyD"),
    handbrake: new KeyBinding("Space"),
    horn: new KeyBinding("KeyH"),
  };

  private _speed: number = 0;
  private steeringWheel: THREE.Object3D;
  private airSpinTimer: number = 0;
  private steeringSimulator: SpringSimulator;
  private gear: number = 1;
  private shiftTimer: number = 0;
  private timeToShift: number = 0.2;
  private canTiltForwards: boolean = false;

  constructor(gltf: any, handlingSetup?: any) {
    super(gltf, handlingSetup);
    this.position = new THREE.Vector3();
    this.steeringSimulator = new SpringSimulator(60, 10, 0.6);
    this.readCarData(gltf);
  }

  public update(timeStep: number): void {
    super.update(timeStep);
    this.position.copy(this.collision.position);

    const tiresHaveContact = this.rayCastVehicle.numWheelsOnGround > 0;

    // Air spin
    if (!tiresHaveContact) {
      this.airSpinTimer += timeStep;
      if (!this.actions.throttle.isPressed) this.canTiltForwards = true;
    } else {
      this.canTiltForwards = false;
      this.airSpinTimer = 0;
    }

    // Steering
    if (this.actions.left.isPressed) {
      this.setSteeringValue(0.7);
    } else if (this.actions.right.isPressed) {
      this.setSteeringValue(-0.7);
    } else {
      this.setSteeringValue(0);
    }

    // Engine
    if (this.actions.throttle.isPressed) {
      if (tiresHaveContact) {
        this.applyEngineForce(1500);
      }
    } else if (this.actions.reverse.isPressed) {
      if (tiresHaveContact) {
        this.applyEngineForce(-1500);
      }
    } else {
      this.applyEngineForce(0);
    }

    // Braking
    if (this.actions.handbrake.isPressed) {
      this.setBrake(10);
    } else {
      this.setBrake(0);
    }

    // Update steering wheel if it exists
    if (this.steeringWheel) {
      this.steeringWheel.rotation.z = -this.steeringSimulator.position * 2;
    }
  }

  public get speed(): number {
    return this._speed;
  }

  public noDirectionPressed(): boolean {
    return (
      !this.actions.throttle.isPressed &&
      !this.actions.reverse.isPressed &&
      !this.actions.left.isPressed &&
      !this.actions.right.isPressed
    );
  }

  public inputReceiverInit(): void {
    this.world.updateControls([
      { keys: ["W", "S"], desc: "Accelerate/Brake" },
      { keys: ["A", "D"], desc: "Steer" },
      { keys: ["Space"], desc: "Handbrake" },
      { keys: ["H"], desc: "Horn" },
      { keys: ["R"], desc: "Reset" },
    ]);
  }

  public inputReceiverUpdate(timeStep: number): void {
    // Update input-related state
    this.steeringSimulator.simulate(timeStep);
  }

  protected readCarData(gltf: any): void {
    gltf.scene.traverse((child: THREE.Object3D) => {
      if (child.hasOwnProperty("userData")) {
        if (child.userData.hasOwnProperty("data")) {
          if (child.userData.data === "wheel") {
            this.wheels.push(new Wheel(child));
          } else if (child.userData.data === "steering_wheel") {
            this.steeringWheel = child;
          }
        }
      }
    });

    let worldPos = new THREE.Vector3();
    let worldQuat = new THREE.Quaternion();

    for (const wheel of this.wheels) {
      wheel.wheelObject.getWorldPosition(worldPos);
      wheel.wheelObject.getWorldQuaternion(worldQuat);

      wheel.position = new THREE.Vector3(
        worldPos.x - gltf.scene.position.x,
        worldPos.y - gltf.scene.position.y,
        worldPos.z - gltf.scene.position.z
      );

      if (wheel.wheelObject instanceof THREE.Object3D) {
        wheel.wheelObject.quaternion.copy(worldQuat);
      }
    }
  }

  public physicsPreStep(body: CANNON.Body): void {
    // Constants
    const quat = new THREE.Quaternion(
      body.quaternion.x,
      body.quaternion.y,
      body.quaternion.z,
      body.quaternion.w
    );
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);

    // Measure speed
    this._speed = this.collision.velocity.dot(
      new CANNON.Vec3(forward.x, forward.y, forward.z)
    );

    // Air spin
    // It takes 2 seconds until you have max spin air control since you leave the ground
    let airSpinInfluence = THREE.MathUtils.clamp(this.airSpinTimer / 2, 0, 1);
    airSpinInfluence *= THREE.MathUtils.clamp(this.speed, 0, 1);

    const flipSpeedFactor = THREE.MathUtils.clamp(1 - this.speed, 0, 1);
    const upFactor = up.dot(new THREE.Vector3(0, -1, 0)) / 2 + 0.5;
    const flipOverInfluence = flipSpeedFactor * upFactor * 3;

    const maxAirSpinMagnitude = 2.0;
    const airSpinAcceleration = 0.15;
    const angVel = this.collision.angularVelocity;

    //const spinVectorForward = Utils.cannonVector(forward.clone());
    const spinVectorForward = new CANNON.Vec3(forward.x, forward.y, forward.z);
    //const spinVectorRight = Utils.cannonVector(right.clone());
    const spinVectorRight = new CANNON.Vec3(right.x, right.y, right.z);

    //const effectiveSpinVectorForward = Utils.cannonVector(forward.clone().multiplyScalar(airSpinAcceleration * (airSpinInfluence + flipOverInfluence)));
    const effectiveSpinVectorForward = new CANNON.Vec3(
      forward.x,
      forward.y,
      forward.z
    ).scale(airSpinAcceleration * (airSpinInfluence + flipOverInfluence));
    //const effectiveSpinVectorRight = Utils.cannonVector(right.clone().multiplyScalar(airSpinAcceleration * (airSpinInfluence)));
    const effectiveSpinVectorRight = new CANNON.Vec3(
      right.x,
      right.y,
      right.z
    ).scale(airSpinAcceleration * airSpinInfluence);
    //console.log(right)
    //console.log(spinVectorRight)
    //console.log(effectiveSpinVectorRight)

    // Right
    if (this.actions.right.isPressed && !this.actions.left.isPressed) {
      if (angVel.dot(spinVectorForward) < maxAirSpinMagnitude) {
        angVel.vadd(effectiveSpinVectorForward, angVel);
      }
    }
    // Left
    else if (this.actions.left.isPressed && !this.actions.right.isPressed) {
      if (angVel.dot(spinVectorForward) > -maxAirSpinMagnitude) {
        angVel.vsub(effectiveSpinVectorForward, angVel);
      }
    }

    // Forwards
    if (
      this.canTiltForwards &&
      this.actions.throttle.isPressed &&
      !this.actions.reverse.isPressed
    ) {
      if (angVel.dot(spinVectorRight) < maxAirSpinMagnitude) {
        angVel.vadd(effectiveSpinVectorRight, angVel);
      }
    }
    // Backwards
    else if (
      this.actions.reverse.isPressed &&
      !this.actions.throttle.isPressed
    ) {
      if (angVel.dot(spinVectorRight) > -maxAirSpinMagnitude) {
        angVel.vsub(effectiveSpinVectorRight, angVel);
      }
    }

    // Steering
    const velocity = new CANNON.Vec3().copy(this.collision.velocity);
    velocity.normalize();
    let velocity_THREE = new THREE.Vector3(velocity.x, velocity.y, velocity.z);
    let driftCorrection = Utils.getSignedAngleBetweenVectors(
      velocity_THREE,
      forward
    );

    const maxSteerVal = 0.8;
    let speedFactor = THREE.MathUtils.clamp(
      this.speed * 0.3,
      1,
      Number.MAX_VALUE
    );

    if (this.actions.right.isPressed) {
      let steering = Math.min(-maxSteerVal / speedFactor, -driftCorrection);
      this.steeringSimulator.target = THREE.MathUtils.clamp(
        steering,
        -maxSteerVal,
        maxSteerVal
      );
    } else if (this.actions.left.isPressed) {
      let steering = Math.max(maxSteerVal / speedFactor, -driftCorrection);
      this.steeringSimulator.target = THREE.MathUtils.clamp(
        steering,
        -maxSteerVal,
        maxSteerVal
      );
    } else this.steeringSimulator.target = 0;
  }

  public onInputChange(): void {
    super.onInputChange();

    const brakeForce = 1000000;

    if (
      this.actions.throttle.justReleased ||
      this.actions.reverse.justReleased
    ) {
      this.applyEngineForce(0);
    }
    if (this.actions.brake.justPressed) {
      this.setBrake(brakeForce);
    }
    if (this.actions.brake.justReleased) {
      this.setBrake(0);
    }
    if (this.actions.view.justPressed) {
      this.toggleFirstPersonView();
    }
  }

  public handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    if (this.actions[code] !== undefined) {
      this.actions[code].isPressed = pressed;
    }
  }

  public handleMouseButton(
    event: MouseEvent,
    code: string,
    pressed: boolean
  ): void {
    // Not used for car controls
  }

  public handleMouseMove(
    event: MouseEvent,
    deltaX: number,
    deltaY: number
  ): void {
    this.world.cameraOperator.move(deltaX, deltaY);
  }

  public handleMouseWheel(event: WheelEvent, value: number): void {
    this.world.cameraOperator.setRadius(
      this.world.cameraOperator.radius + value
    );
  }

  public setBrake(brakeForce: number): void {
    for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++) {
      this.rayCastVehicle.setBrake(brakeForce, i);
    }
  }
}
