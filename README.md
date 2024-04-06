# Skyjo monorepo

This is a monorepo with [turborepo](https://turbo.build/repo) for my Skyjo game project. It contains two folders: `apps` and `packages`.

## What is Skyjo?

Skyjo is a card game where players try to get the lowest score possible by collecting cards with low values. The game is played with a deck of 150 cards, each with a value between -2 and 12. Players start with 12 cards in front of them, and the goal is to replace high-value cards with lower ones. The game ends when one player has replaced all their cards, and the player with the lowest score wins.

You can check the rules [here](https://skyjo.online/rules).

## Apps

The `apps` folder contains the different applications that are part of the project. Currently, there are :

- [api](./apps/api/README.md): The API for the game, built with [Hono](https://hono.dev/) and [socket.io](https://socket.io/)
- [web](./apps/web/README.md): The web client for the game, built with [Next.js](https://nextjs.org/) and [shadcn/ui](https://ui.shadcn.com/)

## Packages

The `packages` folder contains the different packages that are part of the project. Currently, there are :

- `shared`: A package containing common code shared between the different applications (e.g. types, [zod](https://zod.dev/) schema, etc.)
