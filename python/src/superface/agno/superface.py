import json
import typing as t

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

        # ... however the full JSON schema and description that's used
        # in LLM is passed here.
        agno_tool = Function(
            name=superface_tool.name,
            description=superface_tool.description,
            parameters=superface_tool.input_schema_raw,
            entrypoint=tool_fn,
            sanitize_arguments=True,
        )

        return agno_tool


def json_schema_to_signature(schema: dict) -> t.List[Parameter]:
    required_parameters = []
    optional_parameters = []

    required_params = schema.get("required", [])
    schema_properties = schema.get("properties", {})
    
    if 'properties' in schema:
        for param_name, param_schema in schema_properties.items():
            param_type = param_schema.get('type', 'any')
            
            if param_type == 'integer':
                annotation = int
            elif param_type == 'number':
                annotation = float
            elif param_type == 'string':
                annotation = str
            elif param_type == 'boolean':
                annotation = bool
            elif param_type == 'array':
                annotation = list
            elif param_type == 'object':
                annotation = dict
            else:
                annotation = t.Any
            
            default_value = param_schema.get("default", None)

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

