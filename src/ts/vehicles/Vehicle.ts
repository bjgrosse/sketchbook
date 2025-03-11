import * as THREE from "three";
import * as CANNON from "cannon-es";
import { World } from "../world/World";
import { KeyBinding } from "../core/KeyBinding";
import { Wheel } from "./Wheel";
import * as Utils from "../core/FunctionLibrary";
import { CollisionGroups } from "../enums/CollisionGroups";
import { EntityType } from "../enums/EntityType";
import { IWorldEntity } from "../interfaces/IWorldEntity";

export abstract class Vehicle extends THREE.Object3D implements IWorldEntity {
  public updateOrder: number = 2;
  public abstract entityType: EntityType;

  public actions: { [action: string]: KeyBinding } = {};
  public rayCastVehicle: CANNON.RaycastVehicle;
  public wheels: Wheel[] = [];
  public drive: string;
  public camera: any;
  public world: World;
  public help: THREE.AxesHelper;
  public collision: CANNON.Body;
  public materials: THREE.Material[] = [];
  public spawnPoint: THREE.Object3D;
  protected modelContainer: THREE.Group;
  private firstPerson: boolean = false;

  constructor(gltf: any, handlingSetup?: any) {
    super();

    if (handlingSetup === undefined) handlingSetup = {};
    (handlingSetup.chassisConnectionPointLocal = new CANNON.Vec3()),
      (handlingSetup.axleLocal = new CANNON.Vec3(-1, 0, 0));
    handlingSetup.directionLocal = new CANNON.Vec3(0, -1, 0);

    // Physics mat
    let mat = new CANNON.Material("Mat");
    mat.friction = 0.01;

    // Collision body
    this.collision = new CANNON.Body({ mass: 50 });
    this.collision.material = mat;

    // Read GLTF
    this.readVehicleData(gltf);

    this.modelContainer = new THREE.Group();
    super.add(this.modelContainer);
    this.modelContainer.add(gltf.scene);

    // Raycast vehicle component
    this.rayCastVehicle = new CANNON.RaycastVehicle({
      chassisBody: this.collision,
      indexUpAxis: 1,
      indexRightAxis: 0,
      indexForwardAxis: 2,
    });

    this.wheels.forEach((wheel) => {
      handlingSetup.chassisConnectionPointLocal.set(
        wheel.position.x,
        wheel.position.y + 0.2,
        wheel.position.z
      );
      const index = this.rayCastVehicle.addWheel(handlingSetup);
      wheel.rayCastWheelInfoIndex = index;
    });

    this.help = new THREE.AxesHelper(2);
  }

  public update(timeStep: number): void {
    super.position.set(
      this.collision.position.x,
      this.collision.position.y,
      this.collision.position.z
    );

    super.quaternion.set(
      this.collision.quaternion.x,
      this.collision.quaternion.y,
      this.collision.quaternion.z,
      this.collision.quaternion.w
    );

    for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++) {
      this.rayCastVehicle.updateWheelTransform(i);
      let transform = this.rayCastVehicle.getWheelTransformWorld(i);
      let p = new THREE.Vector3(
        transform.position.x,
        transform.position.y,
        transform.position.z
      );
      let q = new THREE.Quaternion(
        transform.quaternion.x,
        transform.quaternion.y,
        transform.quaternion.z,
        transform.quaternion.w
      );

      let wheelObject = this.wheels[i].wheelObject;
      wheelObject.position.copy(p);
      wheelObject.quaternion.copy(q);
    }

    super.updateMatrixWorld();
  }

  public onInputChange(): void {
    // Override in child classes
  }

  public resetControls(): void {
    for (const action in this.actions) {
      if (this.actions.hasOwnProperty(action)) {
        this.triggerAction(action, false);
      }
    }
  }

  public allowSleep(value: boolean): void {
    this.collision.allowSleep = value;
    if (value === false) {
      this.collision.wakeUp();
    }
  }

  public handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    if (code === "KeyC" && pressed === true && event.shiftKey === true) {
      this.resetControls();
      this.world.inputManager.setInputReceiver(this.world.cameraOperator);
    } else if (code === "KeyR" && pressed === true && event.shiftKey === true) {
      this.world.restartScenario();
    } else {
      for (const action in this.actions) {
        if (this.actions.hasOwnProperty(action)) {
          const binding = this.actions[action];
          if (binding.eventCodes.indexOf(code) !== -1) {
            this.triggerAction(action, pressed);
          }
        }
      }
    }
  }

  public setFirstPersonView(value: boolean): void {
    this.firstPerson = value;
    if (value) {
      this.world.cameraOperator.setRadius(0, true);
    } else {
      this.world.cameraOperator.setRadius(3, true);
    }
  }

  public toggleFirstPersonView(): void {
    this.setFirstPersonView(!this.firstPerson);
  }

  public triggerAction(actionName: string, value: boolean): void {
    let action = this.actions[actionName];
    if (action.isPressed !== value) {
      action.isPressed = value;
      action.justPressed = false;
      action.justReleased = false;

      if (value) action.justPressed = true;
      else action.justReleased = true;

      this.onInputChange();

      action.justPressed = false;
      action.justReleased = false;
    }
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

  public setPosition(x: number, y: number, z: number): void {
    this.collision.position.set(x, y, z);
    this.collision.previousPosition.set(x, y, z);
    this.collision.interpolatedPosition.set(x, y, z);
    this.collision.initPosition.set(x, y, z);
  }

  public setSteeringValue(val: number): void {
    for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++) {
      this.rayCastVehicle.setSteeringValue(val, i);
    }
  }

  public applyEngineForce(force: number): void {
    for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++) {
      this.rayCastVehicle.applyEngineForce(force, i);
    }
  }

  public setBrake(brakeForce: number): void {
    for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++) {
      this.rayCastVehicle.setBrake(brakeForce, i);
    }
  }

  public addToWorld(world: World): void {
    this.world = world;
    world.scene.add(this);
    world.physicsWorld.addBody(this.collision);
    this.rayCastVehicle.addToWorld(world.physicsWorld);

    this.wheels.forEach((wheel) => {
      if (wheel.wheelObject instanceof THREE.Object3D) {
        world.scene.add(wheel.wheelObject);
      }
    });
  }

  public removeFromWorld(world: World): void {
    // Remove from scene
    super.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.removeFromParent();
      }
    });

    // Remove wheels from scene
    for (const wheel of this.wheels) {
      if (wheel.wheelObject instanceof THREE.Object3D) {
        wheel.wheelObject.removeFromParent();
      }
    }

    // Remove from physics world
    world.physicsWorld.removeBody(this.collision);
    this.rayCastVehicle.removeFromWorld(world.physicsWorld);

    // Unregister from world
    world.unregisterUpdatable(this);
    this.world = undefined;
  }

  protected readVehicleData(gltf: any): void {
    gltf.scene.traverse((child: THREE.Object3D) => {
      if (child.hasOwnProperty("userData")) {
        if (child.userData.hasOwnProperty("data")) {
          if (child.userData.data === "wheel") {
            this.wheels.push(new Wheel(child));
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
}
