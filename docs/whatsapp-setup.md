# WhatsApp Business Platform setup

Roastin uses WhatsApp for two transactional purposes only:

1. verify the report owner with a six-digit one-time code;
2. deliver the private seven-day report link after payment.

No email provider is used.

## 1. Create the Meta assets

In Meta for Developers, create or select a Business app and add the WhatsApp product. Connect it to:

- a Meta business portfolio;
- a WhatsApp Business Account (WABA);
- a business phone number dedicated to the Cloud API, or migrated through Meta's supported flow.

The test number and temporary token from the WhatsApp Getting Started panel are sufficient for an initial sandbox test. Before production, create a system-user access token with:

- `whatsapp_business_messaging`;
- `whatsapp_business_management`.

Store the token in the deployment secret manager. Never commit it or paste it into issues, pull requests or chat.

## 2. Create the message templates

Create and submit these templates in WhatsApp Manager.

### `roastin_login_code`

- Category: Authentication
- Language used initially: `en_US`
- Code expiry: 10 minutes
- Button: copy code / one-time passcode
- Parameters: the application sends the same six-digit code to the body and button components

### `roastin_report_ready`

- Category: Utility
- Language used initially: `en_US`
- Suggested body: `Your private Roastin report is ready: {{1}}`
- Parameter `{{1}}`: a private delivery URL that expires after seven days

Set `WHATSAPP_REPORT_TEMPLATE_LANGUAGE=en_US` until every product locale has an approved translation. Once translations exist, leave it empty so the application selects `de`, `en_US`, `es`, `fr`, `it`, `nl`, `pt_PT` or `pt_BR` from the report locale.

## 3. Configure the webhook

After the application has a public HTTPS domain, configure this callback in the Meta app:

```text
https://YOUR_DOMAIN/api/whatsapp/webhook
```

Use the locally generated `WHATSAPP_VERIFY_TOKEN` as the verification token and subscribe the WABA app to the `messages` webhook field. The endpoint:

- answers Meta's GET verification challenge;
- verifies POST payloads with `X-Hub-Signature-256` and `WHATSAPP_APP_SECRET`;
- records sent, delivered, read and failed statuses idempotently.

## 4. Set deployment secrets

Copy `.env.example` to the deployment secret manager and set:

```text
WHATSAPP_GRAPH_VERSION=v26.0
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_AUTH_TEMPLATE_NAME=roastin_login_code
WHATSAPP_AUTH_TEMPLATE_LANGUAGE=en_US
WHATSAPP_REPORT_TEMPLATE_NAME=roastin_report_ready
WHATSAPP_REPORT_TEMPLATE_LANGUAGE=en_US
NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER=
```

`NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER` is the digits-only number opened by the Contact page, for example `33612345678`.

## 5. Validate before launch

- Add a test recipient in the Meta dashboard.
- Request an OTP from `/login` and verify it arrives with the copy-code button.
- Complete one Stripe test payment and verify that the report link arrives only on the authenticated number.
- Confirm the Meta webhook updates delivery status from `SENT` to `DELIVERED` or `READ`.
- Replace the temporary token with a system-user token before public traffic.
- Keep `ALLOW_DEV_OTP=false` outside local development.
