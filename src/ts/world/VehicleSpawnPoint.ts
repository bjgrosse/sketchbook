import * as THREE from "three";
import { ISpawnPoint } from "../interfaces/ISpawnPoint";
import { World } from "../world/World";
import { Car } from "../vehicles/Car";
import * as Utils from "../core/FunctionLibrary";
import { Vehicle } from "../vehicles/Vehicle";
import { LoadingManager } from "../core/LoadingManager";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { IInputReceiver } from "../interfaces/IInputReceiver";

export class VehicleSpawnPoint implements ISpawnPoint {
  public type: string;
  public driver: string;
  public firstAINode: string;

  private object: THREE.Object3D;

  constructor(object: THREE.Object3D) {
    this.object = object;
  }

  public spawn(loadingManager: LoadingManager, world: World): void {
    loadingManager.loadGLTF("assets/" + this.type + ".glb", (model: any) => {
      let vehicle = new Car(model);
      vehicle.spawnPoint = this.object;

      let worldPos = new THREE.Vector3();
      let worldQuat = new THREE.Quaternion();
      this.object.getWorldPosition(worldPos);
      this.object.getWorldQuaternion(worldQuat);

      vehicle.setPosition(worldPos.x, worldPos.y + 1, worldPos.z);
      vehicle.collision.quaternion.set(
        worldQuat.x,
        worldQuat.y,
        worldQuat.z,
        worldQuat.w
      );

      world.add(vehicle);

      // If this is a player-controlled car, set it as the input receiver
      if (this.driver === "player") {
        world.inputManager.setInputReceiver(vehicle);

        // Set camera to follow this vehicle
        world.cameraOperator.target = vehicle;
        world.cameraOperator.followMode = true;
      }

      // AI cars can be implemented here if needed
      // Currently AI functionality is removed as it was dependent on the character system
    });
  }
}
