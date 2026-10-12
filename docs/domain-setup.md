# baruchweinstein.com

Purchased by the owner. The site currently uses GitHub Pages in
`Burry439/burry439.github.io`. Domain activation is pending access to GoDaddy DNS.

The installed GoDaddy integration searches available domains; it does not edit
DNS. Connection is deferred until the owner's signed-in Edge tab is available
through the browser extension. No DNS or GitHub custom-domain settings have been
changed. No credentials belong in this repository or chat.

Required DNS changes, using GoDaddy's existing nameservers:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | Default |
| A | @ | 185.199.109.153 | Default |
| A | @ | 185.199.110.153 | Default |
| A | @ | 185.199.111.153 | Default |
| CNAME | www | burry439.github.io | Default |

Replace the parked apex A records. Preserve email, verification, nameserver and
other unrelated records. Read the full zone before making changes.

When account access is available, first claim `baruchweinstein.com` in the
repository's Pages custom-domain setting, then save these DNS changes. Verify
authoritative/public DNS, wait for GitHub's certificate, enforce HTTPS, check the
apex and www redirects, and rerun the Pages workflow. Its `configure-pages` output
updates canonical URLs and the sitemap to the configured domain automatically.
GitHub Actions publishing does not require a CNAME file in the build.

Sources:
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://www.godaddy.com/help/add-or-edit-an-a-record-42546
- https://classic-developer.godaddy.com/mcp
