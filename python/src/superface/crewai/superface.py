from crewai.tools.structured_tool import CrewStructuredTool

from ..client import Superface as SuperfaceClient

class Superface:
    def __init__(self, api_key: str):
        self.client = SuperfaceClient(api_key=api_key)

    def get_tools(self, user_id: str):
        original_tools = self.client.get_tools(user_id=user_id)

        crewai_tools = []
        
        for superface_tool in original_tools:
            tool = CrewStructuredTool.from_function(
                name=superface_tool.name,
                description=superface_tool.description,
                args_schema=superface_tool.input_schema,
                func=lambda __sf_tool=superface_tool, **kwargs: __sf_tool.run(kwargs)
            )
            
            crewai_tools.append(tool)
        
        return crewai_tools
