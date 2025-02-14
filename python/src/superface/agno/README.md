[Frameworks](../../../) → **Agno (Phidata)** → **Python**

# <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/agno.png" alt="Agno" width="30" height="30" /> Superface SDK for Agno (formerly Phidata)

Superface SDK lets you integrate external apps with your Agno agent using function calling.

## Installation

```sh
pip install superface
```

## Usage

Obtain your agent's secret key and connect tools you want your agent to have access to in [Superface dashboard](https://pod.superface.ai/hub/api).

```python
from superface.agno import Superface

superface = Superface(
  api_key=os.getenv("SUPERFACE_API_KEY")
)
```

Load connected tools for agent using `get_tools()` method.

```python
tools = superface.get_tools()
```

Or use directly in Agno agent definition

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat

agent = Agent(
    model=OpenAIChat(id="gpt-4o"),
    description="You are an enthusiastic stock reporter with a flair for storytelling!",
    markdown=True,
    tools=[superface.get_tools()],
    show_tool_calls=True
)

agent.print_response(
  "Tell me about current stock prices for AAPL and MSFT",
  stream=True
)
```
