import { IInputReceiver } from "./IInputReceiver";
import { EntityType } from "../enums/EntityType";
import * as THREE from "three";

export interface IControllable extends IInputReceiver {
  entityType: EntityType;
  position: THREE.Vector3;

  triggerAction(actionName: string, value: boolean): void;
  resetControls(): void;
  allowSleep(value: boolean): void;
  onInputChange(): void;
  noDirectionPressed(): boolean;
}
