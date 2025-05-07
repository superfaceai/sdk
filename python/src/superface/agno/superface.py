import json
import typing as t
from enum import Enum

from agno.tools import Toolkit, Function

from inspect import Parameter, Signature

from ..client import Superface as SuperfaceClient, SuperfaceTool

class Superface:
    def __init__(self, api_key: str):
        self.client = SuperfaceClient(api_key=api_key)

    def get_tools(self, user_id: str = 'me') -> Toolkit:
        original_tools = self.client.get_tools(user_id=user_id)

        toolkit = Toolkit(name="SuperfaceToolkit")

        for superface_tool in original_tools:
            toolkit.functions[superface_tool.name] = self.map_to_agno_tool(superface_tool)
        
        return toolkit
    
    def map_to_agno_tool(self, superface_tool: SuperfaceTool) -> Function:
        def tool_fn(__sf_tool = superface_tool, **kwargs) -> str:
            tool_response = __sf_tool.run(kwargs)
            return json.dumps(tool_response)

        tool_params = json_schema_to_signature(superface_tool.input_schema_raw)
        annotations = { p.name: p.annotation for p in tool_params }
        annotations["return"] = str

        # Because Agno depends on the function's metadata (signature & annotations)
        # for running the function, we add the basic (top-level) parameters to the function.
        tool_fn.__name__ = superface_tool.name
        tool_fn.__doc__ = superface_tool.description
        tool_fn.__signature__ = Signature(tool_params)
        tool_fn.__annotations__ = annotations

        print(f"superface_tool.input_schema_raw before: {superface_tool.input_schema_raw}")
        # set type to all properties if not present
        for prop, value in superface_tool.input_schema_raw['properties'].items():
            print(f"prop: {prop}")
            print(f"value: {value}")
            if 'type' not in value:
                value['type'] = 'string'

        print(f"superface_tool.input_schema_raw after: {superface_tool.input_schema_raw}")

        ggg = superface_tool.input_schema_raw
        if 'type' not in ggg:
            ggg['type'] = 'string'

        # ... however the full JSON schema and description that's used
        # in LLM is passed here.
        agno_tool = Function(
            name=superface_tool.name,
            description=superface_tool.description,
            parameters=ggg,
            entrypoint=tool_fn,
            sanitize_arguments=True,
        )

        return agno_tool

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

def json_schema_to_signature(schema: dict) -> t.List[Parameter]:
    type_mapping = {
        'integer': "integer",
        'number': "number",
        'string': "string",
        'boolean': "boolean",
        'array': "array",
        'object': "object",
    }
    
    required_parameters = []
    optional_parameters = []

    required_params = schema.get("required", [])
    schema_properties = schema.get("properties", {})
    
    if 'properties' in schema:
        for param_name, param_schema in schema_properties.items():
            param_type = param_schema.get('type', "string")
            print(f"param_name: {param_name}")
            print(f"param_type: {param_type}")
            print(f"param_schema: {param_schema}")
            
            if isinstance(param_type, list):
                mapped_types = [type_mapping.get(pt, "string") for pt in param_type if pt != "null"]
                print(f"mapped_types: {mapped_types}")
                annotation = t.Union[tuple(mapped_types)] if mapped_types else t.AnyStr
                print(f"annotation: {annotation}")
            else:
                annotation = type_mapping.get(param_type, "string")
                print(f"annotation: {annotation}")
            # default_value = param_schema.get("default", "Celsius")
            default_value = param_schema.get("default", None)
            print(f"default_value: {default_value}")
            is_required = param_name in required_params or param_schema.get(
                "required", False
            )
            
            param = Parameter(
                name=param_name,
                kind=Parameter.POSITIONAL_OR_KEYWORD,
                default=Parameter.empty if is_required else default_value,
                annotation=annotation if is_required else t.Optional[annotation]
            )

            if is_required:
                required_parameters.append(param)
            else:
                optional_parameters.append(param)
    
    return required_parameters + optional_parameters
