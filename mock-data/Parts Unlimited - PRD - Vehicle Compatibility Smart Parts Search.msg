From: Sarah Chen (Product Manager)
To: David Kowalski (Engineering Lead), Maria Santos (UX Lead), James Hartley (VP of Sales)
Date: February 10, 2026
Subject: Idea: Vehicle Compatibility Search for Parts Unlimited
Hi team,
I've been reviewing our Q4 support tickets and noticed that 34% of returns are due to customers ordering incompatible parts. They're browsing the catalog, picking something that looks right, and then finding out it doesn't fit their vehicle.
I think we need an AI-powered vehicle compatibility and smart parts search feature. The idea is:
Customers enter their vehicle (year, make, model, engine/trim).
We store it in a "My Garage" profile.
Every product page shows a clear "Fits your vehicle" / "Does not fit" badge.
Search results are automatically filtered to compatible parts.
This would reduce returns, increase conversion, and put us on par with competitors like AutoZone and RockAuto who already offer this.
Thoughts? Worth exploring for the next planning cycle?
— Sarah
From: James Hartley (VP of Sales)
To: Sarah Chen, David Kowalski, Maria Santos
Date: February 10, 2026
Subject: RE: Idea: Vehicle Compatibility Search for Parts Unlimited
Sarah, this is a must-have. Our sales team hears about fitment issues constantly. The 34% return rate number is painful — that's real money lost on reverse logistics alone.
I'd also suggest we integrate this with the Membership and Rewards Program (Epic #168). Logged-in members could save multiple vehicles in their garage, making repeat purchases frictionless.
Can we get a rough estimate on data sourcing? We'd need a comprehensive vehicle-to-part fitment database.
— James
From: David Kowalski (Engineering Lead)
To: Sarah Chen, James Hartley, Maria Santos
Date: February 11, 2026
Subject: RE: Idea: Vehicle Compatibility Search for Parts Unlimited
Great idea. Here's my initial technical thinking:
Fitment data: We can license ACES (Aftermarket Catalog Exchange Standard) data, which is the industry standard. Covers year/make/model/engine mapping to part numbers.
Smart search: We can use Azure AI Search with semantic ranking so customers can type natural queries like "brake pads for 2019 Honda Civic EX" and get accurate results.
"My Garage": Store vehicle profiles per user account. We'll need a new microservice and a few new API endpoints, plus UI components on the product pages and search.
Compatibility badge: Real-time lookup against the fitment database when a user has an active garage vehicle selected.
Rough estimate: 8–10 sprints for an MVP (search + garage + badges). We could phase it — Phase 1 is basic year/make/model dropdown + compatibility filtering, Phase 2 adds AI-powered natural language search.
One dependency: this will touch the Product Catalog (Epic #170) data model since we need to associate fitment attributes with each SKU.
— David
From: Maria Santos (UX Lead)
To: Sarah Chen, David Kowalski, James Hartley
Date: February 12, 2026
Subject: RE: Idea: Vehicle Compatibility Search for Parts Unlimited
Love this direction. From a UX perspective:
First-time visitors should get a prominent "Select Your Vehicle" banner on the homepage.
Returning users see their saved vehicle with a quick-switch dropdown if they have multiple vehicles in the garage.
On product pages, the compatibility badge should be above the fold, right next to the price. Green checkmark for "Fits", red X for "Does not fit", gray for "Not verified."
Search results should show a filter chip like "Showing results for: 2019 Honda Civic EX" with a one-click option to remove the filter.
I can have wireframes ready by end of next week. Should I set up a design review?
— Maria
From: Sarah Chen (Product Manager)
To: David Kowalski, Maria Santos, James Hartley
Date: February 14, 2026
Subject: RE: Idea: Vehicle Compatibility Search for Parts Unlimited
This is all coming together nicely. Let me summarize the action items:
Maria — Wireframes for garage selector, product page badge, and search integration by Feb 21.
David — Spike on ACES data licensing and Azure AI Search feasibility, plus size the effort for Sprint planning.
James — Pull the exact return-rate-by-reason data from the warehouse team so we can build the business case.
Sarah (me) — I'll create the Epic on Azure DevOps with acceptance criteria and link it to the existing Product Catalog and Membership epics.
Target: Epic ready for backlog refinement by Feb 28. If the business case holds up, we aim for Phase 1 MVP in Q2 2026.
Thanks everyone — excited about the impact this could have!
— Sarah
