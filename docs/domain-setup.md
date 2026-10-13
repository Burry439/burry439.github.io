# baruchweinstein.com

Connected on 2026-10-13 to GitHub Pages in `Burry439/burry439.github.io`.
The repository's custom domain is `baruchweinstein.com`. DNS changes were saved
through the owner's signed-in Edge session using native Computer Use.
Both the GoDaddy editor and its authoritative nameserver confirm the records below;
Cloudflare's public resolver also returns the four GitHub Pages addresses.
GitHub approved the certificate for the apex and `www` on 2026-10-13;
its reported expiry is 2027-01-11. HTTPS enforcement is enabled.
TLS validation succeeds at the GitHub Pages server for both hosts. HTTP redirects
to HTTPS, and `www` redirects to the apex while preserving case-study paths.
Resolvers may retain the previous GoDaddy addresses until their cached TTL expires.
No credentials belong in this repository or chat.

Saved DNS records, using GoDaddy's existing nameservers:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | Default |
| A | @ | 185.199.109.153 | Default |
| A | @ | 185.199.110.153 | Default |
| A | @ | 185.199.111.153 | Default |
| CNAME | www | burry439.github.io | Default |

The WebsiteBuilder apex record was replaced. Nameservers, SOA, `_domainconnect`
and `_dmarc` were preserved. The full original zone contained no MX records.

The domain was first claimed in the repository's Pages custom-domain setting,
before saving DNS changes. Certificate approval and HTTPS enforcement were verified
using GitHub's Pages API and TLS-validating requests. The Pages workflow's `configure-pages` output
updates canonical URLs and the sitemap to the configured domain automatically.
GitHub Actions publishing does not require a CNAME file in the build.

Sources:
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://www.godaddy.com/help/add-or-edit-an-a-record-42546
- https://classic-developer.godaddy.com/mcp
