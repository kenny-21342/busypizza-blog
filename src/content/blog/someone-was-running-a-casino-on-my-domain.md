---
title: 'Someone was running a casino on my domain'
description: 'I asked for help building a blog. The first thing we found was that the domain already had a site on it, and it was not mine.'
pubDate: 2026-09-09
category: devlog
tags: ['dns', 'security', 'vercel']
draft: false
---

I own two domains, bought twelve minutes apart in May: `busypizza.bond` for my
tools, and `busypizza.xyz`, which I had not gotten around to using.

Except it was being used. `busypizza.xyz` was serving an Indonesian slot-gambling
SEO page, and had been since roughly the 20th of August.

## The obvious diagnosis was wrong

My first assumption was that my registrar account had been broken into and the
nameservers repointed. That is the usual story. It was not this one.

```bash
$ whois busypizza.xyz | grep -iE "updated date|name server"
Updated Date: 2026-05-16T07:52:17.0Z
Name Server: NS1.VERCEL-DNS.COM
Name Server: NS2.VERCEL-DNS.COM
```

The nameservers were `ns1`/`ns2.vercel-dns.com` — and so were the healthy domain's.
More to the point, the registry's `Updated Date` was still **2026-05-16**, three
months before the spam appeared. The delegation had never moved. Comparing the two
domains side by side is what settles it:

| | `busypizza.bond` | `busypizza.xyz` |
|---|---|---|
| Registered | 2026-05-11 | 2026-05-11 |
| Nameservers | Vercel | Vercel |
| Registry updated | 2026-05-16 | 2026-05-16 |
| In my Vercel account | yes | **no** |
| Serving | my landing page | a casino |

## What actually happened

I had pointed `busypizza.xyz` at Vercel's nameservers and then never added the
domain *inside* my Vercel account. Vercel DNS is shared anycast infrastructure:
the nameservers are the same set for every customer, and the zone that answers for
a domain is whichever account created it first.

Mine never created one. Someone else's did.

That also explains the wildcard certificate I found:

```bash
$ echo | openssl s_client -servername busypizza.xyz \
    -connect busypizza.xyz:443 2>/dev/null \
  | openssl x509 -noout -subject -dates
subject=CN=*.busypizza.xyz
notBefore=Aug 20 08:44:03 2026 GMT
```

Holding the zone means being able to answer an ACME DNS-01 challenge, which means
being able to mint a valid wildcard cert for a domain you do not own. Every
subdomain — `blog.`, `mail.`, anything — resolved to them.

The `robots.txt` was the detail that removed any doubt this was accidental:

```
User-agent: Lumen
Disallow: /
User-agent: ChillingEffects
Disallow: /
```

Those are the crawlers for the DMCA and takedown-notice transparency databases.
This was not a misconfiguration someone stumbled into. It was somebody's business,
and it was set up to be hard to report.

## The fix

Because the registrar was never compromised, the fix took about ten minutes and no
support ticket: repoint the nameservers at a zone I actually control. The moment
delegation moves, their zone stops being authoritative and the site goes dark,
regardless of what still exists on their end.

The lesson generalises past this one platform. A domain delegated to a shared
nameserver pool with no zone claimed behind it is not parked — it is unlocked. If
you are going to point a domain somewhere, finish the job the same day, or point
it nowhere at all.

This blog is the thing I originally sat down to build. It now runs on the domain
that was, briefly, a casino.
