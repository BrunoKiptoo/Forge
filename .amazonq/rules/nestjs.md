# NestJS Rules

## Imports

Never use `import type` for any class that participates in NestJS dependency injection — this includes services, repositories, guards, strategies, and any class used as a constructor parameter.

`import type` is erased at compile time. NestJS resolves dependencies using runtime constructor metadata (via `reflect-metadata`). When the import is erased, the token becomes `Function` and DI fails with `UnknownDependenciesException`.

**Wrong:**
```ts
import type { UserRepository } from '../../core/database/repositories';
```

**Correct:**
```ts
import { UserRepository } from '../../core/database/repositories';
```

`import type` is only safe for interfaces, type aliases, and enums used purely as type annotations with no runtime presence.
