/** biome-ignore-all lint/suspicious/noExplicitAny: Gattaca*/
import { AggregateRoot } from "../entities/aggregate-root";
import { UniqueEntityID } from "../entities/unique-entity-id";
import { DomainEvent } from "./domain-event";

type DomainEventCallback = (event: any) => void;

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {};
  private static markedAggregates: AggregateRoot<any>[] = [];

  public static readonly shouldRun = true;
  public static markAggregateForDispatch(aggregate: AggregateRoot<any>): void {
    const aggregateFound = !!DomainEvents.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      DomainEvents.markedAggregates.push(aggregate);
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>): void {
    // biome-ignore lint/suspicious/useIterableCallbackReturn: Gattaca
    aggregate.domainEvents.forEach((event: DomainEvent) =>
      DomainEvents.dispatch(event),
    );
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<any>,
  ): void {
    const index = DomainEvents.markedAggregates.findIndex((a) =>
      a.equals(aggregate),
    );

    DomainEvents.markedAggregates.splice(index, 1);
  }

  private static findMarkedAggregateByID(
    id: UniqueEntityID,
  ): AggregateRoot<any> | undefined {
    return DomainEvents.markedAggregates.find((aggregate) =>
      aggregate.id.equals(id),
    );
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID): void {
    const aggregate = DomainEvents.findMarkedAggregateByID(id);

    if (aggregate) {
      DomainEvents.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      DomainEvents.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  public static register(
    callback: DomainEventCallback,
    eventClassName: string,
  ): void {
    const wasEventRegisteredBefore = eventClassName in DomainEvents.handlersMap;

    if (!wasEventRegisteredBefore) {
      DomainEvents.handlersMap[eventClassName] = [];
    }

    DomainEvents.handlersMap[eventClassName].push(callback);
  }

  public static clearHandlers(): void {
    DomainEvents.handlersMap = {};
  }

  public static clearMarkedAggregates(): void {
    DomainEvents.markedAggregates = [];
  }

  private static dispatch(event: DomainEvent): void {
    const eventClassName: string = event.constructor.name;

    const isEventRegistered = eventClassName in DomainEvents.handlersMap;

    if (!DomainEvents.shouldRun) {
      return;
    }

    if (isEventRegistered) {
      const handlers = DomainEvents.handlersMap[eventClassName];

      for (const handler of handlers) {
        handler(event);
      }
    }
  }
}
