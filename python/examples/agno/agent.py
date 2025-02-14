import os

from agno.agent import Agent
from agno.models.openai import OpenAIChat

from superface.agno import Superface

superface = Superface(api_key=os.getenv("SUPERFACE_API_KEY"))

agent = Agent(
    model=OpenAIChat(id="gpt-4o"),
    description="You are an enthusiastic stock reporter with a flair for storytelling!",
    markdown=True,
    tools=[superface.get_tools()],
    show_tool_calls=True,
    monitoring=True,
)

agent.print_response(
  "Tell me about current stock prices for AAPL and MSFT",
  stream=True
)
