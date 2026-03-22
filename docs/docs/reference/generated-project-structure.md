---
sidebar_position: 3
title: Generated Project Structure
---

# Generated Project Structure

When you run `create-context-graph`, it produces a complete full-stack application. This page documents every file and directory in the generated output.

## Directory Tree

```
my-app/
├── .env                              # Environment variables (Neo4j, API keys)
├── .gitignore                        # Git ignore rules
├── Makefile                          # Build, run, and seed commands
├── docker-compose.yml                # Neo4j container definition
├── README.md                         # Auto-generated project documentation
│
├── backend/
│   ├── pyproject.toml                # Python dependencies (includes agent framework)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI application entry point
│   │   ├── config.py                 # Settings loaded from .env
│   │   ├── routes.py                 # API endpoints (/chat, /graph, /health)
│   │   ├── models.py                 # Pydantic models generated from ontology
│   │   ├── agent.py                  # AI agent (framework-specific)
│   │   ├── context_graph_client.py   # Neo4j read/write client
│   │   ├── gds_client.py            # Neo4j Graph Data Science client
│   │   └── vector_client.py         # Vector search client
│   └── scripts/
│       └── generate_data.py          # Standalone data generation script
│
├── frontend/
│   ├── package.json                  # Next.js + Chakra UI v3 + NVL dependencies
│   ├── next.config.ts                # Next.js configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── app/
│   │   ├── layout.tsx                # Root layout with Chakra provider
│   │   ├── page.tsx                  # Main page (chat + graph view)
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── ChatInterface.tsx         # Chat UI with streaming responses
│   │   ├── ContextGraphView.tsx      # NVL graph visualization
│   │   ├── DecisionTracePanel.tsx    # Reasoning trace display
│   │   └── Provider.tsx              # Chakra UI v3 provider wrapper
│   ├── lib/
│   │   └── config.ts                 # Frontend configuration constants
│   └── theme/
│       └── index.ts                  # Chakra UI v3 theme customization
│
├── cypher/
│   ├── schema.cypher                 # Node constraints and indexes from ontology
│   └── gds_projections.cypher        # Graph Data Science projection queries
│
└── data/
    ├── ontology.yaml                 # Copy of the domain ontology
    ├── _base.yaml                    # Copy of the base POLE+O ontology
    ├── fixtures.json                 # Generated demo data (if --demo-data)
    └── documents/                    # Generated synthetic documents
```

## Backend

### `app/main.py`

FastAPI application with CORS middleware, lifespan management for the Neo4j driver, and route mounting. Starts on port 8000.

### `app/config.py`

Pydantic `Settings` class that reads from the `.env` file. Exposes Neo4j connection details, API keys, and framework-specific settings.

### `app/routes.py`

Three primary API endpoints:

- `POST /chat` -- Send a message to the AI agent. Accepts `{ "message": str, "session_id": str | null }` and returns `{ "response": str, "session_id": str, "graph_data": dict | null }`.
- `GET /graph` -- Execute a Cypher query and return graph data for NVL visualization.
- `GET /health` -- Health check endpoint.

### `app/models.py`

Pydantic models auto-generated from the ontology's `entity_types`. Each entity label becomes a model class. Enum properties generate Python `Enum` classes.

### `app/agent.py`

The AI agent implementation. This is the only backend file that varies by framework. All framework implementations export the same interface:

```python
async def handle_message(
    message: str,
    session_id: str | None = None,
) -> dict:
    """Returns {"response": str, "session_id": str, "graph_data": dict | None}"""
```

The agent is configured with:
- The domain's `system_prompt` from the ontology
- Domain-specific tools generated from `agent_tools`, each executing Cypher queries against Neo4j
- Session management for conversation continuity

### `app/context_graph_client.py`

Neo4j client for reading and writing to the knowledge graph. Provides methods for entity CRUD, relationship traversal, and arbitrary Cypher execution.

### `app/gds_client.py`

Client for Neo4j Graph Data Science. Includes methods for running graph algorithms (PageRank, community detection, similarity) on projected subgraphs.

### `app/vector_client.py`

Client for Neo4j vector search. Supports storing and querying vector embeddings for semantic search over entities and documents.

### `scripts/generate_data.py`

Standalone script for regenerating demo data. Can be run independently of the main application:

```bash
cd backend && python scripts/generate_data.py
```

## Frontend

### `app/page.tsx`

Main application page with a split-pane layout: chat interface on the left, graph visualization on the right. The graph updates in response to agent tool calls.

### `components/ChatInterface.tsx`

Chat UI component with message history, input field, and streaming response display. Includes clickable demo scenario buttons generated from the ontology's `demo_scenarios`.

### `components/ContextGraphView.tsx`

NVL (Neo4j Visualization Library) graph component. Renders nodes and relationships returned by agent queries. Node colors and sizes are configured from the ontology's `visualization` section.

### `components/DecisionTracePanel.tsx`

Expandable panel that displays the agent's reasoning traces: each thought, action, and observation step. Provides transparency into how the agent arrived at its answer.

### `components/Provider.tsx`

Chakra UI v3 provider component that wraps the application with the custom theme and color mode configuration.

## Cypher

### `schema.cypher`

Auto-generated from the ontology. Contains:
- Uniqueness constraints for properties marked `unique: true`
- Name indexes on every entity type for fast lookups

Example output:

```cypher
CREATE CONSTRAINT account_account_id_unique IF NOT EXISTS
FOR (n:Account) REQUIRE n.account_id IS UNIQUE;
CREATE INDEX account_name IF NOT EXISTS
FOR (n:Account) ON (n.name);
```

### `gds_projections.cypher`

Graph Data Science projection queries for running algorithms on domain-specific subgraphs.

## Data

### `ontology.yaml` and `_base.yaml`

Copies of the domain ontology and base POLE+O definitions bundled into the generated project. These serve as documentation and can be used to regenerate schema or data.

### `fixtures.json`

Generated demo data in a structured format:

```json
{
  "entities": {
    "Person": [{"name": "...", ...}],
    "Account": [{"name": "...", ...}]
  },
  "relationships": [
    {"type": "OWNS_ACCOUNT", "source_name": "...", "target_name": "..."}
  ],
  "documents": [
    {"template_id": "...", "title": "...", "content": "..."}
  ],
  "traces": [
    {"task": "...", "steps": [...], "outcome": "..."}
  ]
}
```

## Configuration Files

### `.env`

```env
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
ANTHROPIC_API_KEY=
```

### `docker-compose.yml`

Defines a Neo4j container with APOC and GDS plugins, mapped to ports 7474 (browser) and 7687 (Bolt).

### `Makefile`

| Target | Description |
|--------|-------------|
| `make install` | Install backend and frontend dependencies |
| `make docker-up` | Start Neo4j via Docker Compose |
| `make docker-down` | Stop Neo4j container |
| `make seed` | Apply schema and ingest fixture data into Neo4j |
| `make start` | Start both backend (port 8000) and frontend (port 3000) |
| `make backend` | Start only the FastAPI backend |
| `make frontend` | Start only the Next.js frontend |
| `make import` | Re-import data from connected SaaS services (if connectors enabled) |
| `make generate` | Regenerate synthetic demo data |
| `make clean` | Remove generated artifacts |
