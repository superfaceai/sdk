# Superface SDK

## How it works

```mermaid
sequenceDiagram
    participant u as User
    participant a as Agent
    participant sf as Superface
    participant l as LLM
    u ->>+ a: Interacts with Agent
    a ->>+ sf: Fetch installed tools and profiles
    sf ->>- a: Returns tool and profile definitions
    a ->>+ l: Passes prompt with tool definitions to LLM
    l ->>- a: Requests specific tool calls
    loop Tool Execution
        a ->>+ sf: Executes tool call
        opt Authentication Required
            sf ->> a: Tool authentication required
            a ->> u: Notify user to authenticate via provided URL
            u ->> sf: Completes authentication (e.g., OAuth flow, API key setup)
            alt with returnTo
                sf ->> a: Confirms authentication success (redirecting user to Agent)
            else without returnTo
                u ->> a: Must notify agent to resume work
            end
        end
        sf ->>- a: Returns tool call result (success or failure)
    end
    a ->>+ l: Formats tool results and sends to LLM
    l ->>- a: Provides final response
    a ->>- u: Displays result to the user
```

## Supported languages and frameworks

* [🦄 JavaScript/TypeScript](./typescript/)
  * [Client](./typescript/src/client/) Low level client to interact with Superface toolkit
  * [OpenAI](./typescript/src/openai/) Wrapper on Superface Client for streamlined use with [OpenAI TypeScript and JavaScript API Library](https://github.com/openai/openai-node)
* [🐍 Python](./python/)
