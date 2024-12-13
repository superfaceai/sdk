[SDK](../) / **TypeScript**

# <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/typescript.png" alt="TypeScript" width="30" height="30" /> Superface SDK

## Installation

```sh
npm install superface
```

## Usage

### <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/openai.png" alt="OpenAI" width="16" height="16"> OpenAI

To use Superface with OpenAI follow steps in [README](./src/openai/).

### <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/superface.png" alt="Superface" width="16" height="16" /> Client

To manually handle all interactions with Superface API, we have prepared client.More on how to use it in [README](./src/client/).

## Environment variables

`SUPERFACE_API_KEY` this value is used to authenticate clients to Superface API

`SUPERFACE_CACHE_TIMEOUT` Set in miliseconds to change cache of tools definitions. By default they are valid for 60000ms.

`SUPERFACE_MAX_RETRIES` Max retries to communicate with Superface servers. affects `getTools` and `runTool` functions.

## Examples

For more examples see [typescript/examples](./examples) folder.

## License

This project is licensed under the MIT license. See the [LICENSE](../LICENSE) file for details.