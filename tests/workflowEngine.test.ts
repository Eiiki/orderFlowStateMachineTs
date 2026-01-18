/**
 * Tests for the workflow engine.
 */

import { describe, it, expect } from "vitest";
import { InMemoryStore } from "../src/storage/inMemoryStore";
import { evaluateGuard } from "../src/engine/guardEvaluator";
import { WorkflowEngine } from "../src/engine/workflowEngine";
import type { Guard } from "../src/domain/link";

describe("InMemoryStore", () => {
  it("stores and retrieves nodes", () => {
    const store = new InMemoryStore();
    store.addNode({ id: "order", state: "PENDING" });

    expect(store.getNode("order")).toEqual({ id: "order", state: "PENDING" });
  });

  it("updates state and returns event", () => {
    const store = new InMemoryStore();
    store.addNode({ id: "order", state: "PENDING" });

    const event = store.setNodeState("order", "PROCESSING");

    expect(event).toEqual({
      nodeId: "order",
      fromState: "PENDING",
      toState: "PROCESSING",
    });
  });
});

describe("evaluateGuard", () => {
  it("ALL_OF returns true when all conditions met", () => {
    const store = new InMemoryStore();
    store.addNode({ id: "task1", state: "DONE" });
    store.addNode({ id: "task2", state: "DONE" });

    const guard: Guard = {
      type: "ALL_OF",
      conditions: [
        { nodeId: "task1", state: "DONE" },
        { nodeId: "task2", state: "DONE" },
      ],
    };

    expect(evaluateGuard(guard, store)).toBe(true);
  });

  it("ALL_OF returns false when any condition not met", () => {
    const store = new InMemoryStore();
    store.addNode({ id: "task1", state: "DONE" });
    store.addNode({ id: "task2", state: "IN_PROGRESS" });

    const guard: Guard = {
      type: "ALL_OF",
      conditions: [
        { nodeId: "task1", state: "DONE" },
        { nodeId: "task2", state: "DONE" },
      ],
    };

    expect(evaluateGuard(guard, store)).toBe(false);
  });
});

describe("WorkflowEngine", () => {
  it("updates state and returns trace", () => {
    const store = new InMemoryStore();
    store.addNode({ id: "order", state: "PENDING" });
    const engine = new WorkflowEngine(store);

    const trace = engine.updateState("order", "PROCESSING");

    expect(trace).toHaveLength(1);
    expect(trace[0].event).toEqual({
      nodeId: "order",
      fromState: "PENDING",
      toState: "PROCESSING",
    });
  });

  it("cascades state change through link", () => {
    const store = new InMemoryStore();
    store.addNode({ id: "order", state: "PENDING" });
    store.addNode({ id: "verifyPayment", state: "PENDING" });
    store.addLink({
      id: "on-order-processing",
      trigger: { sourceId: "order", toState: "PROCESSING" },
      actions: [{ targetId: "verifyPayment", targetState: "IN_PROGRESS" }],
    });
    const engine = new WorkflowEngine(store);

    const trace = engine.updateState("order", "PROCESSING");

    expect(store.getNode("verifyPayment")?.state).toBe("IN_PROGRESS");
    expect(trace).toEqual([
      {
        event: { nodeId: "order", fromState: "PENDING", toState: "PROCESSING" },
      },
      {
        event: {
          nodeId: "verifyPayment",
          fromState: "PENDING",
          toState: "IN_PROGRESS",
        },
        triggeredBy: "on-order-processing",
      },
    ]);
  });

  it("forks to multiple targets", () => {
    const store = new InMemoryStore();
    store.addNode({ id: "verifyPayment", state: "PENDING" });
    store.addNode({ id: "packOrder", state: "PENDING" });
    store.addNode({ id: "createLabel", state: "PENDING" });
    store.addLink({
      id: "on-payment-verified",
      trigger: { sourceId: "verifyPayment", toState: "DONE" },
      actions: [
        { targetId: "packOrder", targetState: "IN_PROGRESS" },
        { targetId: "createLabel", targetState: "IN_PROGRESS" },
      ],
    });
    const engine = new WorkflowEngine(store);

    const trace = engine.updateState("verifyPayment", "DONE");

    expect(trace).toEqual([
      {
        event: {
          nodeId: "verifyPayment",
          fromState: "PENDING",
          toState: "DONE",
        },
      },
      {
        event: {
          nodeId: "packOrder",
          fromState: "PENDING",
          toState: "IN_PROGRESS",
        },
        triggeredBy: "on-payment-verified",
      },
      {
        event: {
          nodeId: "createLabel",
          fromState: "PENDING",
          toState: "IN_PROGRESS",
        },
        triggeredBy: "on-payment-verified",
      },
    ]);
  });

  it("does not trigger merge when guard fails", () => {
    const store = new InMemoryStore();
    store.addNode({ id: "order", state: "PROCESSING" });
    store.addNode({ id: "packOrder", state: "IN_PROGRESS" });
    store.addNode({ id: "createLabel", state: "IN_PROGRESS" });
    store.addLink({
      id: "on-pack-done",
      trigger: { sourceId: "packOrder", toState: "DONE" },
      guard: {
        type: "ALL_OF",
        conditions: [
          { nodeId: "packOrder", state: "DONE" },
          { nodeId: "createLabel", state: "DONE" },
        ],
      },
      actions: [{ targetId: "order", targetState: "READY_TO_SHIP" }],
    });
    const engine = new WorkflowEngine(store);

    engine.updateState("packOrder", "DONE");

    expect(store.getNode("order")?.state).toBe("PROCESSING"); // Unchanged
  });

  it("triggers merge when guard passes", () => {
    const store = new InMemoryStore();
    store.addNode({ id: "order", state: "PROCESSING" });
    store.addNode({ id: "packOrder", state: "DONE" });
    store.addNode({ id: "createLabel", state: "IN_PROGRESS" });
    store.addLink({
      id: "on-label-done",
      trigger: { sourceId: "createLabel", toState: "DONE" },
      guard: {
        type: "ALL_OF",
        conditions: [
          { nodeId: "packOrder", state: "DONE" },
          { nodeId: "createLabel", state: "DONE" },
        ],
      },
      actions: [{ targetId: "order", targetState: "READY_TO_SHIP" }],
    });
    const engine = new WorkflowEngine(store);

    engine.updateState("createLabel", "DONE");

    expect(store.getNode("order")?.state).toBe("READY_TO_SHIP");
  });
});
