import { Bone, Box3, Group, Quaternion, Vector3 } from "three";

export function poseNatashaSeated(model: Group) {
  function bone(name: string) {
    const joint = model.getObjectByName(name);
    if (!(joint instanceof Bone) || !joint.parent) throw new Error("Squelette de Natasha incomplet.");
    return joint;
  }

  function aim(joint: Bone, child: Bone, direction: Vector3) {
    const current = child.getWorldPosition(new Vector3()).sub(joint.getWorldPosition(new Vector3())).normalize();
    const correction = new Quaternion().setFromUnitVectors(current, direction.clone().normalize());
    const parentRotation = joint.parent!.getWorldQuaternion(new Quaternion());
    joint.quaternion.premultiply(parentRotation.clone().invert().multiply(correction).multiply(parentRotation));
  }

  // Solve each knee from the planted ankle and a preferred direction of flexion.
  function placeLeg(side: "Left" | "Right", ankle: Vector3, bend: Vector3) {
    const thigh = bone(`${side}UpLeg`);
    const shin = bone(`${side}Leg`);
    const foot = bone(`${side}Foot`);
    const footRotation = foot.getWorldQuaternion(new Quaternion());
    const hip = thigh.getWorldPosition(new Vector3());
    const axis = ankle.clone().sub(hip);
    const upper = shin.position.length();
    const lower = foot.position.length();
    const distance = Math.min(axis.length(), upper + lower - 0.001);
    axis.normalize();
    bend.addScaledVector(axis, -bend.dot(axis)).normalize();
    const along = (upper ** 2 + distance ** 2 - lower ** 2) / (2 * distance);
    const knee = hip.clone().addScaledVector(axis, along)
      .addScaledVector(bend, Math.sqrt(Math.max(0, upper ** 2 - along ** 2)));
    aim(thigh, shin, knee.sub(hip));
    aim(shin, foot, ankle.sub(shin.getWorldPosition(new Vector3())));
    foot.quaternion.copy(shin.getWorldQuaternion(new Quaternion()).invert().multiply(footRotation));
  }

  bone("Hips").position.y = 0.19;
  bone("Spine").rotateZ(-0.075);
  bone("Spine1").rotateY(0.09);
  bone("Head").rotateY(-0.12);
  bone("Head").rotateZ(0.045);

  placeLeg("Left", new Vector3(0.17, 0.11, 0.49), new Vector3(0.12, 1, 0));
  placeLeg("Right", new Vector3(0.05, 0.11, 0.43), new Vector3(-1, 0.06, 0));

  aim(bone("LeftArm"), bone("LeftForeArm"), new Vector3(0.18, -1, 0.57));
  aim(bone("LeftForeArm"), bone("LeftHand"), new Vector3(-0.2, -0.43, 1));
  aim(bone("RightArm"), bone("RightForeArm"), new Vector3(-0.15, -1, 0.16));
  aim(bone("RightForeArm"), bone("RightHand"), new Vector3(0.23, -1, 0.36));

  model.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(model, true);
  if (!Number.isFinite(bounds.min.y)) throw new Error("Dimensions de Natasha invalides.");
  model.position.y -= bounds.min.y;
}
