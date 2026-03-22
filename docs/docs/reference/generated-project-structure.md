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
│   │   ├── ContextGraphView.tsx      # NVL graph visualization + entity detail panel
│   │   ├── DecisionTracePanel.tsx    # Reasoning trace viewer with step details
│   │   ├── DocumentBrowser.tsx       # Document browser with template filtering
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

API endpoints:

- `POST /chat` — Send a message to the AI agent
- `POST /search` — Search entities in the knowledge graph
- `GET /graph/{entity_name}` — Get the subgraph around an entity
- `GET /schema` — Get the graph database schema
- `POST /cypher` — Execute a Cypher query
- `GET /documents` — List documents with optional template filter
- `GET /documents/{title}` — Get full document content with mentioned entities
- `GET /traces` — List decision traces with full reasoning steps
- `GET /entities/{name}` — Get full entity detail with properties and connections
- `GET /gds/status` — Check GDS availability
- `GET /gds/communities` — Run community detection
- `GET /gds/pagerank` — Run PageRank centrality
- `GET /scenarios` — Get demo scenarios

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

Data seeding script that loads all fixture data into Neo4j in 4 steps:

1. **Schema** — applies Cypher constraints and indexes
2. **Entities & relationships** — creates domain entity nodes and relationship edges
3. **Documents** — creates `:Document` nodes and links them to mentioned entities via `:MENTIONS` relationships
4. **Decision traces** — creates `:DecisionTrace` → `:HAS_STEP` → `:TraceStep` chains

Run via:
```bash
make seed
# or: cd backend && python scripts/generate_data.py
```

## Frontend

### `app/page.tsx`

Main application page with a three-panel layout: chat interface on the left, graph visualization in the center, and a tabbed panel on the right with Decision Traces and Documents tabs.

### `components/ChatInterface.tsx`

Chat UI component with message history, input field, and streaming response display. Includes clickable demo scenario buttons generated from the ontology's `demo_scenarios`.

### `components/ContextGraphView.tsx`

NVL (Neo4j Visualization Library) graph component. Renders nodes and relationships with domain-colored nodes. Click any node to open an entity detail panel showing all properties, labels, and connections with relationship types and directions.

### `components/DecisionTracePanel.tsx`

Displays pre-seeded decision traces loaded from the `/traces` API endpoint. Each trace shows the task, reasoning steps (thought, action, observation), and final outcome. Traces are loaded from `:DecisionTrace` and `:TraceStep` nodes created during `make seed`.

### `components/DocumentBrowser.tsx`

Browsable document panel with template type filter badges (e.g., Discharge Summary, Lab Report, Trade Confirmation). Lists documents with previews, and clicking a document shows full content with mentioned entity badges. Documents are loaded from `:Document` nodes created during `make seed`.

### `components/Provider.tsx`

Chakra UI v3 provider component that wraps the application with the custom theme and color mode configuration.

## Cypher

### `schema.cypher`

Auto-generated from the ontology. Contains:
- Uniqueness constraints for properties marked `unique: true`
- Name indexes on every entity type for fast lookups
- Infrastructure indexes for `Document` (title, template_id) and `DecisionTrace` (unique id) nodes

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
| `make seed` | Apply schema and load all fixture data (entities, relationships, documents, traces) into Neo4j |
| `make start` | Start both backend (port 8000) and frontend (port 3000) |
| `make backend` | Start only the FastAPI backend |
| `make frontend` | Start only the Next.js frontend |
| `make import` | Re-import data from connected SaaS services (if connectors enabled) |
| `make generate` | Regenerate synthetic demo data |
| `make clean` | Remove generated artifacts |
