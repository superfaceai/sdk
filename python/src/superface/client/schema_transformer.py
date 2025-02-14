from typing import Any, Type, Optional
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

        if enum_values:
            enum_name = f"{field_name.capitalize()}Enum"
            field_type = Enum(enum_name, {v: v for v in enum_values})
        else:
            field_type = type_mapping.get(json_type, Any)

        default_value = field_props.get("default", ...)
        nullable = field_props.get("nullable", False)
        description = field_props.get("title", "")

        if nullable:
            field_type = Optional[field_type]

        if field_name not in required_fields:
            default_value = field_props.get("default", None)

        model_fields[field_name] = (field_type, Field(default_value, description=description))

    return create_model(schema.get("title", "Schema"), **model_fields)