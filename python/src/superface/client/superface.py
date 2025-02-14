from os import getenv
from typing import List

import requests
from requests.adapters import HTTPAdapter, Retry
from requests.models import Response

from .schema_transformer import json_schema_to_pydantic
from .exceptions import SuperfaceException

class SuperfaceTool:
    def __init__(self, name: str, description: str, input: dict, is_safe: bool, perform: callable):        
        self.name = name
        self.description = description
        self.is_safe = is_safe
        self.input_schema = json_schema_to_pydantic(input)
        self.input_schema_raw = input
        self.perform = perform

    def run(self, arguments: dict | None = None):
        return self.perform(arguments)

class Superface:
    def __init__(self, api_key: str):
        if (not api_key):
            raise SuperfaceException("Please provide a valid API secret token")
        
        self.api = SuperfaceAPI(api_key=api_key)

    def get_tools(self, user_id: str) -> List[SuperfaceTool]:
        function_descriptors = self.api.get(user_id=user_id, path='/fd')

        # print(f"[Superface Toolkit] Loaded {len(function_descriptors)} tools")
        
        tools = []
        
        for function_descriptor in function_descriptors:
            tool_name = function_descriptor['function']['name']
            
            def perform(arguments: dict | None, tool_name: str = tool_name):
                perform_path = f"/perform/{tool_name}"
                data = arguments if arguments else dict()
                
                return self.api.post(user_id=user_id, path=perform_path, data=data)

            tool = SuperfaceTool(
                name=tool_name,
                description=function_descriptor['function']['description'],
                input=function_descriptor['function']['parameters'],
                is_safe=False,
                perform=perform
            )
            
            tools.append(tool)
        
        return tools

class SuperfaceAPI:
    def __init__(self, *, 
                 api_key: str, 
                 base_url: str = "https://pod.superface.ai/api/hub"):
        self.api_key = api_key
        self.base_url = base_url

    def get(self, *, user_id: str, path: str):
        url = f"{self.base_url}{path}"

        s = requests.Session()

        retries = Retry(total=3,
                        backoff_factor=0.1,
                        status_forcelist=[ 500, 501, 502, 503, 504 ])

        s.mount('https://', HTTPAdapter(max_retries=retries))
        
        response = s.get(url, headers=self._get_headers(user_id))

        return self._handle_response(response)

    def post(self, *, user_id: str, path: str, data: dict):
        url = f"{self.base_url}{path}"
        
        response = requests.post(
            url,
            json=data,
            headers=self._get_headers(user_id)
        )

        return self._handle_response(response)
    
    def _handle_response(self, response: Response):
        if response.status_code >= 200 and response.status_code < 210:
            return response.json()
        elif response.status_code >=500:
            raise SuperfaceException("Something went wrong in the Superface")
        elif response.status_code == 400:
            raise SuperfaceException("Incorrect request")
        elif response.status_code == 401:
            raise SuperfaceException("Please provide a valid API token")
        elif response.status_code == 403:
            raise SuperfaceException("You don't have access to this resource")
        elif response.status_code == 404:
            raise SuperfaceException("Not found")
        elif response.status_code == 405:
            raise SuperfaceException("Something went wrong in the tool use. Please retry")
        else:
            raise SuperfaceException("Something went wrong in the agent")

    def _get_headers(self, user_id: str):
        return {
            "Authorization": f"Bearer {self.api_key}",
            "x-superface-user-id": user_id,
            "Content-Type": "application/json"
        }
