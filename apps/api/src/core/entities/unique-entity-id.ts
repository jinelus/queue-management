import { ulid } from "ulid";

export class UniqueEntityID {
  private value: string;

  toString(): string {
    return this.value;
  }

  toValue(): string {
    return this.value;
  }

  constructor(value?: string) {
    this.value = value ?? ulid();
  }

  public equals(id: UniqueEntityID): boolean {
    return id.toValue() === this.value;
  }
}
