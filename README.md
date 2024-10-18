<a href="https://www.skyjo.online" style="display: flex; align-items: center; justify-content: center; padding-bottom: 16px;">
<img src="https://www.skyjo.online/svg/logo.svg" alt="Skyjo Online" width="160" />
</a>

<div style="display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap;">

![Sonar Quality Gate (branch)](https://img.shields.io/sonar/quality_gate/maxentr_skyjo/trunk?server=https%3A%2F%2Fsonarcloud.io)

![Sonar Tech Debt (branch)](https://img.shields.io/sonar/tech_debt/maxentr_skyjo/trunk?server=https%3A%2F%2Fsonarcloud.io)

![Weblate project translated](https://img.shields.io/weblate/progress/skyjo-online)

![GitHub License](https://img.shields.io/github/license/maxentr/skyjo)
</div>

This repository contains the code of [skyjo.online](https://www.skyjo.online), the online version of the popular card game Skyjo.

## What is Skyjo?

Skyjo is an engaging card game that combines strategy, luck, and quick thinking. For more information, visit [skyjo.online/rules](https://www.skyjo.online/rules).

## Project Structure

This project is organized as a monorepo using [Turborepo](https://turbo.build/repo), consisting of:

### Apps

- **api**: The game server built with [Hono](https://hono.dev/) and [Socket.IO](https://socket.io/)
- **web**: The web client created with [Next.js](https://nextjs.org/) and [shadcn/ui](https://ui.shadcn.com/)

### Packages

- **shared**: Common code, types, and [Zod](https://zod.dev/) schemas used across applications
- **database**: Database models and queries implemented with [Drizzle ORM](https://drizzle.dev/)

## Localization

Thank you to [Weblate](https://hosted.weblate.org/engage/skyjo-online/) who hosts our localization infrastructure. If you want to see Skyjo Online in your language, please help us localize.

<a href="https://hosted.weblate.org/engage/skyjo-online/">
<img src="https://hosted.weblate.org/widget/skyjo-online/web/horizontal-auto.svg" alt="Translation status" />
</a>
