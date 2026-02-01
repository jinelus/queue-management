import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export interface ServiceProps {
  name: string;
  description: string;
  avgDurationInt?: number;
  maxCapacity?: number | null;
  alertThresholdMinutes?: number;
  isActive?: boolean;

  organizationId: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export class Service extends Entity<ServiceProps> {
  get name(): ServiceProps["name"] {
    return this.props.name;
  }

  get description(): ServiceProps["description"] {
    return this.props.description;
  }

  get avgDurationInt(): ServiceProps["avgDurationInt"] {
    return this.props.avgDurationInt;
  }

  get maxCapacity(): ServiceProps["maxCapacity"] {
    return this.props.maxCapacity;
  }

  get alertThresholdMinutes(): ServiceProps["alertThresholdMinutes"] {
    return this.props.alertThresholdMinutes;
  }

  get isActive(): ServiceProps["isActive"] {
    return this.props.isActive;
  }

  get organizationId(): ServiceProps["organizationId"] {
    return this.props.organizationId;
  }

  get createdAt(): ServiceProps["createdAt"] {
    return this.props.createdAt;
  }

  get updatedAt(): ServiceProps["updatedAt"] {
    return this.props.updatedAt;
  }

  set name(name: ServiceProps["name"]) {
    this.props.name = name;
    this.touch();
  }

  set description(description: ServiceProps["description"]) {
    this.props.description = description;
    this.touch();
  }

  set avgDurationInt(avgDurationInt: ServiceProps["avgDurationInt"]) {
    this.props.avgDurationInt = avgDurationInt;
    this.touch();
  }

  set maxCapacity(maxCapacity: ServiceProps["maxCapacity"]) {
    this.props.maxCapacity = maxCapacity;
    this.touch();
  }

  set alertThresholdMinutes(
    alertThresholdMinutes: ServiceProps["alertThresholdMinutes"],
  ) {
    this.props.alertThresholdMinutes = alertThresholdMinutes;
    this.touch();
  }

  set isActive(isActive: ServiceProps["isActive"]) {
    this.props.isActive = isActive;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      ServiceProps,
      "createdAt" | "updatedAt" | "isActive" | "avgDurationInt"
    >,
    id?: UniqueEntityID,
  ): Service {
    const service = new Service(
      {
        ...props,
        isActive: props.isActive ?? false,
        avgDurationInt: props.avgDurationInt ?? 5,
        alertThresholdMinutes: props.alertThresholdMinutes ?? 30,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return service;
  }
}
