# PRD — AI 30-Sec Commercial Video Generator

## Problem
Content creation teams spend days scripting, storyboarding, and producing 30-second commercial ads. There is no unified workflow that takes a raw brief and produces a finished AI-generated video with client-ready quality tracking.

## Target Users
Internal content creation team (writers, producers, reviewers, team leads). Multi-user, shared workspace, role-based.

## Core Objects
- **Brief** — raw client input (brand, product, goal, tone)
- **Story** — structured script/storyboard derived from brief
- **Scene** — individual shot within a story (prompt, voiceover, duration)
- **VideoJob** — AI generation run tied to a story (status, output URL)
- **Review** — client/internal acceptance record per VideoJob

## MVP Must-Haves (v1)
- [ ] Create a Brief with brand/product/goal/tone fields
- [ ] Generate a structured Story (scenes with prompts) from the Brief — AI-assisted, editable
- [ ] Submit a Story to AI video generation (VideoJob); poll for completion
- [ ] View generated video in-app with scene breakdown
- [ ] Mark a VideoJob as client-accepted or rejected (Review)
- [ ] Operational dashboard: all jobs, statuses, acceptance count
- [ ] Role enforcement: Creator, Reviewer, Admin

## Non-Goals (v1)
- Public client portal
- Multi-language voice synthesis
- Billing / usage metering
- Automated video publishing to social platforms

## Success Criteria
A team member creates a Brief for "FreshBrew Coffee", generates a 5-scene Story, submits it to video generation, watches the 30-second video render in-app, and logs client acceptance — all in one session, end-to-end, with the acceptance count incrementing on the dashboard.

## Definition of Done
The end-to-end scenario above completes without error: Brief → Story → VideoJob (status = completed, video URL plays) → Review (accepted) → dashboard count updates. Every form persists to DB; no dead buttons; empty/error/loading states handled.
