dev:
    pnpm dev

build:
    pnpm build

start:
    pnpm start

_lint:
    pnpm biome check --write .

_typecheck:
    pnpm tsc --noEmit

_deadcode:
    pnpm knip

check: _lint _typecheck _deadcode

generate:
    pnpm generate
