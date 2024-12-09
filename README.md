[Website](https://superface.ai) | [Documentation](https://docs.superface.ai) | [Twitter](https://twitter.com/superfaceai) | [Support](mailto:support@superface.ai)

<img src="https://github.com/superfaceai/sdk/raw/main/docs/LogoGreen.png" alt="Superface" width="100" height="100">

# Superface SDK

Superface SDK to integrate intelligent tools to your Agent.

## Supported languages and frameworks

* [🦄 JavaScript/TypeScript](./typescript/)
  * [Client](./typescript/src/client/) Low level client to interact with Superface toolkit
  * [OpenAI](./typescript/src/openai/) Wrapper on Superface Client for streamlined use with [OpenAI TypeScript and JavaScript API Library](https://github.com/openai/openai-node)
* [🐍 Python](./python/)

## How it works

```mermaid
sequenceDiagram
    participant u as User
    participant a as Agent
    participant sf as Superface
    participant l as LLM
    u ->>+ a: Interacts with Agent
    a ->>+ sf: Fetch installed tools
    sf ->>- a: Returns tool definitions
    a ->>+ l: Passes prompt and tool definitions to LLM
    l ->>- a: Requests tool calls
    loop Tool Execution
        a ->>+ sf: Requests tool run
        opt Authentication Required
            sf ->> a: Tool authentication required
            a ->> u: Notify user to authenticate via provided URL
            u ->> sf: Visits to complete authentication (e.g., OAuth flow, API key setup)
            alt with returnTo
                sf ->> a: Confirms authentication success (by redirecting user to Agent)
            else without returnTo
                u ->> a: Must notify agent to resume work
            end
        end
        sf ->>- a: Returns tool call result (success or failure)
    end
    a ->>+ l: Formats tool results and sends it to LLM
    l ->>- a: Provides final response
    a ->>- u: Displays result
```