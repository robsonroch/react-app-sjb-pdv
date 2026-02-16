export class Permission {
  public readonly name: string;

  constructor(name: string) {
    if (!name) {
      throw new Error("Permission name is required");
    }

    this.name = name;
  }
}
