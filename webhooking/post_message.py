import requests

URL = "https://discord.com/api/webhooks/1150476936167034910/YCqa5nvvcoZ8pTpozIcZESmJDR3V74zli49XNMhbvWxu0PCw8MNaD2tZb5DA5TAy6JYq"
REQUEST_TIMEOUT = 30 # seconds

def main():
    print("Manual Discord webhook")

    name = input('Name of this webhook. "Site Update" if empty.\n')

    if name == "":
        name = "Site Update"

    content = input("Content:\n")

    send_common = input("Send the URL and a reminder to clear cache/history? Y/N\n")

    if send_common in ("y", "yes"):
        content += "\n\n[Site Link](https://undonepotato.github.io/penguin-union)"
        content += "\nClear your cache or browser history if the changes don't show up after about 5 minutes."
    else:
        print("Was not attached\n")

    data = {
        "name": name,
        "content": content,
        "type": 1,
        "channel_id": "1137510090887405648",
        "avatar": None,
        "guild_id": "1136754961645047828",
        "id": "1150482005675479080",
        "application_id": None,
    }

    print(f'Name: "{name}"\nContent: "{content}".')

    send_confirm = input("Send? Y/N\n").lower()

    if send_confirm in ("y", "yes"):
        resp = requests.post(URL, data, timeout=REQUEST_TIMEOUT)
        print("Response: HTTP " + str(resp.status_code))
        resp.raise_for_status()
    else:
        print("Message not sent.")


if __name__ == "__main__":
    main()
