export class Role {
  public readonly name: string;

  constructor(name: string) {
    if (!name) {
      throw new Error("Role name is required");
    }

    this.name = name;
  }
}
