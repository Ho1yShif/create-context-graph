---
sidebar_position: 1
title: "Your First Context Graph App"
---

# Your First Context Graph App

This tutorial walks you through creating a context graph application from scratch, starting it up, and exploring its features. By the end, you will have a running app with a Neo4j knowledge graph, a FastAPI backend with an AI agent, and a Next.js frontend with graph visualization.

## Prerequisites

Before you begin, make sure you have:

- **Python 3.11+** -- check with `python --version`
- **Node.js 18+** -- check with `node --version`
- **Docker** -- required for running Neo4j. Check with `docker --version`
- **uv** (recommended) -- install with `curl -LsSf https://astral.sh/uv/install.sh | sh`

## Step 1: Create the Project

Run the CLI to launch the interactive wizard:

```bash
uvx create-context-graph
```

The wizard walks you through seven steps:

1. **Project name** -- enter a name like `my-health-app`
2. **Domain** -- select from 22 built-in domains (e.g., Healthcare)
3. **Agent framework** -- choose your preferred framework (e.g., PydanticAI)
4. **Data sources** -- optionally connect SaaS integrations (Gmail, Slack, etc.)
5. **Demo data** -- select yes to include pre-generated fixture data
6. **Neo4j connection** -- configure or use defaults (`bolt://localhost:7687`)
7. **API keys** -- provide keys for your chosen agent framework

The tool generates a complete project in your chosen directory.

### Non-Interactive Alternative

If you prefer to skip the wizard, pass all options as flags:

```bash
uvx create-context-graph my-health-app \
  --domain healthcare \
  --framework pydanticai \
  --demo-data
```

## Step 2: Start the App

Navigate to your new project and use the provided Makefile to get everything running:

```bash
cd my-health-app
```

**Install dependencies** for both the backend and frontend:

```bash
make install
```

**Start Neo4j** using Docker:

```bash
make docker-up
```

This launches a Neo4j container with the default credentials (`neo4j`/`password`). Wait a few seconds for it to become available.

**Seed the database** with your domain schema and demo data:

```bash
make seed
```

This creates the graph schema (constraints and indexes) and loads the fixture data into Neo4j.

**Start the application** (backend and frontend):

```bash
make start
```

## Step 3: Explore the App

With everything running, you have three interfaces to explore:

### Frontend -- http://localhost:3000

The Next.js frontend provides:

- **Chat interface** -- talk to your AI agent using natural language. The agent uses domain-specific tools to query the knowledge graph and return answers.
- **Context graph view** -- an interactive NVL graph visualization showing entities and relationships. Nodes are color-coded by type and sized by importance.
- **Decision trace panel** -- see the agent's step-by-step reasoning, including which tools it called and what data it retrieved.

### Backend API -- http://localhost:8000/docs

The FastAPI backend exposes a Swagger UI with all available endpoints. Key routes include:

- `POST /chat` -- send a message to the agent
- `GET /graph` -- retrieve graph data for visualization
- `GET /health` -- check service status

### Neo4j Browser -- http://localhost:7474

Connect to the Neo4j Browser to explore your graph directly. Use the default credentials (`neo4j`/`password`) and run Cypher queries. A good starting point:

```cypher
MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100
```

## Step 4: Try Demo Scenarios

Each domain comes with pre-built demo scenarios to showcase the agent's capabilities. For the healthcare domain, try these prompts in the chat interface:

**Patient lookup:**
- "Show me all patients currently diagnosed with Type 2 Diabetes"
- "What medications is patient Johnson currently taking?"

**Clinical decision support:**
- "Are there any contraindicated medications in patient Chen's current prescriptions?"
- "What treatments have been most effective for similar patients with heart failure?"

**Provider network:**
- "Which cardiologists are affiliated with Memorial Hospital?"
- "Show the referral network for Dr. Johnson"

Watch the decision trace panel as the agent processes each query -- you will see it select tools, execute Cypher queries against Neo4j, and synthesize the results into a response.

## What's Next

- **[Customizing Your Domain Ontology](./customizing-domain-ontology)** -- modify entity types, relationships, and agent tools to fit your use case.
