# Agno (Phidata) with Superface AI Tooling SDK

This is an example of using Superface AI Tooling with **Agno** (formerly Phidata) framework.

The example is based on [Agno's Getting started guide](https://docs.agno.com/get-started/agents#basic-agent)


1. **Install Dependencies**

    Run the following command to install the necessary dependencies:
    ```sh
    pip install -r requirements.txt
    ```

2. **Set secret API keys**
    Set up environment variables [required by Agno](https://docs.agno.com/get-started/agents#basic-agent):
    - `OPENAI_API_KEY`
    - `AGNO_API_KEY` (optional for Agno dashboard monitoring)
  
    Set up your Superface secret from [the Dashboard](https://pod.superface.ai/hub/api):
    - `SUPERFACE_API_KEY`

3. **Install Tools**

    Install the required tools (e.g., Google Calendar) by visiting [Superface](https://pod.superface.ai/hub/api).

4. **Run the Agent**

    Start the agent with the following command:
    ```sh
    python3 agent.py
    ``