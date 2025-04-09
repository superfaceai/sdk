from typing import Any, Type, Optional, Union
from pydantic import BaseModel, Field, create_model
from enum import Enum

def json_schema_to_pydantic(schema: dict[str, Any]) -> Type[BaseModel]:
    type_mapping = {
        "string": str,
        "integer": int,
        "number": float,
        "boolean": bool,
        "array": list,
        "object": dict,
    }

    properties = schema.get("properties", {})
    required_fields = schema.get("required", [])
    model_fields = {}

    for field_name, field_props in properties.items():
        json_type = field_props.get("type", "string")
        enum_values = field_props.get("enum")
        
        # Determine field type
        if enum_values:
            field_type = Enum(f"{field_name.capitalize()}Enum", {v: v for v in enum_values})
        elif isinstance(json_type, list):
            mapped_field_types = [type_mapping.get(t, Any) for t in json_type if t != "null"]
            field_type = Union[tuple(mapped_field_types)] if mapped_field_types else Any
        else:
            field_type = type_mapping.get(json_type, Any)

        # Handle nullable and optional fields
        nullable = field_props.get("nullable", False) or (isinstance(json_type, list) and "null" in json_type)
        if nullable:
            field_type = Optional[field_type]
        
        # Set default value
        default_value = field_props.get("default", None if field_name not in required_fields else ...)
        
        # Create field with metadata
        model_fields[field_name] = (field_type, Field(
            default_value, 
            description=field_props.get("title", "")
        ))

    return create_model(schema.get("title", "Schema"), **model_fields)
