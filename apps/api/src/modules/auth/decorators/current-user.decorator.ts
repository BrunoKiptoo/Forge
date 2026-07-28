import { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: keyof Express.User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as Express.User | undefined;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
