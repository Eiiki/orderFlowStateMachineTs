# orderFlowTs - Event-Driven Workflow Engine

A minimal, clean implementation of a state machine / workflow engine.

## How It Works

The engine treats workflow state management as **event-driven state propagation**:

1. **Nodes** represent stateful components (workflows or tasks) with an `id` and `state`
2. **Links** are declarative rules that define how state changes propagate between nodes
3. When a node's state changes, the engine emits a `StateChanged` event
4. Links listen for these events and may trigger further state changes
5. The engine processes events in a queue until no more links fire (reaching a stable state)

This approach keeps the engine generic while the workflow logic lives entirely in the Link configuration.

## How to Run

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
cd orderFlowTs
npm install
```

### Run Tests
```bash
npm test
```
Expected output: 9 passing tests covering storage, guard evaluation, and the engine (cascade, fork, merge).

### Run Demo
```bash
npm run demo
```
This runs the Order Fulfillment example, showing cascading state changes with trace output.

### Build (optional)
```bash
npm run build
```
Compiles TypeScript to `dist/` folder.

## Project Structure

```
src/
├── domain/           # Pure data structures (no logic)
│   ├── types.ts      # NodeId, State type aliases
│   ├── node.ts       # Node interface
│   ├── event.ts      # StateChanged event
│   └── link.ts       # Trigger, Guard, TargetAction, Link
│
├── storage/          # State storage
│   └── inMemoryStore.ts   # Holds nodes and links
│
├── engine/           # Core logic
│   ├── workflowEngine.ts  # Main orchestration loop
│   ├── linkMatcher.ts     # Match events to Link triggers
│   ├── guardEvaluator.ts  # Evaluate Guard conditions (ALL_OF, ANY_OF)
│   ├── trace.ts           # Debug trace formatting
│   └── errors.ts          # Custom error types
│
├── demo/             # Example flow
│   ├── orderFulfillment.flow.ts  # Flow configuration
│   └── runDemo.ts                # Demo runner
│
└── index.ts          # Public exports

tests/
└── workflowEngine.test.ts  # 9 unit tests
```

## Key Abstractions

### Node
A stateful component. Whether it represents a "workflow" or "task" is purely semantic - the engine treats all nodes identically.

```typescript
interface Node {
  id: NodeId;
  state: State;
}
```

### Link
A declarative rule defining when and how state changes propagate.

```typescript
interface Link {
  id: string;
  trigger: Trigger;        // When to activate (source node + state)
  guard?: Guard;           // Optional conditions (for merge patterns)
  actions: TargetAction[]; // State changes to apply
}
```

### Guard
Conditional logic for merge patterns where multiple conditions must be met.

```typescript
interface Guard {
  type: "ALL_OF" | "ANY_OF";  // AND or OR logic
  conditions: Array<{ nodeId: NodeId; state: State }>;
}
```

## Example: Order Fulfillment

The demo implements an order fulfillment workflow:

**Nodes:**
- `order` - the main workflow (PENDING → PROCESSING → READY_TO_SHIP → SHIPPED → DELIVERED)
- `verifyPayment` - task (PENDING → IN_PROGRESS → DONE)
- `packOrder` - task (PENDING → IN_PROGRESS → DONE)
- `createLabel` - task (PENDING → IN_PROGRESS → DONE)

**Links:**
1. `order→PROCESSING` triggers `verifyPayment→IN_PROGRESS`
2. `verifyPayment→DONE` triggers `packOrder→IN_PROGRESS` AND `createLabel→IN_PROGRESS` (fork)
3. `packOrder=DONE` AND `createLabel=DONE` triggers `order→READY_TO_SHIP` (merge with guard)

See [DIAGRAM.md](./DIAGRAM.md) for visual representation.

## Assumptions

1. **States are strings** - No predefined state enum; any string is valid. This keeps the engine generic.

2. **No state validation** - The engine doesn't validate if a state transition is "allowed". Links define what happens, not what's permitted.

3. **Nodes are flat** - No parent-child hierarchy between workflows and tasks. Relationships are defined purely through Links.

4. **Synchronous execution** - All state changes happen synchronously in a single `updateState()` call. No async/await or external side effects.

5. **In-memory only** - State is stored in memory. For persistence, the `InMemoryStore` could be swapped for a database-backed implementation.

6. **Idempotent state changes** - Setting a node to its current state is a no-op (returns null, no event emitted).

7. **Deterministic ordering** - Links are evaluated in the order they were added. Events are processed FIFO.

8. **Safety limit** - Maximum 1000 events per `updateState()` call to prevent infinite loops from misconfigured links.

## Design Decisions

1. **Nodes are generic** - No separate Workflow/Task classes. The distinction is semantic, not structural.

2. **Links are data** - Declarative configuration rather than class hierarchies (no SimpleLink, ForkLink, MergeLink classes).

3. **Guards enable merge** - The ALL_OF guard type enables fan-in patterns where multiple nodes must reach certain states.

4. **Trace for debugging** - Every state change is recorded with the triggering link, making it easy to debug cascades.

5. **Store is passive** - The store doesn't trigger cascades; it just holds state. The engine orchestrates everything.

## Testing

9 focused tests cover:
- `InMemoryStore` - Store/retrieve nodes, state updates
- `evaluateGuard` - ALL_OF guard evaluation
- `WorkflowEngine` - Simple changes, cascade, fork, merge with guards
