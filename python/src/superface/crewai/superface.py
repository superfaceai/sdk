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

    def is_tool_connected(self, user_id: str, tool_name: str) -> dict:
        """
        Check if a tool is connected for a user
        
        Args:
            user_id: User ID to check
            tool_name: Name of the tool to check
            
        Returns:
            Object containing provider ID and connection status
            
        Raises:
            SuperfaceException: If the request fails
        """
        return self.client.is_tool_connected(user_id=user_id, tool_name=tool_name)
