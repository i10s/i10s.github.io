---
title: Data is the input. Decisions are the product.
date: 2026-11-06
description: How we are building decision systems for new residential development at eVoost, from earned autonomy to decision history and the questions we have not answered yet.
topic: evoost
lang: en
---
Every few years the technology industry finds a word that seems to explain everything. I remember the cloud, big data, blockchain and the metaverse. Some of them described real changes. Others mainly described the hopes of the people organising the conferences. At the time it was hard to know which was which. Today the word is agentic, and I joined [eVoost](https://evoost.ai) as CTO, right in the middle of the excitement.

I am not sceptical about artificial intelligence. I use it every day and I build with it. But I have learned to be careful with anything that is presented as good simply because it is new. Novelty is a date, not a quality. And quite a lot of what is called an "autonomous agent" today turns out, when you open it, to be a prompt, three API calls and a retry loop.

So this piece is not about how many agents we plan to build. It is about something less exciting and, I think, more important: the operating model we need so that AI helps real-estate developers make better decisions, in an industry where a bad decision is measured in millions of euros and years of work.

eVoost works in new residential development. Our product already sits inside the commercial cycle of more than 1,400 homes across 35 projects, connected to the systems developers already use. The work now is to move from recording what happens towards helping decide what should happen next. What follows is how we are thinking about that change, including the parts we have not solved yet.

## The problem we start from

Real estate does not have a data shortage. Developers have feasibility studies, competitor reports, price lists, CRM records, buyer conversations, campaigns, inventory, reservations, contracts, broker reports and transaction data. They also have portals, public registries, consultants and several Excel files that contain vital knowledge understood by one person, who is currently on holiday.

The problem is that this information is fragmented, duplicated, inconsistent and spread across systems that were never designed to talk to each other. Having data is not the same as being able to decide with it.

Some years ago it became fashionable in education to say that children no longer needed to learn facts because everything was on the internet. The best answer to that idea was also the simplest: you cannot search for what you do not know you are missing. Judgement needs knowledge that is already organised inside you. I think the same is true for AI systems. Access to data is not understanding.

This is why the first layer of our architecture is what we call the Data Core. Its job is to build a reliable picture of reality before anyone asks it for an answer. It deals with the unglamorous questions. Do these two records describe the same property? Which source should we trust when they disagree? How has this price changed over time? What did this street used to be called?

Building this kind of market-data infrastructure has already taught us two lessons. First, most of the work is in the plumbing, not in the model. Second, we must be careful about what the data really says. An asking price is useful information, but it is not a transaction price, and we should not present one as the other.

## What we mean by "agentic"

The word agent has become so broad that it only helps if we define it. Internally we use three levels, and the distinction matters more than the names.

An agent is a specialised component that works towards a goal: it can reason, use tools, keep some context and adapt across several steps.

An engine is a system responsible for a class of business decisions. Inside it there may be agents, but also foundation models, classical machine learning, optimisation, deterministic rules and the customer's own systems. The engine is defined by the decision it owns, not by the technology it uses.

Gravity, which we launched in June as Gravity OS, is the shared environment that connects the engines: the context, memory and permissions they all share.

The practical rule we try to follow is modest: use the simplest system that does the job reliably. A good craftsman does not use a power tool where a chisel is enough, and our industry has a long tradition of building a distributed system to solve a problem that a function could have solved. Some of our work will be plain code. Some will be statistics. Some will need a language model to interpret a messy conversation. And some will need a real agent that plans, uses tools and adapts. Calling all of it "agentic" would make our slides look better and our engineering worse. A developer needs a prudent system. Cleverness is optional.

## Three engines, one lifecycle

We organise the product around three decision engines. Each one starts from a question.

Market Intelligence: what should we build, where, for whom and at what price? It combines location, competing supply, demand, prices, absorption and past projects. The output we want is a set of decisions someone can argue with and check later: a unit mix, target buyers, price ranges and expected absorption.

Matching: who should buy what? It works in both directions. For a buyer, which available homes fit best? For a specific home, which buyers are most relevant? Matching has to be dynamic. If a buyer's behaviour changes, the match changes. If a price or the inventory changes, the recommendations change too.

Revenue: what should we do now to get the best economic result from the inventory that is still for sale? This is the uncomfortable period after the launch event, when reality starts giving its opinion. A weak answer here is "sales of three-bedroom units have slowed". A useful one explains why, which units are affected, whether the problem is price or demand, whether an incentive makes sense, which buyers deserve attention and what action we recommend.

Each engine must be useful on its own. A customer should be able to start with Revenue on one live project, or with Matching for one sales team, without adopting everything. Gravity is not a fourth engine, and it is certainly not one giant agent that knows everything. It is what appears when the engines share data, context and memory, so that the lifecycle becomes connected: market, product, buyer, behaviour, match, price, transaction, outcome and, finally, the next project.

Nobody buys a house because they admire the plumbing, although everybody becomes very interested in the plumbing when it stops working. The customer should not need to know which engine, model or agent is behind a recommendation. They should need to know why it was made and how confident we are.

## Entering without removing fences

G. K. Chesterton described a reformer who finds a fence across a road and wants to remove it because he cannot see what it is for. The sensible answer, Chesterton said, is: first find out why it was put there.

Developers already have systems. Some are good, some are less good, and some are hated by everyone and considered impossible to replace at the same time. They survive for reasons that nobody wrote down. For a startup, ignoring those fences is expensive. If eVoost needs months of integration, many workshops and a reorganisation of the customer's team before it shows any value, we do not only have an implementation problem. We have a product problem, a sales problem and eventually a capital-efficiency problem. In a startup, technical architecture, adoption, acquisition cost and margins are the same conversation held in different meeting rooms.

So we try to follow a simple sequence: connect, prove, activate, expand. We connect to what already exists, whether it is HubSpot, Dynamics, Salesforce, an ERP, a price list in a spreadsheet or a CRM built in-house fifteen years ago, ideally with read-only access. We prove value quickly, inside the tools people already use: email, WhatsApp, Teams, Slack or the CRM itself. Only then do we activate actions with human approval, and later expand to more projects and more engines.

The first version of eVoost inside a company should almost work in the background. It reads inventory, buyer behaviour, sales activity and prices without changing anything, until it has something worth saying. Some units may be selling faster than expected and should not be discounted. Another group may have a price problem rather than a demand problem. A few buyers may be much closer to a decision than the sales team thinks. And sometimes today's demand says something uncomfortable about the product mix chosen eighteen months ago.

Generic CRMs will keep adding natural-language features, summaries and generic assistants. That is good, and it means that "asking questions of the CRM" will soon be an ordinary feature. We do not want to compete there. Our work is one level above: the specifically real-estate decisions that need domain context, specialised models and a memory of what happened before.

## Autonomy is earned

When a new person joins a sales office, nobody gives them the price list and the authority to change it on the first day. They watch, then they suggest, then they decide small things, and only after being right often enough, bigger ones. Nobody finds this insulting. It is how trust works among people who have something to lose.

We apply the same idea to our systems. The ladder we use is observe, recommend, approve, execute, automate. At the beginning a system only observes. Then it recommends, and a person can accept, reject, modify or question the recommendation. Later it can execute actions after approval. Only a few decisions, with enough evidence behind them, should ever become fully automatic.

The threshold depends on what is at stake. Drafting a follow-up message and changing the price of a block of apartments are different kinds of risk and should not follow the same path. The same is true for anything that touches the personal information of buyers who talk to us by phone or WhatsApp while they think about buying a home.

This approach is slower on a slide and faster in reality. It reduces adoption risk, makes procurement easier and, importantly, produces the data we need to learn. Every disagreement between the system and a professional is information.

Trust has to be earned in the other direction too. A support team I worked with did not want an AI assistant for the people using our app, because they were convinced it was the first step towards replacing them. It did the opposite: it made them more productive.

## Deciding what "good" means before we build

The most useful question in any project is usually embarrassingly simple, which is why people avoid it: how will we know if this works? With AI systems it has to be asked before building, not after, otherwise we end up admiring the output instead of judging it.

Plato worried about the sophists, people who could make any argument sound convincing without caring whether it was true. Language models are, in a way, the most talented sophists ever built. Their answers are fluent, confident and well organised, and that is exactly the risk. An output can sound intelligent and still be wrong.

So, for each engine, we try to agree in advance what a good decision looks like and how we will measure it:

- Market Intelligence: accuracy of absorption and price assumptions, quality of scenarios and of unit-mix recommendations. Some of these results take months or years to appear, which is one of our hardest problems.
- Matching: real relevance, buyer engagement, acceptance of recommendations, visits, reservations, conversion and reasons for rejection. A salesperson liking a match is a signal, not a result.
- Revenue: margin, sales pace, absorption, inventory ageing, forecast accuracy and, above all, improvement against a credible baseline.

For every recommendation we want to record six things: what was recommended, with what confidence, based on which evidence, how the person responded, what action was taken and what happened afterwards. Without the last one we only made a suggestion.

There will be decisions where we simply do not have enough evidence to automate safely, and the system should say so. Uncertainty is acceptable in an intelligent system. Hidden uncertainty is not.

## Decision history and the long feedback loop

Much of the AI industry talks about "learning loops", and sometimes the phrase only means "we saved the conversation". The loop we care about needs reality to answer.

Imagine the system believes a group of apartments is underpriced. It recommends an increase and the commercial team accepts it. Does demand change? Does conversion slow down? Do different buyers appear? Did we improve the margin or only delay the revenue? Those answers are what turn a recommendation into learning.

This matters especially in residential development because the feedback cycles are very long. A decision about a plot of land may only show whether it was right four or five years later, and by then the sales director may have left, the CRM may have been replaced and the spreadsheet may be lost. When the three engines share memory, the outcome of one becomes evidence for the next. Market Intelligence shapes a product. The product produces real buyer behaviour. Matching sees who responds to what. Revenue learns what sells, at what price and after which actions. And all of that returns to the moment when someone decides what to build next.

The ambition is that every live project makes the next one better: first within a project, then across the projects of one developer, and only where it is legally and commercially appropriate, across markets. We are not trying to accumulate data for its own sake. We are trying to accumulate decision history. I think of it as institutional memory that actually works.

## Shared foundations, and a certain love of routine

Gravity has to do sophisticated things, but most of its value comes from unromantic foundations: identity, permissions, shared context, memory, observability, integrations, data provenance, model routing, evaluation and a clear answer to the question "which component owns this decision?". There is a quiet dignity in routine that our industry tends to forget. A new agent should not invent authentication again. A new team should not invent its own memory. No model call should disappear into a box that nobody can inspect later.

We also try not to build the company on the assumption that today's favourite model will still be the best choice in two years. Different tasks may use different providers, smaller models or no language model at all, depending on capability, latency, cost, privacy and reliability. Access to a foundation model that everyone else can also access is not an advantage. If we have one, it will come from the combination of trusted domain data, a real-estate model of projects, units, buyers and prices, decision history, outcomes and a place in the customer's daily work. The models will change. That combination has to survive them.

## What we measure, and what we do not

We do not count agents. We do not count prompts. We do not try to measure how "AI" the product is.

We try to measure whether we reduce the time needed to understand a market, improve a development decision, detect buyer intent earlier, increase conversion, price better, reduce unsold inventory or allow a customer to make the same quality of decision with less effort. And, just as seriously, we measure the cost of getting there: deployment time, integration hours, time to first useful recommendation, inference cost and how much each new account depends on people rather than on software.

That last point is important for a company like ours. It would be easy to become a very good service business with some technology inside. The test of whether we are building software is whether value per customer can grow without the team growing at the same speed. A brilliant feature that nobody opens on Monday morning is a hobby, not a product.

## What we are trying not to become

It helps to write down the things we do not want to be, because under pressure it is easy to drift towards them:

- Another CRM. Some CRM features will exist where needed, but they should serve the decision layer.
- A generic chatbot. Conversation is a useful interface, not the product.
- An AI wrapper. We should still create value if the model provider changes.
- A data reseller. Data is necessary, but our work is the step from data to decision. Third-party data providers can be inputs for us rather than competitors.
- Consulting disguised as software. Human expertise will be necessary, especially at the beginning, but what we learn in each project has to become reusable.
- One giant autonomous agent, or an agent factory where the number of agents is confused with sophistication.

## Questions we have not answered yet

I prefer to close with the questions we are still working on rather than pretend they are settled:

- How much should live inside each engine, and how much in Gravity? What is the minimum shared data model?
- What is the smallest integration that still creates real value, and can we show it in days rather than months?
- Which decisions should always remain advisory, and which can safely move towards approved or automatic execution?
- How can we evaluate long-cycle decisions, such as what to build, fast enough to improve the product?
- How do we build credible counterfactual baselines for pricing recommendations?
- What really defines a successful match, beyond clicks or a salesperson's opinion?
- How much learning across customers is legally, technically and commercially acceptable?
- Which datasets should we build ourselves, and which should we buy or integrate from partners?

None of these questions is purely technical. They touch product, economics, risk and the culture of the company. This is perhaps the part of the CTO role that is newest: besides architecture, security, reliability and hiring people better than yourself, someone has to design how intelligence moves through the organisation and through the product, and decide what intelligence is worth producing at all.

## Not an AI company

This may sound strange from the CTO of a company that builds with AI, but I do not want the adjective to become the strategy. Ten years from now, if we do our job well, nobody should be impressed that eVoost uses artificial intelligence, in the same way nobody congratulates a company today for using databases.

What should matter is that the system understands new residential development unusually well, becomes more useful as it sees more real decisions and their outcomes, can be adopted without reorganising the customer's company, and helps people see things they would otherwise miss.

If I had to choose one principle for the years ahead, it would be this: we should be ambitious about what intelligence can do, but conservative about claiming that intelligence exists before we can prove it.

The rest is architecture. And architecture, fortunately, can be changed.
